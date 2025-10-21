import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdminData, error: adminCheckError } = await supabase.rpc('is_admin', { user_uuid: user.id });
    
    if (adminCheckError || !isAdminData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find self-service reports with missed leads but no prospect_activities
    const { data: missedReports, error: queryError } = await supabase
      .from('reports')
      .select('id, domain, report_data, user_id, created_at')
      .eq('lead_source', 'self_service')
      .not('report_data->>missedLeads', 'is', null)
      .gt('report_data->>missedLeads', '0');

    if (queryError) {
      console.error('Error fetching reports:', queryError);
      return new Response(JSON.stringify({ error: 'Failed to fetch reports', details: queryError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter out reports that already have prospect_activities
    const reportsToBackfill = [];
    for (const report of missedReports || []) {
      const { data: existingActivity } = await supabase
        .from('prospect_activities')
        .select('id')
        .eq('report_id', report.id)
        .single();
      
      if (!existingActivity) {
        reportsToBackfill.push(report);
      }
    }

    console.log(`Found ${reportsToBackfill.length} reports to backfill`);

    // Backfill each report
    const results = [];
    for (const report of reportsToBackfill) {
      const missedLeads = parseInt(report.report_data?.missedLeads || '0');
      const monthlyRevenue = parseFloat(report.report_data?.monthlyRevenueLost || '0');
      
      // Determine priority
      let priority = 'cold';
      if (missedLeads >= 1000) priority = 'hot';
      else if (missedLeads >= 500) priority = 'warm';

      const { data: newActivity, error: insertError } = await supabase
        .from('prospect_activities')
        .insert({
          report_id: report.id,
          activity_type: 'assignment',
          assigned_to: report.user_id || null,
          assigned_by: report.user_id || null,
          assigned_at: report.user_id ? new Date().toISOString() : null,
          status: 'new',
          priority: priority,
          lead_source: 'warm_inbound',
          notes: `🔥 WARM INBOUND: ${report.user_id ? 'Registered user' : 'Visitor'} ran their own report. Saw ${missedLeads} missed leads and $${monthlyRevenue}/mo revenue loss. HIGH INTENT.`,
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Failed to backfill ${report.domain}:`, insertError);
        results.push({ domain: report.domain, success: false, error: insertError.message });
      } else {
        console.log(`✅ Backfilled ${report.domain} (${priority} priority, ${missedLeads} leads)`);
        results.push({ 
          domain: report.domain, 
          success: true, 
          priority, 
          missedLeads,
          monthlyRevenue 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const successDomains = results.filter(r => r.success).map(r => r.domain);

    return new Response(JSON.stringify({
      message: `Backfilled ${successCount} warm inbound prospects`,
      total: reportsToBackfill.length,
      successCount,
      failureCount: results.length - successCount,
      domains: successDomains,
      details: results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
