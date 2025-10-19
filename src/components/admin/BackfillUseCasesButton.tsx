import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface BackfillUseCasesButtonProps {
  variant?: "banner" | "compact";
}

export const BackfillUseCasesButton = ({ variant = "banner" }: BackfillUseCasesButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkForActiveJob();
  }, []);

  // Realtime subscription for job updates
  useEffect(() => {
    if (!activeJob) return;

    const channel = supabase
      .channel(`job-${activeJob.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'use_case_generation_jobs',
          filter: `id=eq.${activeJob.id}`
        },
        (payload) => {
          console.log('📡 Realtime job update:', payload.new);
          setActiveJob(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJob?.id]);

  const checkForActiveJob = async () => {
    try {
      // First run cleanup to pause any truly stuck jobs
      const { error: cleanupError } = await supabase.functions.invoke('cleanup-stuck-use-case-jobs');
      
      if (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      // Then check for active/paused jobs
      const { data: jobs, error } = await supabase
        .from('use_case_generation_jobs')
        .select('*')
        .in('status', ['running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (jobs && jobs.length > 0) {
        setActiveJob(jobs[0]);
      }
    } catch (error) {
      console.error('Error checking for active job:', error);
    }
  };

  const startJob = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resume-use-case-job', {
        body: { chain: true }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('✅ Job started:', data);
      toast.success('Use case generation started!');
      
      // Refresh to get the job
      await checkForActiveJob();
    } catch (error: any) {
      console.error('Failed to start job:', error);
      toast.error(`Failed to start: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const pauseJob = async () => {
    if (!activeJob) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('use_case_generation_jobs')
        .update({ 
          status: 'paused',
          paused_at: new Date().toISOString()
        })
        .eq('id', activeJob.id);

      if (error) throw error;
      
      toast.success('Job paused');
      await checkForActiveJob();
    } catch (error: any) {
      console.error('Failed to pause:', error);
      toast.error(`Failed to pause: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resumeJob = async () => {
    if (!activeJob) return;
    
    setLoading(true);
    try {
      // Update status to running
      const { error: updateError } = await supabase
        .from('use_case_generation_jobs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', activeJob.id);

      if (updateError) throw updateError;

      // Call server function to resume
      const { data, error } = await supabase.functions.invoke('resume-use-case-job', {
        body: { 
          job_id: activeJob.id,
          chain: true 
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      console.log('✅ Job resumed:', data);
      toast.success('Use case generation resumed!');
      
      await checkForActiveJob();
    } catch (error: any) {
      console.error('Failed to resume:', error);
      toast.error(`Failed to resume: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!activeJob) return null;
    
    const statusConfig = {
      running: { label: 'Running', variant: 'default' as const, icon: Loader2 },
      paused: { label: 'Paused', variant: 'secondary' as const, icon: Pause },
      completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle2 },
    };

    const config = statusConfig[activeJob.status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${activeJob.status === 'running' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  const progress = activeJob ? 
    (activeJob.total_count > 0 ? (activeJob.processed_count / activeJob.total_count) * 100 : 0) 
    : 0;

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          
          {!activeJob && (
            <Button
              onClick={startJob}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}

          {activeJob?.status === 'paused' && (
            <Button
              onClick={resumeJob}
              variant="default"
              size="sm"
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}

          {activeJob?.status === 'running' && (
            <Button
              onClick={pauseJob}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          {activeJob && (
            <Button
              onClick={() => setShowDetails(true)}
              variant="ghost"
              size="sm"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Use Case Generation Progress</DialogTitle>
              <DialogDescription>
                {activeJob ? (
                  <span>{activeJob.processed_count} of {activeJob.total_count} reports processed</span>
                ) : (
                  <span>Generate personalized use cases for reports</span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {activeJob && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Processed</p>
                    <p className="text-2xl font-bold">{activeJob.processed_count}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Success</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {activeJob.success_count}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {activeJob.failure_count}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="mb-2">Job is running in the background on the server.</p>
                    <p>You can close this dialog or even leave the page - the job will continue processing.</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};
