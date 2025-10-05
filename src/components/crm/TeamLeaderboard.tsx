import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-leaderboard');

      if (error) {
        // Check for auth errors specifically
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw new Error("Authentication issue. Please refresh the page or log in again.");
        }
        throw error;
      }

      // Strict validation - only accept arrays
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format from server");
      }

      setLeaderboard(data);
      
      if (data.length > 0) {
        toast({
          title: "Leaderboard updated",
          description: `Loaded ${data.length} team member${data.length > 1 ? 's' : ''}`,
        });
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch leaderboard";
      console.error("Error fetching leaderboard:", error);
      setError(errorMessage);
      toast({
        title: "Error loading leaderboard",
        description: errorMessage,
        variant: "destructive",
      });
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Leaderboard</CardTitle>
            {!loading && !error && leaderboard.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {leaderboard.length} team member{leaderboard.length > 1 ? 's' : ''} ranked
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load leaderboard</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("Authentication") && (
                <span className="block mt-2 text-sm">
                  Try refreshing the page or logging in again.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
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
                    index === 0 ? "border-l-4 border-l-brand-teal bg-brand-teal/10" :
                    index === 1 ? "border-l-4 border-l-accent bg-accent/5" :
                    index === 2 ? "border-l-4 border-l-brand-purple bg-brand-purple/5" :
                    ""
                  }
                >
                  <TableCell className={`font-medium ${index === 0 ? "text-brand-teal-dark" : ""}`}>
                    {index < 3 && (
                      <span className="mr-2">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    )}
                    {entry.email ? entry.email.split("@")[0] : "Unknown"}
                  </TableCell>
                  <TableCell className={`text-right ${index === 0 ? "text-brand-teal-dark" : ""}`}>{entry.prospectsAssigned}</TableCell>
                  <TableCell className={`text-right font-semibold ${index === 0 ? "text-brand-teal-dark" : ""}`}>{entry.closedWon}</TableCell>
                  <TableCell className={`text-right font-bold ${
                    index === 0 ? "text-brand-teal-dark" :
                    index === 1 ? "text-accent" :
                    index === 2 ? "text-brand-purple-dark" :
                    ""
                  }`}>
                    ${(entry.revenueClosed / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell className={`text-right ${index === 0 ? "text-brand-teal-dark" : ""}`}>{entry.winRate.toFixed(0)}%</TableCell>
                </TableRow>
              ))}
              {leaderboard.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <p>No leaderboard data yet</p>
                      <p className="text-xs">Activity will appear here once prospects are marked as won</p>
                    </div>
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
