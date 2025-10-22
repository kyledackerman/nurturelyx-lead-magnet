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

    // Use optimized database function (single query instead of N+1)
    const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin
      .rpc('get_ambassador_leaderboard_optimized', {
        p_metric: metric,
        p_limit: limit
      });

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      throw leaderboardError;
    }

    // Transform to expected format
    const sortedLeaderboard = (leaderboardData || []).map((entry: any) => ({
      rank: entry.rank,
      ambassador_id: entry.ambassador_id,
      ambassador_name: entry.ambassador_name,
      ambassador_email: entry.ambassador_email,
      metrics: {
        total_signups: entry.total_signups,
        active_domains: entry.active_domains,
        retention_rate: parseFloat(entry.retention_rate),
        total_leads_processed: entry.total_leads_processed,
        leads_per_domain: parseFloat(entry.leads_per_domain),
        estimated_revenue_recovered: parseFloat(entry.estimated_revenue_recovered)
      },
      composite_score: parseFloat(entry.composite_score),
      badges: entry.badges || []
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
