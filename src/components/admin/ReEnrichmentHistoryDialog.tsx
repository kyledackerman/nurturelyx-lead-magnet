import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Play, Clock, CheckCircle2, XCircle, Pause } from "lucide-react";

interface ReEnrichmentJob {
  id: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  total_count: number;
  processed_count: number;
  enriched_count: number;
  not_found_count: number;
  error_count: number;
  status: string;
  stopped_reason: string | null;
  max_domains_to_process: number;
}

interface ReEnrichmentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResume?: (jobId: string) => void;
}

export function ReEnrichmentHistoryDialog({ 
  open, 
  onOpenChange,
  onResume 
}: ReEnrichmentHistoryDialogProps) {
  const [jobs, setJobs] = useState<ReEnrichmentJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('re_enrichment_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      running: { variant: "default", icon: Clock },
      paused: { variant: "secondary", icon: Pause },
      completed: { variant: "success", icon: CheckCircle2 },
      failed: { variant: "destructive", icon: XCircle },
      queued: { variant: "outline", icon: Clock },
    };

    const config = variants[status] || variants.queued;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSuccessRate = (job: ReEnrichmentJob) => {
    if (job.processed_count === 0) return "0%";
    return `${Math.round((job.enriched_count / job.processed_count) * 100)}%`;
  };

  const getDuration = (job: ReEnrichmentJob) => {
    if (!job.started_at) return "Not started";
    const start = new Date(job.started_at);
    const end = job.completed_at ? new Date(job.completed_at) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const handleResume = (jobId: string) => {
    onResume?.(jobId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Re-Enrichment History</DialogTitle>
          <DialogDescription>
            View past re-enrichment jobs and their results
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading history...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No re-enrichment jobs found</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Processed</TableHead>
                  <TableHead className="text-right">Enriched</TableHead>
                  <TableHead className="text-right">Not Found</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(job.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(job.status)}
                        {job.stopped_reason && (
                          <span className="text-xs text-muted-foreground">
                            {job.stopped_reason.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {job.processed_count}/{job.max_domains_to_process}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {job.enriched_count}
                    </TableCell>
                    <TableCell className="text-right text-yellow-600">
                      {job.not_found_count}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {job.error_count}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {getSuccessRate(job)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {getDuration(job)}
                    </TableCell>
                    <TableCell>
                      {job.status === 'paused' && onResume && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResume(job.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
