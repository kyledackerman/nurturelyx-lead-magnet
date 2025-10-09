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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin privileges
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      console.error('Insufficient privileges for user:', user.id);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prospectIds, newStatus } = await req.json();

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid prospect IDs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Valid status values
    const validStatuses = [
      'new', 'enriching', 'review', 'enriched', 'contacted', 
      'proposal', 'closed_won', 'closed_lost', 'not_viable'
    ];

    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status:', newStatus);
      return new Response(JSON.stringify({ error: 'Invalid status value' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Bulk updating ${prospectIds.length} prospects to status: ${newStatus}`);

    // Update all selected prospects
    const { error: updateError, count } = await supabase
      .from('prospect_activities')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .in('id', prospectIds);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully updated ${count || prospectIds.length} prospects`);

    // Log audit trail for bulk action
    for (const prospectId of prospectIds) {
      await supabase.rpc('log_business_context', {
        p_table_name: 'prospect_activities',
        p_record_id: prospectId,
        p_context: `Bulk status update to ${newStatus} by ${user.email}`,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updatedCount: count || prospectIds.length 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
