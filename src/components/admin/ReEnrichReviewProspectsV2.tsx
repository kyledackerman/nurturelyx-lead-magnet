import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Loader2, History } from "lucide-react";
import { ReEnrichmentHistoryDialog } from "./ReEnrichmentHistoryDialog";

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
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [processing, setProcessing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    enriched: 0,
    notFound: 0,
    errors: 0,
  });
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchReviewCount();
    checkForActiveJob();
  }, []);

  // Realtime subscription for job updates
  useEffect(() => {
    if (!activeJobId) return;

    const channel = supabase
      .channel(`re-enrichment-job-${activeJobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 're_enrichment_jobs',
        filter: `id=eq.${activeJobId}`
      }, (payload) => {
        const job = payload.new as any;
        setStats({
          total: job.total_count,
          processed: job.processed_count,
          enriched: job.enriched_count,
          notFound: job.not_found_count,
          errors: job.error_count,
        });
        
        if (job.status === 'completed') {
          toast.success(`Re-enrichment completed! ${job.enriched_count} prospects enriched.`);
          setJobStatus('completed');
          setProcessing(false);
        } else if (job.status === 'paused') {
          setJobStatus('paused');
          setProcessing(false);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeJobId]);

  const fetchReviewCount = async () => {
    const { count } = await supabase
      .from('prospect_activities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'review')
      .lt('enrichment_retry_count', 3)
      .is('purchased_by_ambassador', null);
    
    setReviewCount(count || 0);
  };

  const checkForActiveJob = async () => {
    const { data } = await supabase
      .from('re_enrichment_jobs')
      .select('*')
      .in('status', ['running', 'paused', 'queued'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setActiveJobId(data.id);
      setJobStatus(data.status as any);
      setStats({
        total: data.total_count,
        processed: data.processed_count,
        enriched: data.enriched_count,
        notFound: data.not_found_count,
        errors: data.error_count,
      });
      setMaxDomains(data.max_domains_to_process);
    }
  };

  const handleStart = async () => {
    try {
      // Create new job
      const { data: job, error } = await supabase.functions.invoke('create-re-enrichment-job', {
        body: { max_domains_to_process: maxDomains }
      });

      if (error) throw error;

      setActiveJobId(job.job_id);
      setJobStatus('running');
      setStats({
        total: job.total_available,
        processed: 0,
        enriched: 0,
        notFound: 0,
        errors: 0,
      });
      setResults([]);
      
      toast.success(`Starting re-enrichment for ${job.max_to_process} prospects`);
      
      // Start processing
      processJob(job.job_id);
    } catch (error: any) {
      console.error('Error starting job:', error);
      toast.error('Failed to start job: ' + error.message);
    }
  };

  const handleResume = async (jobId?: string) => {
    const resumeJobId = jobId || activeJobId;
    if (!resumeJobId) return;

    try {
      // Update job status to running
      await supabase
        .from('re_enrichment_jobs')
        .update({ status: 'running', stopped_reason: null })
        .eq('id', resumeJobId);

      setActiveJobId(resumeJobId);
      setJobStatus('running');
      setPaused(false);
      
      toast.success('Resuming re-enrichment job');
      
      // Continue processing
      processJob(resumeJobId);
    } catch (error: any) {
      console.error('Error resuming job:', error);
      toast.error('Failed to resume job: ' + error.message);
    }
  };

  const handlePause = async () => {
    if (!activeJobId) return;

    setPaused(true);
    setJobStatus('paused');
    
    await supabase
      .from('re_enrichment_jobs')
      .update({ 
        status: 'paused', 
        stopped_reason: 'user_paused' 
      })
      .eq('id', activeJobId);

    toast.info("Processing will pause after current domain completes");
  };

  const processJob = async (jobId: string) => {
    setProcessing(true);
    setPaused(false);

    while (!paused && jobStatus !== 'completed') {
      try {
        setCurrentStage("Searching...");

        const { data, error } = await supabase.functions.invoke('re-enrich-review-prospects-v2', {
          body: { job_id: jobId },
        });

        if (error) {
          // Check for rate limit or credits errors
          if (error.message?.includes('429') || error.message?.includes('rate limit')) {
            toast.error("⚠️ Rate limit reached! Job paused.", {
              description: "Resume when ready to continue.",
              duration: 10000,
            });
            await supabase
              .from('re_enrichment_jobs')
              .update({ status: 'paused', stopped_reason: 'rate_limit' })
              .eq('id', jobId);
            break;
          }

          if (error.message?.includes('402') || error.message?.includes('credits')) {
            toast.error("💳 Credits exhausted! Job paused.", {
              description: "Add credits and resume to continue.",
              duration: 10000,
            });
            await supabase
              .from('re_enrichment_jobs')
              .update({ status: 'paused', stopped_reason: 'credits_exhausted' })
              .eq('id', jobId);
            break;
          }

          throw error;
        }

        // Check if job is paused or completed from server
        if (data.job_status === 'paused' || data.job_status === 'completed') {
          setJobStatus(data.job_status);
          setProcessing(false);
          break;
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

          setResults(prev => [result, ...prev].slice(0, 20));

          if (data.emailsFound > 0) {
            toast.success(`✅ Found ${data.emailsFound} emails for ${data.domain}`);
          }
        }

        // Update progress from server
        if (data.job_progress) {
          const prog = data.job_progress;
          setStats({
            total: prog.total,
            processed: prog.processed,
            enriched: prog.enriched,
            notFound: prog.notFound,
            errors: prog.errors,
          });
          setProgress((prog.processed / prog.total) * 100);
        }

        // Client delay
        await new Promise(r => setTimeout(r, 1200));

      } catch (error: any) {
        console.error('Error processing prospect:', error);
        toast.error('Error: ' + error.message);
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        
        // Continue to next prospect on error
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setProcessing(false);
  };

  const handleReset = async () => {
    setActiveJobId(null);
    setJobStatus('idle');
    setCurrentDomain("");
    setCurrentStage("");
    setProgress(0);
    setStats({ total: 0, processed: 0, enriched: 0, notFound: 0, errors: 0 });
    setResults([]);
    setPaused(false);
    setProcessing(false);
    await fetchReviewCount();
    toast.success("Reset complete");
  };

  const successRate = stats.processed > 0 
    ? ((stats.enriched / stats.processed) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Re-Enrich Review Prospects V2</CardTitle>
              <CardDescription>
                3-stage re-enrichment with Boolean search + last-resort generic emails
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Max domains to process
              </label>
              <Input
                type="number"
                value={maxDomains}
                onChange={(e) => setMaxDomains(parseInt(e.target.value) || 10)}
                min={1}
                max={100000}
                disabled={processing || jobStatus === 'running'}
              />
            </div>
            <div className="flex gap-2">
              {jobStatus === 'idle' && (
                <Button onClick={handleStart} disabled={reviewCount === 0}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}
              
              {jobStatus === 'paused' && (
                <Button onClick={() => handleResume()} variant="default">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              
              {(jobStatus === 'running' && processing) && (
                <Button onClick={handlePause} variant="secondary">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button onClick={handleReset} variant="outline" disabled={processing}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Job Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Job Status:</span>
            <Badge variant={
              jobStatus === 'running' ? 'default' :
              jobStatus === 'paused' ? 'secondary' :
              jobStatus === 'completed' ? 'outline' : 'outline'
            } className={jobStatus === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}>
              {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1)}
            </Badge>
            {activeJobId && (
              <span className="text-xs text-muted-foreground font-mono">
                {activeJobId.slice(0, 8)}
              </span>
            )}
          </div>

          {/* Available Count */}
          <div className="text-sm text-muted-foreground">
            Available for re-enrichment: <strong>{reviewCount.toLocaleString()}</strong> prospects
          </div>

          {/* Progress */}
          {(processing || stats.processed > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {stats.processed}/{stats.total}</span>
                <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} />
              
              {processing && currentDomain && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Processing: <strong>{currentDomain}</strong> - {currentStage}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          {stats.processed > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.processed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Enriched
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.enriched}
                    <span className="text-sm ml-2">({successRate}%)</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">
                    Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.notFound}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">
                    Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Results */}
          {results.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Recent Results (Last 20)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Emails Found</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm">{result.domain}</TableCell>
                      <TableCell>
                        <Badge variant={
                          result.status === 'enriched' ? 'outline' :
                          result.status === 'not_found' ? 'secondary' : 'destructive'
                        } className={result.status === 'enriched' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : ''}>
                          {result.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{result.ownerName || '-'}</TableCell>
                      <TableCell>{result.emailsFound}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{result.stage || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReEnrichmentHistoryDialog 
        open={showHistory} 
        onOpenChange={setShowHistory}
        onResume={handleResume}
      />
    </div>
  );
}
