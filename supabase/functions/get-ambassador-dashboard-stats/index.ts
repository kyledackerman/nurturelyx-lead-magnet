import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const TIER_THRESHOLDS = {
  platform_fee: {
    bronze: 100,
    silver: 1000,
    gold: Infinity,
  },
  per_lead: {
    bronze: 100,
    silver: 1000,
    gold: Infinity,
  },
};

const TIER_RATES = {
  platform_fee: {
    bronze: 30,
    silver: 40,
    gold: 50,
  },
  per_lead: {
    bronze: 5,
    silver: 10,
    gold: 15,
  },
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

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

    // Calculate conversion rate
    const conversionRate = profile.total_domains_purchased > 0
      ? (profile.total_signups_lifetime / profile.total_domains_purchased) * 100
      : 0;

    // Get next payout date (find earliest eligible commission after 60 days)
    const { data: nextPayout } = await supabaseClient
      .from('commissions')
      .select('eligible_for_payout_at')
      .eq('ambassador_id', user.id)
      .eq('status', 'pending')
      .not('eligible_for_payout_at', 'is', null)
      .order('eligible_for_payout_at', { ascending: true })
      .limit(1)
      .single();

    // Calculate next tier requirements
    const getNextTierInfo = (current: string, metric: number, type: 'platform_fee' | 'per_lead') => {
      const thresholds = TIER_THRESHOLDS[type];
      
      if (current === 'bronze' && metric < thresholds.silver) {
        return { next: 'silver', needed: thresholds.silver - metric, current: metric };
      } else if (current === 'silver' && metric < thresholds.gold) {
        return { next: 'gold', needed: thresholds.gold - metric, current: metric };
      } else if (current === 'gold') {
        return { next: null, needed: 0, current: metric };
      }
      
      return { next: null, needed: 0, current: metric };
    };

    const platformFeeNextTier = getNextTierInfo(
      profile.platform_fee_tier,
      profile.total_signups_lifetime,
      'platform_fee'
    );

    const perLeadNextTier = getNextTierInfo(
      profile.per_lead_tier,
      profile.active_domains_count,
      'per_lead'
    );

    const stats = {
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        status: profile.status,
        payment_method: profile.payment_method,
      },
      performance: {
        active_domains: profile.active_domains_count,
        total_signups_lifetime: profile.total_signups_lifetime,
        total_leads_processed: profile.total_leads_processed,
        total_domains_purchased: profile.total_domains_purchased,
        conversion_rate: Math.round(conversionRate * 10) / 10,
      },
      financials: {
        pending_commission: profile.pending_commission,
        eligible_commission: profile.eligible_commission,
        lifetime_paid: profile.lifetime_commission_paid,
        total_spent_on_leads: profile.total_spent_on_leads,
        total_revenue_generated: profile.total_revenue_generated,
        next_payout_date: nextPayout?.eligible_for_payout_at || null,
        estimated_next_payout: profile.pending_commission,
      },
      tiers: {
        platform_fee_tier: profile.platform_fee_tier,
        platform_fee_rate: TIER_RATES.platform_fee[profile.platform_fee_tier as keyof typeof TIER_RATES.platform_fee],
        per_lead_tier: profile.per_lead_tier,
        per_lead_rate: TIER_RATES.per_lead[profile.per_lead_tier as keyof typeof TIER_RATES.per_lead],
        next_tier_requirements: {
          platform_fee: platformFeeNextTier,
          per_lead: perLeadNextTier,
        },
      },
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-ambassador-dashboard-stats:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
