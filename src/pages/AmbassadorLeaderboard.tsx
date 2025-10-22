import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { LeaderboardCard } from "@/components/ambassador/LeaderboardCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Trophy } from "lucide-react";
import { ambassadorService } from "@/services/ambassadorService";
import { useAuth } from "@/hooks/useAuth";

type MetricType = 'overall' | 'signups' | 'active_domains' | 'retention' | 'leads_per_domain' | 'revenue_recovered';

export default function AmbassadorLeaderboard() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('overall');
  const { user } = useAuth();

  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['ambassador-leaderboard', selectedMetric],
    queryFn: () => ambassadorService.getLeaderboard(selectedMetric),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Ambassador Leaderboard</h1>
          <p className="text-muted-foreground">
            Compete with fellow ambassadors and track your performance across key metrics
          </p>
        </div>

        <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="signups">Signups</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="leads_per_domain">Whale Hunter</TabsTrigger>
            <TabsTrigger value="revenue_recovered">Revenue</TabsTrigger>
            <TabsTrigger value="active_domains">Active</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedMetric} className="mt-6">
            {isLoading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load leaderboard. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {leaderboard && leaderboard.length === 0 && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-bold">
                  The Race Just Started
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  This is a brand new program. The leaderboard is empty because no one has signed up domains yet. 
                  <strong> Be the first to reach #1.</strong> Every ambassador starts at the same place—now is your chance to dominate.
                </AlertDescription>
              </Alert>
            )}

            {leaderboard && leaderboard.length > 0 && (
              <div className="space-y-4">
                {leaderboard.map((entry: any) => (
                  <LeaderboardCard 
                    key={entry.ambassador_id} 
                    entry={entry}
                    isCurrentUser={entry.ambassador_id === user?.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
