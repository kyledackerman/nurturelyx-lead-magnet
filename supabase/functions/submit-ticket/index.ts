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

    const { client_account_id, subject, description, priority = 'medium' } = await req.json();

    // Validate input
    if (!client_account_id || !subject || !description) {
      throw new Error('Missing required fields');
    }

    if (subject.length < 10 || subject.length > 200) {
      throw new Error('Subject must be between 10 and 200 characters');
    }

    if (description.length < 50 || description.length > 2000) {
      throw new Error('Description must be between 50 and 2000 characters');
    }

    // Verify user has access to this client account
    const { data: clientAccount, error: clientError } = await supabaseClient
      .from('client_accounts')
      .select('id, assigned_csm')
      .eq('id', client_account_id)
      .single();

    if (clientError) {
      throw new Error('Client account not found');
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('support_tickets')
      .insert({
        client_account_id,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        submitted_by: user.id,
        assigned_to: clientAccount.assigned_csm,
        status: 'open',
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Ticket creation error:', ticketError);
      throw ticketError;
    }

    // Create initial message
    const { error: messageError } = await supabaseClient
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticket.id,
        user_id: user.id,
        message: description.trim(),
        is_internal_note: false,
      });

    if (messageError) {
      console.error('Message creation error:', messageError);
    }

    console.log(`Ticket created: ${ticket.id} for client: ${client_account_id}`);

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
