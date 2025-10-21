import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sendEmail } from '../_shared/emailService.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Tier-based commission rates (percentages)
const PER_LEAD_RATES = {
  bronze: 0.05, // 5%
  silver: 0.10, // 10%
  gold: 0.15,   // 15%
};

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

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      event_type, 
      prospect_activity_id,
      billing_period_start,
      billing_period_end,
      leads_processed,
      total_payment_amount 
    } = await req.json();

    if (!event_type || !prospect_activity_id) {
      return new Response(JSON.stringify({ error: 'event_type and prospect_activity_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get prospect and report
    const { data: prospect, error: prospectError } = await serviceClient
      .from('prospect_activities')
      .select('*, reports!inner(domain)')
      .eq('id', prospect_activity_id)
      .single();

    if (prospectError || !prospect) {
      return new Response(JSON.stringify({ error: 'Prospect not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!prospect.purchased_by_ambassador) {
      return new Response(JSON.stringify({ error: 'Prospect not assigned to ambassador' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get ambassador profile
    const { data: profile, error: profileError } = await serviceClient
      .from('ambassador_profiles')
      .select('*')
      .eq('user_id', prospect.purchased_by_ambassador)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Ambassador profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get or create client pricing
    let { data: clientPricing, error: pricingError } = await serviceClient
      .from('client_pricing')
      .select('*')
      .eq('prospect_activity_id', prospect_activity_id)
      .single();

    if (!clientPricing) {
      const { data: newPricing, error: createPricingError } = await serviceClient
        .from('client_pricing')
        .insert({
          prospect_activity_id: prospect.id,
          report_id: prospect.report_id,
          ambassador_id: prospect.purchased_by_ambassador,
          domain: prospect.reports.domain,
          platform_fee_monthly: 100.00,
          per_lead_price: 1.00,
          status: 'active',
        })
        .select()
        .single();

      if (createPricingError) {
        console.error('Failed to create client pricing:', createPricingError);
      }
      clientPricing = newPricing;
    }

    const commissionsCreated: any[] = [];

    // Only process per-lead commissions (no platform fees)
    if (event_type === 'lead_purchase' && leads_processed && leads_processed > 0) {
      // Calculate per-lead commission
      const perLeadRate = PER_LEAD_RATES[profile.per_lead_tier as keyof typeof PER_LEAD_RATES] || 0.05;
      const perLeadPrice = clientPricing?.per_lead_price || 1.00;
      const perLeadBase = leads_processed * perLeadPrice;
      const perLeadCommission = perLeadBase * perLeadRate;

      const { data: commission, error: commissionError } = await serviceClient
        .from('commissions')
        .insert({
          ambassador_id: prospect.purchased_by_ambassador,
          prospect_activity_id: prospect.id,
          report_id: prospect.report_id,
          domain: prospect.reports.domain,
          commission_type: 'per_lead',
          base_amount: perLeadBase,
          commission_rate: perLeadRate,
          commission_amount: perLeadCommission,
          status: 'eligible', // Per-lead commissions are immediately eligible
          leads_processed: leads_processed,
          per_lead_price: perLeadPrice,
          per_lead_tier_at_time: profile.per_lead_tier,
          billing_period_start: billing_period_start || null,
          billing_period_end: billing_period_end || null,
        })
        .select()
        .single();

      if (commissionError) {
        console.error('Failed to create per-lead commission:', commissionError);
      } else {
        commissionsCreated.push(commission);
        
        // Update ambassador eligible commission immediately
        await serviceClient
          .from('ambassador_profiles')
          .update({
            eligible_commission: profile.eligible_commission + perLeadCommission,
            total_leads_processed: profile.total_leads_processed + leads_processed,
            total_revenue_generated: profile.total_revenue_generated + (total_payment_amount || perLeadBase),
          })
          .eq('user_id', prospect.purchased_by_ambassador);
        
        // Send email notification for per-lead commissions
        try {
          await sendEmail({
            to: profile.email,
            subject: 'Per-Lead Commission Earned!',
            html: `
              <h2>Great news, ${profile.full_name}!</h2>
              <p>You've earned a per-lead commission:</p>
              <ul>
                <li><strong>Domain:</strong> ${prospect.reports.domain}</li>
                <li><strong>Leads Processed:</strong> ${leads_processed}</li>
                <li><strong>Lead Price:</strong> $${perLeadPrice.toFixed(2)}</li>
                <li><strong>Commission Rate:</strong> ${(perLeadRate * 100).toFixed(0)}%</li>
                <li><strong>Commission Amount:</strong> $${perLeadCommission.toFixed(2)}</li>
                <li><strong>Status:</strong> Immediately Eligible</li>
              </ul>
              <p>This commission is immediately eligible for payout (minimum $100 threshold).</p>
              <p><a href="https://nurturely.io/ambassador/commissions">View all commissions →</a></p>
            `,
          });
          console.log(`✅ Per-lead commission email sent to ${profile.email}`);
        } catch (emailError) {
          console.error('Failed to send per-lead commission email:', emailError);
        }
      }
    }

    console.log(`Created ${commissionsCreated.length} commission(s) for ambassador ${prospect.purchased_by_ambassador}`);

    return new Response(
      JSON.stringify({
        success: true,
        commissions_created: commissionsCreated.length,
        total_commission_amount: commissionsCreated.reduce((sum, c) => sum + parseFloat(c.commission_amount), 0),
        details: commissionsCreated.map(c => ({
          commission_id: c.id,
          type: c.commission_type,
          amount: c.commission_amount,
          eligible_date: c.eligible_for_payout_at,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in calculate-commissions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
