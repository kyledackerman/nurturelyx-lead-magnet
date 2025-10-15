import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get enrichment settings
    const { data: settings, error: settingsError } = await supabase
      .from('enrichment_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching enrichment settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enrichment settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get queue count (prospects waiting to be enriched)
    const { count: queueCount, error: queueError } = await supabase
      .from('prospect_activities')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'enriching'])
      .lt('enrichment_retry_count', 3);

    if (queueError) {
      console.error('Error fetching queue count:', queueError);
    }

    // Get count of prospects that need review
    const { count: reviewCount, error: reviewError } = await supabase
      .from('prospect_activities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'review');

    if (reviewError) {
      console.error('Error fetching review count:', reviewError);
    }

    // Get last 24h stats from audit logs for manual enrichment
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentLogs, error: logsError } = await supabase
      .from('audit_logs')
      .select('business_context, changed_at')
      .eq('table_name', 'prospect_activities')
      .gte('changed_at', twentyFourHoursAgo)
      .or('business_context.ilike.%enriched successfully%,business_context.ilike.%enrichment%');

    if (logsError) {
      console.error('Error fetching recent logs:', logsError);
    }

    // Count successes and failures from logs
    const processed = recentLogs?.length || 0;
    const succeeded = recentLogs?.filter(log => 
      log.business_context.includes('enriched successfully')
    ).length || 0;
    const failed = recentLogs?.filter(log => 
      log.business_context.includes('failed') || log.business_context.includes('moved to review')
    ).length || 0;
    
    // Get last manual enrichment job stats
    const { data: lastManualJob } = await supabase
      .from('enrichment_jobs')
      .select('total_count, success_count, completed_at')
      .eq('job_type', 'manual')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(
      JSON.stringify({
        facebook_scraping_enabled: settings.facebook_scraping_enabled || false,
        last_run: settings.last_run_at,
        last_manual_job_count: lastManualJob?.total_count || 0,
        last_manual_job_success: lastManualJob?.success_count || 0,
        queue_count: queueCount || 0,
        needs_review_count: reviewCount || 0,
        last_24h_attempts: processed,
        last_24h_successful: succeeded,
        total_enriched: settings.total_enriched
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-enrichment-stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
