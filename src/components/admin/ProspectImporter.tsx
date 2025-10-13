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
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
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

  // Fetch recent jobs
  useEffect(() => {
    fetchRecentJobs();
  }, []);

  // Real-time subscription to active job
  useEffect(() => {
    if (!activeJob) return;

    const channel = supabase
      .channel('import-job-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'import_jobs',
          filter: `id=eq.${activeJob.id}`
        },
        (payload) => {
          const updated = payload.new as ImportJob;
          setActiveJob(updated);
          
          if (updated.status === 'completed') {
            toast({
              title: "Import completed!",
              description: `${updated.successful_rows} succeeded, ${updated.failed_rows} failed`,
            });
            setFile(null);
            fetchRecentJobs();
          } else if (updated.status === 'failed') {
            toast({
              title: "Import failed",
              description: "An error occurred during processing",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJob, toast]);

  // Fallback polling
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') return;

    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', activeJob.id)
        .single();

      if (data) {
        setActiveJob(data as ImportJob);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeJob]);

  const fetchRecentJobs = async () => {
    const { data } = await supabase
      .from('import_jobs')
      .select('*')
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

      // Set active job for tracking
      const { data: jobData } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('id', data.jobId)
        .single();

      if (jobData) {
        setActiveJob(jobData as ImportJob);
      }

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

  const handleCancelJob = async () => {
    if (!activeJob) return;

    const { error } = await supabase
      .from('import_jobs')
      .update({ status: 'cancelled' })
      .eq('id', activeJob.id);

    if (!error) {
      toast({
        title: "Import cancelled",
        description: "The import has been stopped",
      });
      setActiveJob(null);
      setFile(null);
      fetchRecentJobs();
    }
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
                disabled={importing || !!activeJob}
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

            {file && !importing && !activeJob && (
              <Button 
                onClick={handleImport} 
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {file.name}
              </Button>
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

      {activeJob && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Import in Progress</CardTitle>
                <CardDescription>{activeJob.file_name}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCancelJob}
                disabled={activeJob.status === 'completed'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Processing domains...</span>
                <span className="text-muted-foreground">
                  {activeJob.processed_rows} / {activeJob.total_rows}
                </span>
              </div>
              <Progress 
                value={(activeJob.processed_rows / activeJob.total_rows) * 100} 
                className="h-3"
              />
            </div>

            {/* Batch Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Batch Progress</span>
                <span className="text-muted-foreground">
                  Batch {activeJob.current_batch} of {activeJob.total_batches}
                </span>
              </div>
              <Progress 
                value={(activeJob.current_batch / activeJob.total_batches) * 100} 
                className="h-2"
              />
            </div>

            {/* Success/Failure Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium">{activeJob.successful_rows}</div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-sm font-medium">{activeJob.failed_rows}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            {activeJob.status === 'processing' && (
              <div className="text-xs text-muted-foreground">
                Estimated time remaining: {calculateTimeRemaining(activeJob)}
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge variant={
                activeJob.status === 'completed' ? 'default' :
                activeJob.status === 'failed' ? 'destructive' :
                activeJob.status === 'cancelled' ? 'secondary' :
                'outline'
              }>
                {activeJob.status}
              </Badge>
            </div>

            {/* Error Log */}
            {activeJob.error_log && activeJob.error_log.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Errors ({activeJob.error_log.length}):</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {activeJob.error_log.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      <strong>Row {err.row} ({err.domain}):</strong> {err.error}
                    </div>
                  ))}
                  {activeJob.error_log.length > 10 && (
                    <div className="text-xs text-muted-foreground p-2">
                      ... and {activeJob.error_log.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Imports */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-sm">{job.file_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {job.successful_rows} succeeded, {job.failed_rows} failed
                    </div>
                  </div>
                  <Badge variant={
                    job.status === 'completed' ? 'default' :
                    job.status === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
