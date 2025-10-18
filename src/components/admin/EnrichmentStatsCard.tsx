import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [reconciling, setReconciling] = useState(false);

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

  const handleReconcile = async () => {
    setReconciling(true);
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-enriching-prospects');
      
      if (error) throw error;
      
      const summary = [
        `Promoted: ${data.promoted}`,
        `Moved to Review: ${data.movedToReview}`,
        `  - Legal emails only: ${data.legalEmailsOnly}`,
        `  - No emails found: ${data.noEmails}`,
        `Contact counts fixed: ${data.contactCountFixed}`
      ].join('\n');
      
      toast({
        title: "Reconciliation Complete",
        description: summary,
      });
      
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error reconciling prospects:', error);
      toast({
        title: "Reconciliation Failed",
        description: "Failed to reconcile stuck prospects. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setReconciling(false);
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Enrichment Statistics</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleReconcile}
            disabled={reconciling}
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
            Reconcile Stuck Prospects
          </Button>
        </div>
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
