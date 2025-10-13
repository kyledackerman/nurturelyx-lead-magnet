import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ImportJob } from "@/types/import";

export const ProspectImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [runningJobs, setRunningJobs] = useState<ImportJob[]>([]);
  const [recentJobs, setRecentJobs] = useState<ImportJob[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  // Fetch running and recent jobs on mount
  useEffect(() => {
    fetchRunningJobs();
    fetchRecentJobs();
  }, []);

  // Real-time subscription to all running jobs
  useEffect(() => {
    const channel = supabase
      .channel('import-jobs-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'import_jobs'
        },
        (payload) => {
          const updated = payload.new as ImportJob;
          
          if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'cancelled') {
            toast({
              title: updated.status === 'completed' ? "Import completed!" : 
                     updated.status === 'cancelled' ? "Import cancelled" : "Import failed",
              description: updated.status === 'completed' 
                ? `${updated.successful_rows} succeeded, ${updated.failed_rows} failed`
                : updated.file_name,
              variant: updated.status === 'failed' ? 'destructive' : 'default',
            });
            fetchRunningJobs();
            fetchRecentJobs();
            setFile(null);
          } else {
            // Update running jobs list
            setRunningJobs(prev => 
              prev.map(job => job.id === updated.id ? updated : job)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Polling for running jobs
  useEffect(() => {
    if (runningJobs.length === 0) return;

    const pollInterval = setInterval(() => {
      fetchRunningJobs();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [runningJobs]);

  const fetchRunningJobs = async () => {
    const { data } = await supabase
      .from('import_jobs')
      .select('*')
      .in('status', ['queued', 'processing'])
      .order('created_at', { ascending: false });

    if (data) {
      setRunningJobs(data as ImportJob[]);
    }
  };

  const fetchRecentJobs = async () => {
    const { data } = await supabase
      .from('import_jobs')
      .select('*')
      .in('status', ['completed', 'failed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentJobs(data as ImportJob[]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const csvData = await file.text();
      const lines = csvData.split('\n').filter(line => line.trim());
      
      if (lines.length > 1001) {
        toast({
          title: "Too many rows",
          description: "Maximum 1000 rows per import",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('import-prospects', {
        body: { 
          csvData, 
          fileName: file.name
        },
      });

      if (error) throw error;

      // Refresh running jobs
      fetchRunningJobs();

      toast({
        title: "Import queued",
        description: `Processing ${data.totalRows} domains in ${data.totalBatches} batches`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import prospects",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    const { error } = await supabase
      .from('import_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    if (!error) {
      toast({
        title: "Import cancelled",
        description: "The import has been stopped",
      });
      setFile(null);
      fetchRunningJobs();
      fetchRecentJobs();
    }
  };

  const handleForceComplete = async (jobId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-stuck-jobs', {
        body: { jobId }
      });

      if (error) throw error;

      toast({
        title: data.action === 'marked_failed' ? "Job marked as failed" : "No action needed",
        description: data.message,
      });

      fetchRunningJobs();
      fetchRecentJobs();
    } catch (error) {
      console.error('Force complete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to force complete job",
        variant: "destructive",
      });
    }
  };

  const handleRestartJob = async (jobId: string) => {
    try {
      // Reset job to queued status and clear lock
      const { error: updateError } = await supabase
        .from('import_jobs')
        .update({ 
          status: 'queued',
          enrichment_locked_at: null,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) throw updateError;

      // Manually invoke process-import-batch
      const { error: invokeError } = await supabase.functions.invoke('process-import-batch', {
        body: { jobId }
      });

      if (invokeError) throw invokeError;

      toast({
        title: "Import restarted",
        description: "The import will resume from where it left off",
      });

      fetchRunningJobs();
      fetchRecentJobs();
    } catch (error) {
      console.error('Restart error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to restart job",
        variant: "destructive",
      });
    }
  };

  const isJobRestartable = (job: ImportJob): boolean => {
    const isFrozen = isJobFrozen(job);
    const isFailed = job.status === 'failed';
    const hasMoreRows = job.processed_rows < job.total_rows;
    return (isFrozen || isFailed) && hasMoreRows;
  };

  const getLastError = (job: ImportJob): string | null => {
    if (!job.error_log || !Array.isArray(job.error_log) || job.error_log.length === 0) {
      return null;
    }
    const lastError = job.error_log[job.error_log.length - 1];
    return lastError?.error || null;
  };

  const isJobFrozen = (job: ImportJob): boolean => {
    if (job.status !== 'processing') return false;
    const lastUpdate = new Date(job.last_updated_at);
    const now = new Date();
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    return minutesSinceUpdate > 10;
  };

  const calculateTimeRemaining = (job: ImportJob): string => {
    if (job.processed_rows === 0) return 'Calculating...';
    
    const rowsRemaining = job.total_rows - job.processed_rows;
    const secondsPerRow = 1.5;
    const totalSeconds = Math.ceil(rowsRemaining * secondsPerRow);
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `~${minutes}m ${seconds}s`;
    }
    return `~${seconds}s`;
  };

  const downloadTemplate = () => {
    const template = `domain,avg_transaction_value
example.com,5000
acmehvac.com,8500
bestplumbing.com,6200`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospect_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulk Import Domains for Enrichment</CardTitle>
              <CardDescription>Upload a CSV file to import multiple prospects at once</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Upload a CSV file with columns: <strong>domain</strong> and <strong>avg_transaction_value</strong> (both required).
              All prospects will be automatically assigned to you and queued for AI enrichment.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing || runningJobs.length > 0}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer"
              />
            </div>

            {file && !importing && (
              <Button 
                onClick={handleImport} 
                className="w-full"
                disabled={runningJobs.length > 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {file.name}
              </Button>
            )}
            
            {runningJobs.length > 0 && (
              <Alert>
                <AlertDescription>
                  {runningJobs.length} import{runningJobs.length > 1 ? 's' : ''} currently running. 
                  Please wait for them to complete before starting a new import.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {importing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              Queueing import...
            </div>
          )}
        </CardContent>
      </Card>

      {runningJobs.map(job => {
        const isFrozen = isJobFrozen(job);
        const lastError = getLastError(job);
        return (
        <Card key={job.id} className={isFrozen ? "border-destructive" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  Import in Progress
                  {isFrozen && (
                    <Badge variant="destructive" className="text-xs">
                      Frozen
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{job.file_name}</CardDescription>
                {lastError && (
                  <div className="text-xs text-destructive">
                    Last error: {lastError}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isFrozen && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRestartJob(job.id)}
                    >
                      Restart
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleForceComplete(job.id)}
                    >
                      Force Fail
                    </Button>
                  </>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleCancelJob(job.id)}
                  disabled={job.status === 'completed'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Processing domains...</span>
                <span className="text-muted-foreground">
                  {job.processed_rows} / {job.total_rows}
                </span>
              </div>
              <Progress 
                value={(job.processed_rows / job.total_rows) * 100} 
                className="h-3"
              />
            </div>

            {/* Batch Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Batch Progress</span>
                <span className="text-muted-foreground">
                  Batch {job.current_batch} of {job.total_batches}
                </span>
              </div>
              <Progress 
                value={(job.current_batch / job.total_batches) * 100} 
                className="h-2"
              />
            </div>

            {/* Success/Failure Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">{job.successful_rows}</div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-sm font-medium">{job.failed_rows}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            {job.status === 'processing' && (
              <div className="text-xs text-muted-foreground">
                Estimated time remaining: {calculateTimeRemaining(job)}
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge variant={
                job.status === 'completed' ? 'default' :
                job.status === 'failed' ? 'destructive' :
                job.status === 'cancelled' ? 'secondary' :
                'outline'
              }>
                {job.status}
              </Badge>
            </div>

            {/* Error Log */}
            {job.error_log && job.error_log.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Errors ({job.error_log.length}):</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {job.error_log.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      <strong>Row {err.row} ({err.domain}):</strong> {err.error}
                    </div>
                  ))}
                  {job.error_log.length > 10 && (
                    <div className="text-xs text-muted-foreground p-2">
                      ... and {job.error_log.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
      })}

      {/* Recent Imports */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.map((job) => {
                const lastError = getLastError(job);
                const isRestartable = isJobRestartable(job);
                return (
                <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{job.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.successful_rows} succeeded, {job.failed_rows} failed
                      {job.status === 'failed' && ` (${job.processed_rows}/${job.total_rows} rows processed)`}
                    </div>
                    {lastError && (
                      <div className="text-xs text-destructive mt-1">
                        Last error: {lastError}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isRestartable && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestartJob(job.id)}
                      >
                        Restart
                      </Button>
                    )}
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
