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
    
    // Create service role client for auth.users access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get all admin and super_admin users
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin']);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw rolesError;
    }

    const userIds = userRoles?.map(r => r.user_id) || [];
    
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get prospect activities for these users
    const { data: prospects, error: prospectsError } = await supabaseAdmin
      .from('prospect_activities')
      .select(`
        assigned_to,
        status,
        reports!inner(report_data)
      `)
      .in('assigned_to', userIds);

    if (prospectsError) {
      console.error('Error fetching prospects:', prospectsError);
      throw prospectsError;
    }

    // Get user emails using admin API
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const userEmails = new Map(
      users.map(u => [u.id, u.email || "Unknown"])
    );

    // Calculate stats per user
    const statsMap = new Map();

    prospects?.forEach((p) => {
      if (!p.assigned_to) return;
      
      if (!statsMap.has(p.assigned_to)) {
        statsMap.set(p.assigned_to, {
          userId: p.assigned_to,
          email: userEmails.get(p.assigned_to) || "Unknown",
          prospectsAssigned: 0,
          contacted: 0,
          proposals: 0,
          closedWon: 0,
          revenueClosed: 0,
          winRate: 0,
        });
      }

      const entry = statsMap.get(p.assigned_to);
      entry.prospectsAssigned += 1;

      if (["contacted", "proposal", "closed_won", "closed_lost"].includes(p.status)) {
        entry.contacted += 1;
      }
      if (["proposal", "closed_won", "closed_lost"].includes(p.status)) {
        entry.proposals += 1;
      }
      if (p.status === "closed_won") {
        entry.closedWon += 1;
        const reportData = p.reports?.report_data as any;
        entry.revenueClosed += reportData?.monthlyRevenueLost || 0;
      }
    });

    // Calculate win rates and convert to array
    const leaderboard = Array.from(statsMap.values()).map(entry => ({
      ...entry,
      winRate: entry.contacted > 0 ? (entry.closedWon / entry.contacted) * 100 : 0,
    }));

    // Sort by revenue closed
    leaderboard.sort((a, b) => b.revenueClosed - a.revenueClosed);

    console.log(`Successfully calculated leaderboard for ${leaderboard.length} admins`);

    return new Response(
      JSON.stringify(leaderboard),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-leaderboard function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
