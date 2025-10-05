import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  userId: string;
  email: string;
  prospectsAssigned: number;
  contacted: number;
  proposals: number;
  closedWon: number;
  revenueClosed: number;
  winRate: number;
}

export default function TeamLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get all admins and ambassadors
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "super_admin"] as any);

      if (rolesError) throw rolesError;

      const userIds = userRoles?.map(r => r.user_id) || [];

      // Get prospects for each user
      const { data: prospects, error: prospectsError } = await supabase
        .from("prospect_activities")
        .select(`
          assigned_to,
          status,
          reports!inner(report_data)
        `)
        .in("assigned_to", userIds);

      if (prospectsError) throw prospectsError;

      // Get user emails
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      const userEmails = new Map(
        users.map(u => [u.id, u.email || "Unknown"] as [string, string])
      );

      // Calculate stats per user
      const stats = new Map<string, LeaderboardEntry>();

      prospects?.forEach((p) => {
        if (!p.assigned_to) return;
        
        if (!stats.has(p.assigned_to)) {
          stats.set(p.assigned_to, {
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

        const entry = stats.get(p.assigned_to)!;
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

      // Calculate win rates
      const leaderboardData = Array.from(stats.values()).map(entry => ({
        ...entry,
        winRate: entry.contacted > 0 ? (entry.closedWon / entry.contacted) * 100 : 0,
      }));

      // Sort by revenue closed
      leaderboardData.sort((a, b) => b.revenueClosed - a.revenueClosed);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Won</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow key={entry.userId}>
                  <TableCell className="font-medium">
                    {entry.email.split("@")[0]}
                  </TableCell>
                  <TableCell className="text-right">{entry.prospectsAssigned}</TableCell>
                  <TableCell className="text-right">{entry.closedWon}</TableCell>
                  <TableCell className="text-right">
                    ${(entry.revenueClosed / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell className="text-right">{entry.winRate.toFixed(0)}%</TableCell>
                </TableRow>
              ))}
              {leaderboard.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No data yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
