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

    const { limit = 20, offset = 0, job_id } = await req.json().catch(() => ({}));

    // If job_id is provided, fetch items for that specific job
    if (job_id) {
      const { data: items, error: itemsError } = await supabase
        .from('enrichment_job_items')
        .select('prospect_id, domain, status, contacts_found, has_emails, error_message, started_at, completed_at')
        .eq('job_id', job_id)
        .order('domain', { ascending: true });

      if (itemsError) {
        console.error('Error fetching job items:', itemsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch job items' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ items }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise, fetch job history
    const { data: jobs, error: jobsError } = await supabase
      .from('enrichment_jobs')
      .select('id, job_type, status, total_count, processed_count, success_count, failed_count, started_at, completed_at, stopped_reason')
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enrichment jobs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate success rates and durations
    const enrichedJobs = jobs?.map(job => {
      const successRate = job.processed_count > 0 
        ? Math.round((job.success_count / job.processed_count) * 100)
        : 0;
      
      const durationMs = job.completed_at && job.started_at
        ? new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()
        : null;

      return {
        ...job,
        success_rate: successRate,
        duration_ms: durationMs
      };
    }) || [];

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('enrichment_jobs')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting jobs:', countError);
    }

    return new Response(
      JSON.stringify({ 
        jobs: enrichedJobs,
        total: count || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-enrichment-history:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
