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
      const { data, error } = await supabase.functions.invoke('get-leaderboard');

      if (error) throw error;

      setLeaderboard(data || []);
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
              {leaderboard.map((entry, index) => (
                <TableRow 
                  key={entry.userId}
                  className={
                    index === 0 ? "border-l-4 border-l-orange-600 bg-orange-50" :
                    index === 1 ? "border-l-4 border-l-accent bg-accent/5" :
                    index === 2 ? "border-l-4 border-l-brand-purple bg-brand-purple/5" :
                    ""
                  }
                >
                  <TableCell className="font-medium">
                    {index < 3 && (
                      <span className="mr-2">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    )}
                    {entry.email.split("@")[0]}
                  </TableCell>
                  <TableCell className="text-right">{entry.prospectsAssigned}</TableCell>
                  <TableCell className="text-right font-semibold">{entry.closedWon}</TableCell>
                  <TableCell className={`text-right font-bold ${
                    index === 0 ? "text-orange-700" :
                    index === 1 ? "text-accent-foreground" :
                    index === 2 ? "text-brand-purple-dark" :
                    ""
                  }`}>
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
