import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle, XCircle, Pause, Play, Info } from "lucide-react";

interface BackfillUseCasesButtonProps {
  variant?: "banner" | "compact";
}

export const BackfillUseCasesButton = ({ variant = "banner" }: BackfillUseCasesButtonProps) => {
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrent] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [activeJob, setActiveJob] = useState<any>(null);
  const pauseSignal = useRef(false);

  useEffect(() => {
    fetchEligibleCount();
    checkForActiveJob();
  }, []);

  const checkForActiveJob = async () => {
    try {
      const { data: job, error } = await supabase
        .from('use_case_generation_jobs')
        .select('*')
        .in('status', ['running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && job) {
        setActiveJob(job);
        setSuccessCount(job.success_count);
        setFailureCount(job.failure_count);
        setCurrent(job.processed_count);
        setProgress((job.processed_count / job.total_count) * 100);
      }
    } catch (error: any) {
      // No active job found
      console.log('No active job found');
    }
  };

  const fetchEligibleCount = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .not('extracted_company_name', 'is', null)
        .not('industry', 'is', null)
        .is('personalized_use_cases', null);

      if (error) throw error;
      setEligibleCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching eligible count:', error);
      toast.error('Failed to fetch eligible reports count');
    } finally {
      setLoading(false);
    }
  };

  const pauseBackfill = () => {
    pauseSignal.current = true;
    toast.info('Pausing after current report...');
  };

  const processBackfill = async (resumeJobId?: string) => {
    setProcessing(true);
    pauseSignal.current = false;

    let jobId = resumeJobId;
    let startIndex = 0;
    let successes = activeJob?.success_count || 0;
    let failures = activeJob?.failure_count || 0;

    try {
      // Build query for reports to process
      let query = supabase
        .from('reports')
        .select('id, domain')
        .not('extracted_company_name', 'is', null)
        .not('industry', 'is', null)
        .is('personalized_use_cases', null)
        .order('created_at', { ascending: false });

      // If resuming, skip already processed reports
      if (activeJob?.last_processed_report_id) {
        // Fetch all eligible reports and filter out already processed
        const { data: allReports } = await supabase
          .from('reports')
          .select('id, domain, created_at')
          .not('extracted_company_name', 'is', null)
          .not('industry', 'is', null)
          .is('personalized_use_cases', null)
          .order('created_at', { ascending: false });

        const lastProcessedIndex = allReports?.findIndex(r => r.id === activeJob.last_processed_report_id) || -1;
        const reports = allReports?.slice(lastProcessedIndex + 1) || [];
        
        if (!jobId) {
          // Create new job if not resuming
          const { data: newJob, error: jobError } = await supabase
            .from('use_case_generation_jobs')
            .insert({
              created_by: (await supabase.auth.getUser()).data.user?.id,
              total_count: reports.length,
              status: 'running'
            })
            .select()
            .single();

          if (jobError) throw jobError;
          jobId = newJob.id;
          setActiveJob(newJob);
        } else {
          // Resume existing job
          await supabase
            .from('use_case_generation_jobs')
            .update({ status: 'running', started_at: new Date().toISOString() })
            .eq('id', jobId);
        }

        await processReports(reports, jobId!, successes, failures, activeJob?.processed_count || 0);
      } else {
        // New job - fetch all eligible reports
        const { data: reports, error } = await query;

        if (error) throw error;
        if (!reports || reports.length === 0) {
          toast.info('No eligible reports found');
          setProcessing(false);
          return;
        }

        // Create new job
        const { data: newJob, error: jobError } = await supabase
          .from('use_case_generation_jobs')
          .insert({
            created_by: (await supabase.auth.getUser()).data.user?.id,
            total_count: reports.length,
            status: 'running'
          })
          .select()
          .single();

        if (jobError) throw jobError;
        jobId = newJob.id;
        setActiveJob(newJob);

        await processReports(reports, jobId, successes, failures, 0);
      }
    } catch (error: any) {
      console.error('Backfill error:', error);
      toast.error('Backfill process failed');
      
      if (jobId) {
        await supabase
          .from('use_case_generation_jobs')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', jobId);
      }
    } finally {
      setProcessing(false);
      pauseSignal.current = false;
    }
  };

  const processReports = async (
    reports: any[],
    jobId: string,
    initialSuccesses: number,
    initialFailures: number,
    initialProcessed: number
  ) => {
    const totalReports = reports.length;
    let successes = initialSuccesses;
    let failures = initialFailures;

    for (let i = 0; i < totalReports; i++) {
      // Check pause signal
      if (pauseSignal.current) {
        await supabase
          .from('use_case_generation_jobs')
          .update({
            status: 'paused',
            paused_at: new Date().toISOString(),
            last_processed_report_id: reports[i - 1]?.id,
            processed_count: initialProcessed + i,
            success_count: successes,
            failure_count: failures
          })
          .eq('id', jobId);

        toast.success(`Paused at ${initialProcessed + i}/${initialProcessed + totalReports}`);
        await checkForActiveJob();
        return;
      }

      const report = reports[i];
      setCurrent(initialProcessed + i + 1);

      try {
        const { error: invokeError } = await supabase.functions.invoke('generate-use-cases', {
          body: { report_id: report.id }
        });

        if (invokeError) {
          console.error(`Failed to generate use cases for ${report.domain}:`, invokeError);
          failures++;
          setFailureCount(failures);
        } else {
          successes++;
          setSuccessCount(successes);
        }
      } catch (err: any) {
        console.error(`Error processing ${report.domain}:`, err);
        failures++;
        setFailureCount(failures);
      }

      // Update job progress after each report
      await supabase
        .from('use_case_generation_jobs')
        .update({
          processed_count: initialProcessed + i + 1,
          success_count: successes,
          failure_count: failures,
          last_processed_report_id: report.id
        })
        .eq('id', jobId);

      setProgress(((initialProcessed + i + 1) / (initialProcessed + totalReports)) * 100);

      // Rate limiting: wait 6 seconds between calls (10 per minute)
      if (i < totalReports - 1) {
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
    }

    // Mark job as completed
    await supabase
      .from('use_case_generation_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    toast.success(`Backfill complete: ${successes} succeeded, ${failures} failed`);
    setActiveJob(null);
    fetchEligibleCount();
  };

  // Render detailed view (for both banner mode and dialog content)
  const renderDetailedView = () => (
    <div className="space-y-4">
      {!processing && !activeJob && (
        <Alert>
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{eligibleCount}</strong> report{eligibleCount !== 1 ? 's' : ''} eligible for use case generation
            </span>
            <Button onClick={() => processBackfill()} disabled={processing}>
              <Sparkles className="h-4 w-4 mr-2" />
              Start Generation
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!processing && activeJob?.status === 'paused' && (
        <Alert>
          <Pause className="h-4 w-4 text-orange-600" />
          <AlertDescription className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Paused at {activeJob.processed_count} of {activeJob.total_count}
              </span>
              <Button onClick={() => processBackfill(activeJob.id)} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {activeJob.success_count} succeeded
              </span>
              {activeJob.failure_count > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {activeJob.failure_count} failed
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {processing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Processing {currentIndex} of {activeJob?.total_count || eligibleCount}...
              </span>
              <Button onClick={pauseBackfill} size="sm" variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              ~{Math.ceil(((activeJob?.total_count || eligibleCount) - currentIndex) * 6 / 60)} min remaining
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {successCount} succeeded
              </span>
              {failureCount > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {failureCount} failed
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Compact mode rendering
  if (variant === "compact") {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (eligibleCount === 0 && !activeJob && !processing) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          All Set
        </Badge>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {!processing && !activeJob && eligibleCount > 0 && (
          <Button onClick={() => processBackfill()} size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Use Cases ({eligibleCount})
          </Button>
        )}

        {!processing && activeJob?.status === 'paused' && (
          <>
            <Button onClick={() => processBackfill(activeJob.id)} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Resume ({activeJob.processed_count}/{activeJob.total_count})
            </Button>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {activeJob.success_count}
              </Badge>
              {activeJob.failure_count > 0 && (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  {activeJob.failure_count}
                </Badge>
              )}
            </div>
          </>
        )}

        {processing && (
          <>
            <Button onClick={pauseBackfill} size="sm" variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentIndex}/{activeJob?.total_count || eligibleCount}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {successCount}
              </Badge>
              {failureCount > 0 && (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  {failureCount}
                </Badge>
              )}
            </div>
          </>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Use Case Generation Details</DialogTitle>
            </DialogHeader>
            {renderDetailedView()}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Banner mode (default) rendering
  if (loading) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Loading eligible reports...</AlertDescription>
      </Alert>
    );
  }

  if (eligibleCount === 0 && !processing) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          All reports with company names and industries already have personalized use cases!
        </AlertDescription>
      </Alert>
    );
  }

  return renderDetailedView();
};
