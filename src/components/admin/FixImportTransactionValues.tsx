import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportJob {
  id: string;
  file_name: string;
  created_at: string;
  total_rows: number;
  successful_rows: number;
  status: string;
}

interface SampleReport {
  domain: string;
  avgTransactionValue: number;
}

export const FixImportTransactionValues = () => {
  const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [multiplier, setMultiplier] = useState("1000");
  const [samples, setSamples] = useState<SampleReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('status', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setRecentJobs(data as ImportJob[]);
    }
  };

  const fetchSamples = async (jobId: string) => {
    const { data } = await supabase
      .from('reports')
      .select('domain, report_data')
      .eq('import_source', jobId)
      .limit(5);

    if (data) {
      const samples = data.map(r => ({
        domain: r.domain,
        avgTransactionValue: (r.report_data as any)?.avgTransactionValue || 0,
      }));
      setSamples(samples);
    }
  };

  const handleOpenDialog = async (job: ImportJob) => {
    setSelectedJob(job);
    setDialogOpen(true);
    await fetchSamples(job.id);
  };

  const handleFix = async () => {
    if (!selectedJob) return;

    const multiplierNum = parseFloat(multiplier);
    if (isNaN(multiplierNum) || multiplierNum <= 0) {
      toast({
        title: "Invalid multiplier",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fix-import-transaction-values', {
        body: {
          jobId: selectedJob.id,
          multiplier: multiplierNum,
        },
      });

      if (error) throw error;

      toast({
        title: "Transaction values fixed",
        description: `Updated ${data.fixed} of ${data.total} reports`,
      });

      setDialogOpen(false);
      setSelectedJob(null);
      setSamples([]);
    } catch (error) {
      console.error('Fix error:', error);
      toast({
        title: "Fix failed",
        description: error.message || "Failed to fix transaction values",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Fix Import Transaction Values
          </CardTitle>
          <CardDescription>
            Correct transaction values that were incorrectly parsed from CSV imports (e.g., 3,000 became 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If your import had numbers with commas (e.g., "3,000") that were incorrectly parsed as small values (e.g., "3"), 
              you can fix them here by multiplying by the correct factor (usually 1000).
            </AlertDescription>
          </Alert>

          {recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed imports in the last 7 days</p>
          ) : (
            <div className="space-y-2">
              <Label>Recent Imports (Last 7 Days)</Label>
              {recentJobs.map(job => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{job.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()} • {job.successful_rows} rows
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(job)}
                  >
                    Fix Values
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fix Transaction Values</DialogTitle>
            <DialogDescription>
              {selectedJob?.file_name} - {selectedJob?.successful_rows} reports
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {samples.length > 0 && (
              <div className="space-y-2">
                <Label>Sample Current Values</Label>
                <div className="space-y-1 text-sm">
                  {samples.map(sample => (
                    <div key={sample.domain} className="flex justify-between py-1 px-2 bg-muted rounded">
                      <span className="text-muted-foreground">{sample.domain}</span>
                      <span className="font-mono">${sample.avgTransactionValue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="multiplier">Multiply By</Label>
              <Input
                id="multiplier"
                type="number"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Common fix: Enter 1000 to convert $3 → $3,000
              </p>
            </div>

            {samples.length > 0 && multiplier && (
              <div className="space-y-2">
                <Label>Preview After Fix</Label>
                <div className="space-y-1 text-sm">
                  {samples.map(sample => {
                    const newValue = sample.avgTransactionValue * parseFloat(multiplier || "1");
                    return (
                      <div key={sample.domain} className="flex justify-between py-1 px-2 bg-green-50 dark:bg-green-950 rounded">
                        <span className="text-muted-foreground">{sample.domain}</span>
                        <span className="font-mono text-green-700 dark:text-green-400">
                          ${newValue.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFix} disabled={loading}>
              {loading ? "Fixing..." : `Fix ${selectedJob?.successful_rows} Reports`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
