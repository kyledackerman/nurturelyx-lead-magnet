import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Eye, History } from "lucide-react";
import { toast } from "sonner";
import BulkEnrichmentProgressDialog from "@/components/crm/BulkEnrichmentProgressDialog";

interface EnrichmentJob {
  id: string;
  job_type: string;
  status: string;
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  started_at: string;
  completed_at: string | null;
  stopped_reason: string | null;
  success_rate: number;
  duration_ms: number | null;
}

export const EnrichmentJobHistory = () => {
  const [jobs, setJobs] = useState<EnrichmentJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchJobs();
    }
  }, [expanded]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-enrichment-history', {
        body: { limit: 20, offset: 0 }
      });

      if (error) throw error;
      setJobs(data.jobs || []);
    } catch (error: any) {
      console.error('Error fetching job history:', error);
      toast.error('Failed to load enrichment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return '—';
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'stopped':
        return <Badge className="bg-orange-500 text-white">Stopped</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 text-white">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Enrichment History</CardTitle>
                <CardDescription>View past enrichment jobs and their results</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading history...</div>
            ) : jobs.length === 0 ? (
              <div className="text-sm text-muted-foreground">No enrichment jobs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Started</th>
                      <th className="text-left py-2 px-2 font-medium">Type</th>
                      <th className="text-left py-2 px-2 font-medium">Status</th>
                      <th className="text-right py-2 px-2 font-medium">Total</th>
                      <th className="text-right py-2 px-2 font-medium">Success</th>
                      <th className="text-right py-2 px-2 font-medium">Failed</th>
                      <th className="text-right py-2 px-2 font-medium">Rate</th>
                      <th className="text-right py-2 px-2 font-medium">Duration</th>
                      <th className="text-center py-2 px-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">
                          <div className="text-xs">
                            {new Date(job.started_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(job.started_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <Badge variant={job.job_type === 'manual' ? 'default' : 'secondary'}>
                            {job.job_type === 'manual' ? 'Manual' : 'Auto'}
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          {getStatusBadge(job.status)}
                        </td>
                        <td className="py-2 px-2 text-right font-medium">{job.total_count}</td>
                        <td className="py-2 px-2 text-right text-green-600">{job.success_count}</td>
                        <td className="py-2 px-2 text-right text-red-600">{job.failed_count}</td>
                        <td className={`py-2 px-2 text-right font-bold ${getSuccessRateColor(job.success_rate)}`}>
                          {job.success_rate}%
                        </td>
                        <td className="py-2 px-2 text-right text-muted-foreground">
                          {formatDuration(job.duration_ms)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(job.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {selectedJobId && (
        <BulkEnrichmentProgressDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          progress={new Map()}
          jobId={selectedJobId}
        />
      )}
    </>
  );
};
