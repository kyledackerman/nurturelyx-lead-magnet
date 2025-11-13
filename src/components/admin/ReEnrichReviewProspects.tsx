import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, PauseCircle, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BatchResult {
  enriched: number;
  failed: number;
  marked_not_viable: number;
}

export const ReEnrichReviewProspects = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [stats, setStats] = useState<BatchResult>({ enriched: 0, failed: 0, marked_not_viable: 0 });

  // Fetch count of review prospects
  const { data: reviewCount, refetch: refetchCount } = useQuery({
    queryKey: ['review-prospects-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('prospect_activities')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'review')
        .lt('enrichment_retry_count', 3);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const startReEnrichment = async () => {
    if (!reviewCount || reviewCount === 0) {
      toast({
        title: "No prospects to re-enrich",
        description: "All review prospects have been processed.",
        variant: "default",
      });
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setCurrentBatch(0);
    setStats({ enriched: 0, failed: 0, marked_not_viable: 0 });

    const BATCH_SIZE = 500;
    const batches = Math.ceil(reviewCount / BATCH_SIZE);
    setTotalBatches(batches);

    toast({
      title: "Re-enrichment started",
      description: `Processing ${reviewCount} prospects in ${batches} batches`,
    });

    try {
      for (let i = 0; i < batches; i++) {
        if (isPaused) {
          toast({
            title: "Re-enrichment paused",
            description: `Paused at batch ${i + 1} of ${batches}`,
          });
          break;
        }

        setCurrentBatch(i + 1);

        const { data, error } = await supabase.functions.invoke('re-enrich-review-prospects', {
          body: {
            batch_size: BATCH_SIZE,
            offset: i * BATCH_SIZE
          }
        });

        if (error) {
          console.error('Batch error:', error);
          toast({
            title: "Batch processing error",
            description: `Error in batch ${i + 1}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        if (data) {
          setStats(prev => ({
            enriched: prev.enriched + (data.enriched || 0),
            failed: prev.failed + (data.failed || 0),
            marked_not_viable: prev.marked_not_viable + (data.marked_not_viable || 0),
          }));
        }

        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!isPaused) {
        toast({
          title: "Re-enrichment complete",
          description: `Enriched: ${stats.enriched}, Not Viable: ${stats.marked_not_viable}, Failed: ${stats.failed}`,
        });
        refetchCount();
      }
    } catch (error) {
      console.error('Re-enrichment error:', error);
      toast({
        title: "Re-enrichment error",
        description: "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pauseReEnrichment = () => {
    setIsPaused(true);
    toast({
      title: "Pausing re-enrichment",
      description: "Will pause after current batch completes",
    });
  };

  const resetStats = () => {
    setCurrentBatch(0);
    setTotalBatches(0);
    setStats({ enriched: 0, failed: 0, marked_not_viable: 0 });
    refetchCount();
  };

  const progress = totalBatches > 0 ? (currentBatch / totalBatches) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" />
          Re-Enrich Review Prospects
        </CardTitle>
        <CardDescription>
          Use enhanced Google search strategies to find valid emails for prospects in "review" status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">Review Status</div>
            <div className="text-2xl font-bold">{reviewCount || 0}</div>
            <div className="text-xs text-muted-foreground">prospects to process</div>
          </div>
          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <div className="text-sm text-green-600 dark:text-green-400">Enriched</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.enriched}</div>
            <div className="text-xs text-green-600/70 dark:text-green-400/70">emails found</div>
          </div>
          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <div className="text-sm text-red-600 dark:text-red-400">Not Viable</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.marked_not_viable}</div>
            <div className="text-xs text-red-600/70 dark:text-red-400/70">after 3 attempts</div>
          </div>
          <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.failed}</div>
            <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70">needs retry</div>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Processing batch {currentBatch} of {totalBatches}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Estimated time remaining: {Math.max(0, totalBatches - currentBatch)} batches (~{Math.max(0, (totalBatches - currentBatch) * 2)} minutes)
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isProcessing ? (
            <Button
              onClick={startReEnrichment}
              disabled={!reviewCount || reviewCount === 0}
              className="flex-1"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Re-Enrichment
            </Button>
          ) : (
            <Button
              onClick={pauseReEnrichment}
              variant="outline"
              disabled={isPaused}
              className="flex-1"
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              {isPaused ? 'Pausing...' : 'Pause'}
            </Button>
          )}
          <Button
            onClick={resetStats}
            variant="outline"
            disabled={isProcessing}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Enhanced Search Strategy
          </h4>
          <ul className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-1">
            <li>• <strong>Retry 1:</strong> Owner/founder searches, email patterns, local business listings</li>
            <li>• <strong>Retry 2:</strong> CEO/president searches, social media, Google Maps</li>
            <li>• <strong>Retry 3:</strong> Email pattern matching, industry directories, chamber of commerce</li>
            <li>• Prospects are marked "not_viable" after 3 failed attempts</li>
            <li>• Processing 500 domains per batch with 2-minute intervals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
