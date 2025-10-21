import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ambassadorService } from "@/services/ambassadorService";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardPreview() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['ambassador-leaderboard', 'overall'],
    queryFn: () => ambassadorService.getLeaderboard('overall', 50),
    staleTime: 5 * 60 * 1000,
  });

  const myRank = leaderboard?.find((entry: any) => entry.ambassador_id === user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Your Leaderboard Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!myRank) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Join the Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Start signing up domains to appear on the leaderboard and compete with other ambassadors!
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/ambassador/leaderboard">
              View Leaderboard <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Your Leaderboard Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Overall Rank</div>
          <div className="text-4xl font-bold">#{myRank.rank}</div>
          <div className="text-sm text-muted-foreground mt-1">
            of {leaderboard.length} ambassadors
          </div>
        </div>

        <div className="text-center border-t pt-4">
          <div className="text-sm text-muted-foreground mb-1">Composite Score</div>
          <div className="text-2xl font-semibold">{myRank.composite_score.toLocaleString()}</div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link to="/ambassador/leaderboard">
            View Full Leaderboard <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
