import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin'])
      .single();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { prospect_activity_id, new_status } = await req.json();

    if (!prospect_activity_id || !new_status) {
      throw new Error('Missing required fields: prospect_activity_id and new_status');
    }

    console.log(`Updating prospect ${prospect_activity_id} to status ${new_status}`);

    // Prepare update payload with side effects
    const updatePayload: any = {
      status: new_status,
      updated_at: new Date().toISOString()
    };

    // Set closed_at for closed statuses
    if (new_status === 'closed_won' || new_status === 'closed_lost') {
      updatePayload.closed_at = new Date().toISOString();
    } else {
      updatePayload.closed_at = null;
    }

    // Clear enrichment locks when moving off enriching
    if (new_status !== 'enriching') {
      updatePayload.enrichment_locked_at = null;
      updatePayload.enrichment_locked_by = null;
    }

    // Update the prospect activity status
    const { data: updatedProspect, error: updateError } = await supabase
      .from('prospect_activities')
      .update(updatePayload)
      .eq('id', prospect_activity_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating prospect:', updateError);
      throw new Error(`Failed to update prospect: ${updateError.message}`);
    }

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      table_name: 'prospect_activities',
      record_id: prospect_activity_id,
      action_type: 'UPDATE',
      field_name: 'status',
      old_value: null,
      new_value: new_status,
      changed_by: user.id,
      business_context: 'Manual status update via edge function'
    });

    console.log(`Successfully updated prospect ${prospect_activity_id} to ${new_status}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedProspect
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-prospect-status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
