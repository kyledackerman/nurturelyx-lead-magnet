import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', {
      user_uuid: user.id,
    });

    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reportId } = await req.json();

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if report exists
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, domain, report_data')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if prospect activity already exists
    const { data: existingActivity } = await supabase
      .from('prospect_activities')
      .select('id')
      .eq('report_id', reportId)
      .maybeSingle();

    if (existingActivity) {
      return new Response(
        JSON.stringify({ error: 'Report already in CRM', alreadyExists: true }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate priority from report data
    const reportData = report.report_data as any;
    const missedLeads = Number(reportData?.missedLeads) || 0;
    const monthlyRevenue = reportData?.monthlyRevenueLost || 0;
    
    let priority = 'cold';
    if (missedLeads >= 1000) {
      priority = 'hot';
    } else if (missedLeads >= 500) {
      priority = 'warm';
    }

    // Create prospect activity
    const { data: activity, error: activityError } = await supabase
      .from('prospect_activities')
      .insert({
        report_id: reportId,
        activity_type: 'assignment',
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        status: 'new',
        priority: priority,
        notes: `Manually added to CRM by admin${missedLeads > 0 ? ` (~${missedLeads.toLocaleString()} potential leads/month)` : ''}${monthlyRevenue > 0 ? ` ($${monthlyRevenue.toLocaleString()}/month opportunity)` : ''}`
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error creating prospect activity:', activityError);
      return new Response(
        JSON.stringify({ error: 'Failed to add to CRM', details: activityError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Manually added ${report.domain} to CRM by admin ${user.id} (${priority} priority)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        activity,
        message: 'Successfully added to CRM'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in add-to-crm function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
