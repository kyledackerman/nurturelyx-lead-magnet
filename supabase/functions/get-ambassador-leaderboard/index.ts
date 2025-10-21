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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const metric = url.searchParams.get('metric') || 'overall';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Get all ambassador profiles
    const { data: ambassadors, error: ambassadorError } = await supabaseAdmin
      .from('ambassador_profiles')
      .select('*');

    if (ambassadorError) {
      console.error('Error fetching ambassadors:', ambassadorError);
      throw ambassadorError;
    }

    // Calculate metrics for each ambassador
    const leaderboardData = await Promise.all(
      ambassadors.map(async (ambassador) => {
        // Get revenue recovered for active domains
        const { data: revenueData } = await supabaseAdmin
          .from('prospect_activities')
          .select(`
            report_id,
            reports!inner(report_data)
          `)
          .eq('purchased_by_ambassador', ambassador.user_id)
          .in('status', ['closed_won']);

        const estimatedRevenueRecovered = revenueData?.reduce((sum, pa) => {
          const yearlyRevenue = (pa.reports as any)?.report_data?.yearlyRevenueLost || 0;
          return sum + yearlyRevenue;
        }, 0) || 0;

        // Calculate derived metrics
        const retentionRate = ambassador.total_signups_lifetime > 0
          ? (ambassador.active_domains_count / ambassador.total_signups_lifetime) * 100
          : 0;

        const leadsPerDomain = ambassador.active_domains_count > 0
          ? ambassador.total_leads_processed / ambassador.active_domains_count
          : 0;

        // Calculate composite score for overall ranking
        const compositeScore = 
          (ambassador.total_signups_lifetime * 100) +
          (retentionRate * 10) +
          (estimatedRevenueRecovered / 10000) +
          (leadsPerDomain / 10);

        // Determine badges
        const badges = [];
        if (retentionRate >= 90 && ambassador.total_signups_lifetime >= 10) {
          badges.push('Retention Master');
        } else if (retentionRate >= 80 && ambassador.total_signups_lifetime >= 5) {
          badges.push('Client Keeper');
        }

        if (leadsPerDomain >= 2000) {
          badges.push('Whale Hunter');
        } else if (leadsPerDomain >= 1000) {
          badges.push('Big Fish');
        }

        if (ambassador.total_signups_lifetime >= 50) {
          badges.push('Growth Machine');
        } else if (ambassador.total_signups_lifetime >= 25) {
          badges.push('Rising Star');
        }

        if (estimatedRevenueRecovered >= 5000000) {
          badges.push('Revenue Champion');
        } else if (estimatedRevenueRecovered >= 1000000) {
          badges.push('Money Maker');
        }

        return {
          ambassador_id: ambassador.user_id,
          ambassador_name: ambassador.full_name,
          ambassador_email: ambassador.email,
          metrics: {
            total_signups: ambassador.total_signups_lifetime,
            active_domains: ambassador.active_domains_count,
            retention_rate: parseFloat(retentionRate.toFixed(1)),
            total_leads_processed: ambassador.total_leads_processed,
            leads_per_domain: parseFloat(leadsPerDomain.toFixed(1)),
            estimated_revenue_recovered: parseFloat(estimatedRevenueRecovered.toFixed(2))
          },
          composite_score: parseFloat(compositeScore.toFixed(1)),
          badges
        };
      })
    );

    // Sort by selected metric
    let sortedLeaderboard = [...leaderboardData];
    switch (metric) {
      case 'signups':
        sortedLeaderboard.sort((a, b) => b.metrics.total_signups - a.metrics.total_signups);
        break;
      case 'active_domains':
        sortedLeaderboard.sort((a, b) => b.metrics.active_domains - a.metrics.active_domains);
        break;
      case 'retention':
        sortedLeaderboard.sort((a, b) => b.metrics.retention_rate - a.metrics.retention_rate);
        break;
      case 'leads_per_domain':
        sortedLeaderboard.sort((a, b) => b.metrics.leads_per_domain - a.metrics.leads_per_domain);
        break;
      case 'revenue_recovered':
        sortedLeaderboard.sort((a, b) => b.metrics.estimated_revenue_recovered - a.metrics.estimated_revenue_recovered);
        break;
      case 'overall':
      default:
        sortedLeaderboard.sort((a, b) => b.composite_score - a.composite_score);
        break;
    }

    // Assign ranks
    sortedLeaderboard = sortedLeaderboard.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    console.log(`Leaderboard generated successfully with ${sortedLeaderboard.length} ambassadors`);

    return new Response(
      JSON.stringify({ leaderboard: sortedLeaderboard }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-ambassador-leaderboard function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
