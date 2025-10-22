import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const TIER_THRESHOLDS = {
  per_lead: {
    bronze: 100,
    silver: 1000,
    gold: Infinity,
  },
};

const TIER_RATES = {
  per_lead: {
    bronze: 0.05, // 5%
    silver: 0.10, // 10%
    gold: 0.15,   // 15%
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

    // Get ambassador profile from materialized view (pre-calculated stats)
    const { data: profile, error: profileError } = await supabaseClient
      .from('ambassador_dashboard_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let effectiveProfile = profile;

    if (!effectiveProfile) {
      // Fallback to regular profile table if materialized view not ready
      const { data: fallbackProfile, error: fallbackError } = await supabaseClient
        .from('ambassador_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fallbackError || !fallbackProfile) {
        return new Response(JSON.stringify({ error: 'Ambassador profile not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Use fallback profile with manual calculations
      const conversionRate = fallbackProfile.total_domains_purchased > 0
        ? (fallbackProfile.total_signups_lifetime / fallbackProfile.total_domains_purchased) * 100
        : 0;
      
      effectiveProfile = {
        ...fallbackProfile,
        conversion_rate: conversionRate,
        next_payout_date: null
      };
    }

    const conversionRate = effectiveProfile.conversion_rate || 0;

    // Calculate next tier requirements
    const getNextTierInfo = (current: string, metric: number) => {
      const thresholds = TIER_THRESHOLDS.per_lead;
      
      if (current === 'bronze' && metric < thresholds.silver) {
        return { next: 'silver', needed: thresholds.silver - metric, current: metric };
      } else if (current === 'silver' && metric < thresholds.gold) {
        return { next: 'gold', needed: thresholds.gold - metric, current: metric };
      } else if (current === 'gold') {
        return { next: null, needed: 0, current: metric };
      }
      
      return { next: null, needed: 0, current: metric };
    };

    const perLeadNextTier = getNextTierInfo(
      effectiveProfile.per_lead_tier,
      effectiveProfile.total_signups_lifetime
    );

    const stats = {
      profile: {
        id: effectiveProfile.id,
        user_id: effectiveProfile.user_id,
        full_name: effectiveProfile.full_name,
        email: effectiveProfile.email,
        phone: effectiveProfile.phone,
        location: effectiveProfile.location,
        status: effectiveProfile.status,
        payment_method: effectiveProfile.payment_method,
      },
      performance: {
        active_domains: effectiveProfile.active_domains_count,
        total_signups_lifetime: effectiveProfile.total_signups_lifetime,
        total_leads_processed: effectiveProfile.total_leads_processed,
        total_domains_purchased: effectiveProfile.total_domains_purchased,
        conversion_rate: Math.round(conversionRate * 10) / 10,
      },
      financials: {
        pending_commission: effectiveProfile.pending_commission,
        eligible_commission: effectiveProfile.eligible_commission,
        lifetime_paid: effectiveProfile.lifetime_commission_paid,
        total_spent_on_leads: effectiveProfile.total_spent_on_leads || 0,
        total_revenue_generated: effectiveProfile.total_revenue_generated || 0,
        next_payout_date: effectiveProfile.next_payout_date || null,
        estimated_next_payout: effectiveProfile.pending_commission,
      },
      tiers: {
        per_lead_tier: effectiveProfile.per_lead_tier,
        per_lead_rate: TIER_RATES.per_lead[effectiveProfile.per_lead_tier as keyof typeof TIER_RATES.per_lead],
        next_tier_requirements: {
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
