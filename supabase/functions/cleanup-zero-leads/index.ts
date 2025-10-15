import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Create auth client (for user verification)
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Create admin client (for database operations, bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseAuth
      .rpc('is_admin', { user_uuid: user.id });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CLEANUP-ZERO-LEADS] Starting cleanup by admin ${user.id}`);

    // Find all reports with 0 missed leads
    const { data: zeroLeadReports, error: reportsError } = await supabaseAdmin
      .from('reports')
      .select('id, domain, report_data')
      .eq('report_data->>missedLeads', '0');

    if (reportsError) {
      console.error('[CLEANUP-ZERO-LEADS] Error finding zero-lead reports:', reportsError);
      return new Response(
        JSON.stringify({ error: 'Failed to find zero-lead reports', details: reportsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reportIds = zeroLeadReports?.map((r: any) => r.id) || [];
    console.log(`[CLEANUP-ZERO-LEADS] Found ${reportIds.length} reports with 0 missed leads`);

    if (reportIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: 0,
          message: 'No zero-lead prospects found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find all prospect_activities for those reports
    const { data: zeroLeadProspects, error: prospectsError } = await supabaseAdmin
      .from('prospect_activities')
      .select('id, report_id')
      .in('report_id', reportIds);

    if (prospectsError) {
      console.error('[CLEANUP-ZERO-LEADS] Error finding prospect_activities:', prospectsError);
      return new Response(
        JSON.stringify({ error: 'Failed to find prospect activities', details: prospectsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prospectIds = zeroLeadProspects?.map((p: any) => p.id) || [];
    const count = prospectIds.length;

    console.log(`[CLEANUP-ZERO-LEADS] Found ${count} prospect activities to delete`);

    if (count === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: 0,
          message: 'No zero-lead prospects found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete prospect contacts first (FK constraint)
    const { error: contactsError } = await supabaseAdmin
      .from('prospect_contacts')
      .delete()
      .in('prospect_activity_id', prospectIds);

    if (contactsError) {
      console.error('[CLEANUP-ZERO-LEADS] Error deleting contacts:', contactsError);
      // Continue anyway - contacts might not exist
    } else {
      console.log('[CLEANUP-ZERO-LEADS] ✓ Deleted prospect_contacts');
    }

    // Delete prospect tasks (FK constraint)
    const { error: tasksError } = await supabaseAdmin
      .from('prospect_tasks')
      .delete()
      .in('prospect_activity_id', prospectIds);

    if (tasksError) {
      console.error('[CLEANUP-ZERO-LEADS] Error deleting tasks:', tasksError);
      // Continue anyway - tasks might not exist
    } else {
      console.log('[CLEANUP-ZERO-LEADS] ✓ Deleted prospect_tasks');
    }

    // Delete the prospect activities
    const { error: deleteError } = await supabaseAdmin
      .from('prospect_activities')
      .delete()
      .in('id', prospectIds);

    if (deleteError) {
      console.error('[CLEANUP-ZERO-LEADS] Error deleting prospects:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete zero-lead prospects', details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CLEANUP-ZERO-LEADS] ✓ Successfully deleted ${count} zero-lead prospects`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: count,
        message: `Successfully removed ${count} prospects with 0 missed leads`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CLEANUP-ZERO-LEADS] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
