import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Loader2, Play, RefreshCw, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface EnrichmentStats {
  auto_enrichment_enabled: boolean;
  last_run_at: string | null;
  queue_count: number;
  review_count: number;
  last_24h: {
    processed: number;
    succeeded: number;
    failed: number;
  };
  total_enriched: number;
  total_failed: number;
}

export function AutoEnrichmentBar() {
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-enrichment-stats');
      
      if (error) throw error;
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching enrichment stats:', error);
      toast({
        title: "Failed to load stats",
        description: "Could not fetch enrichment statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAutoEnrichment = async () => {
    if (!stats) return;
    
    setToggling(true);
    try {
      const { data: currentSettings, error: fetchError } = await supabase
        .from('enrichment_settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('enrichment_settings')
        .update({ auto_enrichment_enabled: !stats.auto_enrichment_enabled })
        .eq('id', currentSettings.id);

      if (updateError) throw updateError;

      toast({
        title: stats.auto_enrichment_enabled ? "Auto-Enrichment Disabled" : "Auto-Enrichment Enabled",
        description: stats.auto_enrichment_enabled 
          ? "Automatic enrichment has been turned off" 
          : "Automatic enrichment will run every 2 hours"
      });

      await fetchStats();
    } catch (error) {
      console.error('Error toggling auto-enrichment:', error);
      toast({
        title: "Failed to update settings",
        description: "Could not toggle auto-enrichment",
        variant: "destructive"
      });
    } finally {
      setToggling(false);
    }
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke('auto-enrich-prospects');
      
      if (error) throw error;

      toast({
        title: "Enrichment Started",
        description: "Processing prospects in the background..."
      });

      // Refresh stats after a short delay
      setTimeout(fetchStats, 3000);
    } catch (error) {
      console.error('Error running enrichment:', error);
      toast({
        title: "Failed to start enrichment",
        description: "Could not trigger enrichment process",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="p-4 mb-4 border-primary/20 bg-gradient-to-r from-background to-primary/5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Toggle and Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={stats.auto_enrichment_enabled}
              onCheckedChange={toggleAutoEnrichment}
              disabled={toggling}
            />
            <div>
              <h3 className="font-semibold text-sm">Smart AI Enrichment</h3>
              <p className="text-xs text-muted-foreground">
                {stats.auto_enrichment_enabled ? 'Runs every 2 hours' : 'Currently disabled'}
              </p>
            </div>
          </div>

          {stats.last_run_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last run {formatDistanceToNow(new Date(stats.last_run_at), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Center: Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{stats.queue_count}</p>
              <p className="text-xs text-muted-foreground">In Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{stats.last_24h.succeeded}</p>
              <p className="text-xs text-muted-foreground">24h Success</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">{stats.review_count}</p>
              <p className="text-xs text-muted-foreground">Need Review</p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={runNow}
            disabled={running || stats.queue_count === 0}
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}