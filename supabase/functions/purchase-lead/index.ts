import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isUSADomain } from '../_shared/domainValidation.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is ambassador
    const { data: isAmbassador } = await supabaseClient.rpc('is_ambassador', { user_uuid: user.id });
    if (!isAmbassador) {
      return new Response(JSON.stringify({ error: 'Ambassador access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prospect_activity_id, report_id } = await req.json();

    if (!prospect_activity_id && !report_id) {
      return new Response(JSON.stringify({ error: 'prospect_activity_id or report_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get ambassador profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('ambassador_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Ambassador profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Ambassador account is not active' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get prospect and report
    let query = supabaseClient
      .from('prospect_activities')
      .select('*, reports!inner(domain)');

    if (prospect_activity_id) {
      query = query.eq('id', prospect_activity_id);
    } else {
      query = query.eq('report_id', report_id);
    }

    const { data: prospect, error: prospectError } = await query.single();

    if (prospectError || !prospect) {
      return new Response(JSON.stringify({ error: 'Prospect not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate USA domain
    if (!isUSADomain(prospect.reports.domain)) {
      return new Response(JSON.stringify({ error: 'Only USA-based domains can be purchased' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabaseClient
      .from('lead_purchases')
      .select('id')
      .eq('prospect_activity_id', prospect.id)
      .single();

    if (existingPurchase) {
      return new Response(JSON.stringify({ error: 'This lead has already been purchased' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already assigned
    if (prospect.assigned_to && prospect.purchased_by_ambassador) {
      return new Response(JSON.stringify({ error: 'This lead is already assigned to another ambassador' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const purchasePrice = 0.05;
    const currentBalance = profile.credit_balance || 0;
    const newBalance = Number(currentBalance) + purchasePrice;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('lead_purchases')
      .insert({
        ambassador_id: user.id,
        report_id: prospect.report_id,
        prospect_activity_id: prospect.id,
        domain: prospect.reports.domain,
        purchase_price: purchasePrice,
        payment_status: 'pending_settlement',
        payment_method: 'credit',
        source: 'marketplace',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Failed to create purchase:', purchaseError);
      return new Response(JSON.stringify({ error: 'Failed to purchase lead', details: purchaseError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update prospect activity
    const { error: updateError } = await supabaseClient
      .from('prospect_activities')
      .update({
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        purchased_by_ambassador: user.id,
        purchased_at: new Date().toISOString(),
        lead_source: 'marketplace_purchase',
      })
      .eq('id', prospect.id);

    if (updateError) {
      console.error('Failed to update prospect:', updateError);
    }

    // Create credit transaction
    const { error: creditError } = await supabaseClient
      .from('credit_transactions')
      .insert({
        ambassador_id: user.id,
        transaction_type: 'charge',
        amount: purchasePrice,
        balance_after: newBalance,
        description: `Lead purchase: ${prospect.reports.domain}`,
        related_purchase_id: purchase.id
      });

    if (creditError) {
      console.error('Failed to create credit transaction:', creditError);
    }

    // Update ambassador profile metrics
    const { error: profileUpdateError } = await supabaseClient
      .from('ambassador_profiles')
      .update({
        total_domains_purchased: profile.total_domains_purchased + 1,
        total_spent_on_leads: Number(profile.total_spent_on_leads) + purchasePrice,
        active_domains_count: profile.active_domains_count + 1,
        credit_balance: newBalance,
      })
      .eq('user_id', user.id);

    if (profileUpdateError) {
      console.error('Failed to update profile metrics:', profileUpdateError);
    }

    // Log to audit trail
    await supabaseClient.from('audit_logs').insert([
      {
        table_name: 'lead_purchases',
        record_id: purchase.id,
        action_type: 'INSERT',
        field_name: 'purchase',
        new_value: prospect.reports.domain,
        business_context: `Ambassador purchased lead for $${purchasePrice.toFixed(2)} (credit): ${prospect.reports.domain}`,
        changed_by: user.id,
      },
      {
        table_name: 'ambassador_profiles',
        record_id: user.id,
        action_type: 'UPDATE',
        field_name: 'credit_balance',
        old_value: currentBalance.toString(),
        new_value: newBalance.toString(),
        business_context: `Credit charged for lead purchase: ${prospect.reports.domain}`,
        changed_by: user.id,
      }
    ]);

    // Send email
    const { sendEmail } = await import('../_shared/emailService.ts');
    const { generatePurchaseConfirmationEmail } = await import('../_shared/emailTemplates.ts');
    try {
      await sendEmail({ to: profile.email, subject: 'Lead Purchase Confirmed',
        html: generatePurchaseConfirmationEmail(profile.full_name, prospect.reports.domain, purchasePrice, newBalance) });
    } catch (e) { console.error('Email failed:', e); }

    return new Response(
      JSON.stringify({
        success: true,
        purchase_id: purchase.id,
        domain: prospect.reports.domain,
        purchase_price: purchasePrice,
        credit_balance: newBalance,
        message: 'Lead purchased successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in purchase-lead:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
