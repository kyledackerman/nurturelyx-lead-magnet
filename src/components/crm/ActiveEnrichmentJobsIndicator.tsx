import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  onResumeJob: (jobId: string) => void;
}

export default function ActiveEnrichmentJobsIndicator({ onResumeJob }: ActiveEnrichmentJobsIndicatorProps) {
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
          table: 'enrichment_jobs',
          filter: 'status=eq.running'
        },
        () => {
          fetchActiveJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      setActiveJobs(data || []);
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeClick = () => {
    if (activeJobs.length === 0) return;
    
    // Resume the most recent job
    const latestJob = activeJobs[0];
    onResumeJob(latestJob.id);
    
    const progress = latestJob.processed_count > 0 
      ? Math.round((latestJob.processed_count / latestJob.total_count) * 100)
      : 0;
    
    toast.info(`Resuming enrichment (${progress}% complete)`);
  };

  if (loading || activeJobs.length === 0) {
    return null;
  }

  const latestJob = activeJobs[0];
  const progress = latestJob.processed_count > 0 
    ? Math.round((latestJob.processed_count / latestJob.total_count) * 100)
    : 0;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResumeClick}
      className="gap-2"
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="hidden sm:inline">
        {activeJobs.length} Enrichment{activeJobs.length > 1 ? 's' : ''} Running
      </span>
      <span className="sm:hidden">
        {progress}%
      </span>
    </Button>
  );
}
