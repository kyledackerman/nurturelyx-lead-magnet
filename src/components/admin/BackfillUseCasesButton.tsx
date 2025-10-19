import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";

export const BackfillUseCasesButton = () => {
  const [eligibleCount, setEligibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrent] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);

  useEffect(() => {
    fetchEligibleCount();
  }, []);

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

  const processBackfill = async () => {
    setProcessing(true);
    setProgress(0);
    setCurrent(0);
    setSuccessCount(0);
    setFailureCount(0);

    try {
      // Fetch all eligible report IDs
      const { data: reports, error } = await supabase
        .from('reports')
        .select('id, domain')
        .not('extracted_company_name', 'is', null)
        .not('industry', 'is', null)
        .is('personalized_use_cases', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!reports || reports.length === 0) {
        toast.info('No eligible reports found');
        setProcessing(false);
        return;
      }

      const totalReports = reports.length;
      let successes = 0;
      let failures = 0;

      // Process in batches with rate limiting (10 per minute = 6 seconds between calls)
      for (let i = 0; i < totalReports; i++) {
        const report = reports[i];
        setCurrent(i + 1);

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

        setProgress(((i + 1) / totalReports) * 100);

        // Rate limiting: wait 6 seconds between calls (10 per minute)
        if (i < totalReports - 1) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }

      toast.success(`Backfill complete: ${successes} succeeded, ${failures} failed`);
      fetchEligibleCount(); // Refresh count
    } catch (error: any) {
      console.error('Backfill error:', error);
      toast.error('Backfill process failed');
    } finally {
      setProcessing(false);
    }
  };

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

  return (
    <div className="space-y-4">
      {!processing ? (
        <Alert>
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{eligibleCount}</strong> report{eligibleCount !== 1 ? 's' : ''} eligible for use case generation
            </span>
            <Button onClick={processBackfill} disabled={processing}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Use Cases
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Processing {currentIndex} of {eligibleCount}...
              </span>
              <span className="text-sm text-muted-foreground">
                ~{Math.ceil((eligibleCount - currentIndex) * 6 / 60)} min remaining
              </span>
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
};
