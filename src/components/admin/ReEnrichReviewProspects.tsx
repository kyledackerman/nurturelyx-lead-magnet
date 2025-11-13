import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayCircle, PauseCircle, RotateCcw, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BatchResult {
  enriched: number;
  failed: number;
  marked_not_viable: number;
}

interface DomainStatus {
  domain: string;
  status: string;
  error?: string;
}

export const ReEnrichReviewProspects = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [maxDomains, setMaxDomains] = useState(100);
  const [stats, setStats] = useState<BatchResult>({ enriched: 0, failed: 0, marked_not_viable: 0 });
  const [recentResults, setRecentResults] = useState<DomainStatus[]>([]);
  const [lastError, setLastError] = useState<string>("");

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
    setProcessedCount(0);
    setStats({ enriched: 0, failed: 0, marked_not_viable: 0 });
    setRecentResults([]);
    setLastError("");

    const domainsToProcess = Math.min(maxDomains, reviewCount);

    toast({
      title: "Re-enrichment started",
      description: `Processing up to ${domainsToProcess} prospects one-by-one`,
    });

    try {
      for (let i = 0; i < domainsToProcess; i++) {
        if (isPaused) {
          toast({
            title: "Re-enrichment paused",
            description: `Paused after ${i} domains`,
          });
          break;
        }

        setCurrentDomain(`Processing domain ${i + 1} of ${domainsToProcess}...`);
        setProcessedCount(i + 1);

        const { data, error } = await supabase.functions.invoke('re-enrich-review-prospects', {
          body: {
            batch_size: 1, // Process one at a time
            offset: 0 // Always get the next prospect in review status
          }
        });

        if (error) {
          const errorMsg = error.message || 'Unknown error';
          console.error('Processing error:', error);
          setLastError(errorMsg);

          // Check for rate limit or credit exhaustion
          if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            toast({
              title: "⚠️ Rate Limit Exceeded",
              description: "Please wait before continuing. The system needs to cool down.",
              variant: "destructive",
            });
            setIsProcessing(false);
            break;
          }

          if (errorMsg.includes('402') || errorMsg.includes('credits')) {
            toast({
              title: "⚠️ AI Credits Exhausted",
              description: "Please add credits to your workspace to continue.",
              variant: "destructive",
            });
            setIsProcessing(false);
            break;
          }

          toast({
            title: "Processing error",
            description: errorMsg,
            variant: "destructive",
          });
          continue;
        }

        if (data) {
          // Check for error codes in response
          if (data.code === 429) {
            setLastError(data.message);
            toast({
              title: "⚠️ Rate Limit Exceeded",
              description: data.message,
              variant: "destructive",
            });
            setIsProcessing(false);
            break;
          }

          if (data.code === 402) {
            setLastError(data.message);
            toast({
              title: "⚠️ AI Credits Exhausted",
              description: data.message,
              variant: "destructive",
            });
            setIsProcessing(false);
            break;
          }

          // Update stats
          setStats(prev => ({
            enriched: prev.enriched + (data.enriched || 0),
            failed: prev.failed + (data.failed || 0),
            marked_not_viable: prev.marked_not_viable + (data.marked_not_viable || 0),
          }));

          // Update recent results
          if (data.results && Array.isArray(data.results)) {
            setRecentResults(prev => [...data.results, ...prev].slice(0, 20));
            
            // Set current domain from results
            if (data.results[0]?.domain) {
              setCurrentDomain(`${data.results[0].domain} - ${data.results[0].status}`);
            }
          }
        }

        // Delay between domains
        await new Promise(resolve => setTimeout(resolve, 1500));
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
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMsg);
      toast({
        title: "Re-enrichment error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentDomain("");
    }
  };

  const pauseReEnrichment = () => {
    setIsPaused(true);
  };

  const resetStats = () => {
    setStats({ enriched: 0, failed: 0, marked_not_viable: 0 });
    setProcessedCount(0);
    setCurrentDomain("");
    setRecentResults([]);
    setLastError("");
    refetchCount();
  };

  const progress = reviewCount ? (processedCount / Math.min(maxDomains, reviewCount)) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Re-Enrich Review Prospects</CardTitle>
        <CardDescription>
          Re-process prospects in "review" status using Lovable AI enrichment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="text-2xl font-bold">{reviewCount || 0}</div>
              </div>
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <div className="text-sm text-muted-foreground">Enriched</div>
                <div className="text-2xl font-bold text-green-600">{stats.enriched}</div>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                <div className="text-sm text-muted-foreground">Not Viable</div>
                <div className="text-2xl font-bold text-orange-600">{stats.marked_not_viable}</div>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <Label htmlFor="maxDomains">Maximum Domains to Process</Label>
              <Input
                id="maxDomains"
                type="number"
                min={1}
                max={1000}
                value={maxDomains}
                onChange={(e) => setMaxDomains(Number(e.target.value))}
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground">
                Limit processing to avoid quota issues. Default: 100 domains
              </p>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{processedCount} / {Math.min(maxDomains, reviewCount || 0)}</span>
                </div>
                <Progress value={progress} />
                {currentDomain && (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    {currentDomain}
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {lastError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-destructive">Last Error</div>
                  <div className="text-sm text-muted-foreground">{lastError}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={startReEnrichment}
                disabled={isProcessing || !reviewCount || reviewCount === 0}
                className="flex-1"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Re-Enrichment
              </Button>
              <Button
                onClick={pauseReEnrichment}
                disabled={!isProcessing}
                variant="outline"
              >
                <PauseCircle className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                onClick={resetStats}
                disabled={isProcessing}
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">How It Works</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Processes prospects in "review" status with retry count &lt; 3</li>
                <li>Uses the proven Lovable AI enrichment pipeline (enrich-single-prospect)</li>
                <li>Processes one domain at a time with 1.5s delay between each</li>
                <li>Automatically stops on rate limits or credit exhaustion</li>
                <li>Only increments retry count on actual enrichment failures</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Recent Results (Last 20)</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {recentResults.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No results yet. Start processing to see results here.
                  </div>
                ) : (
                  recentResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{result.domain}</div>
                        {result.error && (
                          <div className="text-xs text-muted-foreground">{result.error}</div>
                        )}
                      </div>
                      <div
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          result.status === 'enriched'
                            ? 'bg-green-500/20 text-green-600'
                            : result.status === 'not_viable'
                            ? 'bg-orange-500/20 text-orange-600'
                            : result.status === 'failed'
                            ? 'bg-red-500/20 text-red-600'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {result.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
