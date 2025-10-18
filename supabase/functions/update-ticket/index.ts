import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is admin
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || !['admin', 'super_admin'].includes(userRole.role)) {
      throw new Error('Admin access required');
    }

    const { ticket_id, updates } = await req.json();

    if (!ticket_id || !updates) {
      throw new Error('Missing required fields');
    }

    // Build update object
    const updateData: any = {};

    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (updates.priority) {
      updateData.priority = updates.priority;
    }

    if (updates.assigned_to !== undefined) {
      updateData.assigned_to = updates.assigned_to;
    }

    // Update ticket
    const { data: ticket, error: updateError } = await supabaseClient
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticket_id)
      .select()
      .single();

    if (updateError) {
      console.error('Ticket update error:', updateError);
      throw updateError;
    }

    // Log to audit trail
    const { error: auditError } = await supabaseClient
      .from('audit_logs')
      .insert({
        table_name: 'support_tickets',
        record_id: ticket_id,
        action_type: 'UPDATE',
        changed_by: user.id,
        business_context: `Ticket updated: ${JSON.stringify(updates)}`,
      });

    if (auditError) {
      console.error('Audit log error:', auditError);
    }

    console.log(`Ticket ${ticket_id} updated by ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, ticket }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
