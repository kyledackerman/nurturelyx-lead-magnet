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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient
      .rpc('is_admin', { user_uuid: user.id });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CLEANUP-ZERO-LEADS] Starting cleanup by admin ${user.id}`);

    // Find all prospect_activities with 0 missed leads
    const { data: zeroLeadProspects, error: findError } = await supabaseClient
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        reports!inner(
          domain,
          report_data
        )
      `)
      .filter('reports.report_data->>missedLeads', 'eq', '0');

    if (findError) {
      console.error('[CLEANUP-ZERO-LEADS] Error finding zero-lead prospects:', findError);
      return new Response(
        JSON.stringify({ error: 'Failed to find zero-lead prospects', details: findError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prospectIds = zeroLeadProspects?.map((p: any) => p.id) || [];
    const count = prospectIds.length;

    console.log(`[CLEANUP-ZERO-LEADS] Found ${count} zero-lead prospects to delete`);

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
    const { error: contactsError } = await supabaseClient
      .from('prospect_contacts')
      .delete()
      .in('prospect_activity_id', prospectIds);

    if (contactsError) {
      console.error('[CLEANUP-ZERO-LEADS] Error deleting contacts:', contactsError);
      // Continue anyway - contacts might not exist
    }

    // Delete prospect tasks (FK constraint)
    const { error: tasksError } = await supabaseClient
      .from('prospect_tasks')
      .delete()
      .in('prospect_activity_id', prospectIds);

    if (tasksError) {
      console.error('[CLEANUP-ZERO-LEADS] Error deleting tasks:', tasksError);
      // Continue anyway - tasks might not exist
    }

    // Delete the prospect activities
    const { error: deleteError } = await supabaseClient
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
