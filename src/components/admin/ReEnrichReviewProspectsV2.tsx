import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";

interface ProcessResult {
  domain: string;
  status: 'enriched' | 'not_found' | 'error';
  ownerName?: string;
  emailsFound: number;
  stage?: string;
  error?: string;
}

export function ReEnrichReviewProspectsV2() {
  const [reviewCount, setReviewCount] = useState(0);
  const [maxDomains, setMaxDomains] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    processed: 0,
    enriched: 0,
    notFound: 0,
    errors: 0,
  });
  const [results, setResults] = useState<ProcessResult[]>([]);

  useEffect(() => {
    fetchReviewCount();
  }, []);

  const fetchReviewCount = async () => {
    const { count } = await supabase
      .from('prospect_activities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'review')
      .lt('enrichment_retry_count', 3)
      .is('purchased_by_ambassador', null);
    
    setReviewCount(count || 0);
  };

  const processProspects = async () => {
    setProcessing(true);
    setPaused(false);
    setStats({ processed: 0, enriched: 0, notFound: 0, errors: 0 });
    setResults([]);

    for (let i = 0; i < maxDomains; i++) {
      if (paused) {
        toast.info("Processing paused");
        break;
      }

      try {
        setProgress(((i + 1) / maxDomains) * 100);
        setCurrentStage("Searching...");

        const { data, error } = await supabase.functions.invoke('re-enrich-review-prospects-v2', {
          body: {},
        });

        if (error) {
          // Check for rate limit or credits errors
          if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            toast.error("⚠️ Rate limit reached! Stopping processing.", {
              description: "Please wait a few minutes before resuming.",
              duration: 10000,
            });
            break;
          }

          if (error.message?.includes('402') || error.message?.includes('credits')) {
            toast.error("💳 Credits exhausted! Add credits to continue.", {
              description: "Go to Settings → Workspace → Usage to add credits.",
              duration: 10000,
            });
            break;
          }

          throw error;
        }

        if (data.domain) {
          setCurrentDomain(data.domain);
          setCurrentStage(data.stage || "Completed");

          const result: ProcessResult = {
            domain: data.domain,
            status: data.emailsFound > 0 ? 'enriched' : 'not_found',
            ownerName: data.ownerName,
            emailsFound: data.emailsFound,
            stage: data.stage,
          };

          setResults(prev => [result, ...prev]);

          if (data.emailsFound > 0) {
            setStats(prev => ({
              ...prev,
              processed: prev.processed + 1,
              enriched: prev.enriched + 1,
            }));
            toast.success(`✅ Found ${data.emailsFound} emails for ${data.domain}`);
          } else {
            setStats(prev => ({
              ...prev,
              processed: prev.processed + 1,
              notFound: prev.notFound + 1,
            }));
          }
        } else {
          // No more prospects
          toast.info("No more review prospects available");
          break;
        }

        // Client-side delay (1.2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1200));

      } catch (error: any) {
        console.error('Processing error:', error);
        setStats(prev => ({
          ...prev,
          processed: prev.processed + 1,
          errors: prev.errors + 1,
        }));
        
        setResults(prev => [{
          domain: currentDomain || 'Unknown',
          status: 'error',
          emailsFound: 0,
          error: error.message,
        }, ...prev]);

        toast.error(`Error processing domain: ${error.message}`);
      }
    }

    setProcessing(false);
    setCurrentDomain("");
    setCurrentStage("");
    await fetchReviewCount();
    toast.success("Re-enrichment batch complete!", {
      description: `Enriched: ${stats.enriched}, Not Found: ${stats.notFound}`,
    });
  };

  const handlePause = () => {
    setPaused(true);
    setProcessing(false);
  };

  const handleReset = () => {
    setStats({ processed: 0, enriched: 0, notFound: 0, errors: 0 });
    setResults([]);
    setProgress(0);
    setCurrentDomain("");
    setCurrentStage("");
    fetchReviewCount();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Re-Enrich Review Prospects V2</CardTitle>
          <CardDescription>
            Advanced 3-stage re-enrichment: Owner Discovery → Personal Contact → Domain-Wide Boolean Search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Review Prospects Available: <span className="text-primary">{reviewCount}</span>
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={maxDomains}
                onChange={(e) => setMaxDomains(parseInt(e.target.value) || 10)}
                disabled={processing}
                placeholder="Max domains to process"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={processProspects}
                disabled={processing || reviewCount === 0}
                className="gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={!processing}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={processing}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {processing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                <div>Processing: <span className="font-medium">{currentDomain}</span></div>
                <div>Stage: <span className="font-medium">{currentStage}</span></div>
                <div>
                  Progress: {stats.processed} / {maxDomains} domains
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.processed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.enriched}</div>
                <div className="text-sm text-muted-foreground">Enriched</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{stats.notFound}</div>
                <div className="text-sm text-muted-foreground">Not Found</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Emails</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.slice(0, 20).map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{result.domain}</TableCell>
                    <TableCell>
                      {result.status === 'enriched' && (
                        <Badge variant="default">✅ Enriched</Badge>
                      )}
                      {result.status === 'not_found' && (
                        <Badge variant="secondary">⏸️ Not Found</Badge>
                      )}
                      {result.status === 'error' && (
                        <Badge variant="destructive">❌ Error</Badge>
                      )}
                    </TableCell>
                    <TableCell>{result.ownerName || '-'}</TableCell>
                    <TableCell>{result.emailsFound}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {result.stage || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
