import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Play, RefreshCw, AlertCircle, Users, Sparkles, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface EnrichmentStats {
  enabled: boolean;
  last_run: string | null;
  queue_count: number;
  needs_review_count: number;
  last_24h_attempts: number;
  last_24h_successful: number;
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
        .update({ auto_enrichment_enabled: !stats.enabled })
        .eq('id', currentSettings.id);

      if (updateError) throw updateError;

      toast({
        title: stats.enabled ? "Auto-Enrichment Disabled" : "Auto-Enrichment Enabled",
        description: stats.enabled 
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
      <div className="mb-4 h-14 bg-muted/30 rounded-lg animate-pulse" />
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Toggle */}
        <div className="flex items-center gap-3">
          <Switch
            id="auto-enrich"
            checked={stats?.enabled || false}
            onCheckedChange={toggleAutoEnrichment}
            disabled={toggling}
          />
          <div className="flex items-center gap-2">
            {stats?.enabled ? (
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Power className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              Auto-Enrichment {stats?.enabled ? "Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* Center: Key Metrics */}
        {stats && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{stats.queue_count}</span>
              <span className="text-muted-foreground">Queue</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium">
                {stats.last_24h_attempts > 0 
                  ? Math.round((stats.last_24h_successful / stats.last_24h_attempts) * 100) 
                  : 0}%
              </span>
              <span className="text-muted-foreground">24h Success</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-medium">{stats.needs_review_count}</span>
              <span className="text-muted-foreground">Review</span>
            </div>
          </div>
        )}

        {/* Right: Last Run + Actions */}
        <div className="flex items-center gap-3">
          {stats?.last_run && (
            <span className="text-xs text-muted-foreground">
              Last: {formatDistanceToNow(new Date(stats.last_run), { addSuffix: true })}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="xs"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
          
          <Button
            variant="default"
            size="xs"
            onClick={runNow}
            disabled={running || !stats?.enabled}
          >
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Run Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}