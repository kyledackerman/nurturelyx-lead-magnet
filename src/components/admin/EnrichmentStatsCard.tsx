import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface EnrichmentStats {
  queue_count: number;
  needs_review_count: number;
  last_24h_attempts: number;
  last_24h_successful: number;
  total_enriched: number;
  last_run: string | null;
  last_manual_job_count: number;
  last_manual_job_success: number;
}

export const EnrichmentStatsCard = () => {
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-enrichment-stats');
      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching enrichment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading statistics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const successRate = stats.last_24h_attempts > 0
    ? Math.round((stats.last_24h_successful / stats.last_24h_attempts) * 100)
    : 0;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Enrichment Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              24h Success Rate
            </div>
            <div className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.last_24h_successful}/{stats.last_24h_attempts}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              Queue
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.queue_count}
            </div>
            <div className="text-xs text-muted-foreground">Waiting</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Needs Review
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.needs_review_count}
            </div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Total Enriched
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.total_enriched}
            </div>
            <div className="text-xs text-muted-foreground">All time</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last Run
            </div>
            <div className="text-sm font-medium text-foreground">
              {stats.last_run 
                ? new Date(stats.last_run).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Never'}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.last_run 
                ? new Date(stats.last_run).toLocaleDateString()
                : '—'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
