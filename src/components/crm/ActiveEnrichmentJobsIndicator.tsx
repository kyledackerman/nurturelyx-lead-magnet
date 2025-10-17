import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ActiveJob {
  id: string;
  created_at: string;
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
}

interface ActiveEnrichmentJobsIndicatorProps {
  onOpenProgressDialog: (jobId: string) => void;
}

export default function ActiveEnrichmentJobsIndicator({ onOpenProgressDialog }: ActiveEnrichmentJobsIndicatorProps) {
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveJobs();
    
    // Subscribe to realtime updates on enrichment_jobs
    const channel = supabase
      .channel('active-enrichment-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrichment_jobs'
        },
        () => {
          fetchActiveJobs();
        }
      )
      .subscribe();

    // Polling fallback every 10 seconds
    const pollInterval = setInterval(() => {
      fetchActiveJobs();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const fetchActiveJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('status', 'running')
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      // Filter out stuck jobs (older than 15 minutes with no progress)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const recentJobs = (data || []).filter(job => {
        const hasRecentActivity = job.started_at > fifteenMinutesAgo;
        const hasProgress = job.processed_count > 0;
        return hasRecentActivity || hasProgress;
      });
      
      setActiveJobs(recentJobs);
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (activeJobs.length === 0) return;
    
    // Open progress dialog for the most recent job
    const latestJob = activeJobs[0];
    onOpenProgressDialog(latestJob.id);
  };

  if (loading || activeJobs.length === 0) {
    return null;
  }

  const latestJob = activeJobs[0];
  const progress = latestJob.processed_count > 0 
    ? Math.round((latestJob.processed_count / latestJob.total_count) * 100)
    : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={handleClick}
            className="gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">
              {activeJobs.length} Running · Click to manage
            </span>
            <span className="sm:hidden">
              {progress}%
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to view progress and stop enrichment</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
