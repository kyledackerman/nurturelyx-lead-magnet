import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ActiveEnrichmentJobsIndicator from "./ActiveEnrichmentJobsIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CRMHeaderProps {
  onResumeEnrichment?: (jobId: string) => void;
  currentView: string;
  onRefreshData: () => void;
}

export default function CRMHeader({ onResumeEnrichment, currentView, onRefreshData }: CRMHeaderProps) {
  const navigate = useNavigate();
  
  // Show enrichment buttons only on needs-enrichment and needs-review tabs
  const showEnrichmentButtons = currentView === 'needs-enrichment' || currentView === 'needs-review';

  const handleCleanupStuckJobs = async () => {
    try {
      toast.loading("Cleaning up stuck enrichments...");
      const { data, error } = await supabase.functions.invoke('cleanup-stuck-enrichment-jobs');
      
      if (error) throw error;
      
      const summary = data.prospectsTerminalized;
      toast.success(
        `✅ Cleanup complete: ${data.locksReleased} locks released, ` +
        `${summary.enriched} enriched, ${summary.review} review, ${summary.missingEmails} missing emails, ` +
        `${data.jobsReconciled} jobs reconciled`
      );
      
      // Auto-refresh after cleanup
      setTimeout(() => onRefreshData(), 500);
    } catch (error) {
      console.error('Error cleaning up stuck jobs:', error);
      toast.error("Failed to clean up stuck jobs");
    }
  };

  const handleForceClearAll = async () => {
    const confirmed = window.confirm(
      "⚠️ EMERGENCY STOP: This will stop all running enrichments and release locks, but will NOT change prospect statuses. Continue?"
    );
    
    if (!confirmed) return;
    
    try {
      toast.loading("Emergency stop in progress...");
      const { data, error } = await supabase.functions.invoke('force-clear-enrichments');
      
      if (error) throw error;
      
      toast.success(`✅ Emergency stop complete (safe): ${data.jobsFailed} jobs stopped, ${data.locksReleased} locks released`);
      
      // Refresh after 1 second
      setTimeout(() => onRefreshData(), 1000);
    } catch (error) {
      console.error('Error during emergency stop:', error);
      toast.error("Failed to execute emergency stop");
    }
  };

  const handleRegenerateIcebreakers = async () => {
    const confirmed = window.confirm(
      "Generate icebreakers for all enriched prospects that are missing them?"
    );
    
    if (!confirmed) return;
    
    try {
      toast.loading("Regenerating icebreakers...");
      const { data, error } = await supabase.functions.invoke('regenerate-icebreakers');
      
      if (error) throw error;
      
      if (data.count === 0) {
        toast.success("No prospects need icebreaker generation");
      } else {
        toast.success(`✅ Generated ${data.successCount} of ${data.total} icebreakers`);
        if (data.failedCount > 0) {
          toast.warning(`⚠️ ${data.failedCount} failed`);
        }
      }
      
      // Refresh after 1 second
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error regenerating icebreakers:', error);
      toast.error("Failed to regenerate icebreakers");
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-2xl font-bold">CRM Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your sales pipeline and convert prospects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onResumeEnrichment && (
              <ActiveEnrichmentJobsIndicator onResumeJob={onResumeEnrichment} />
            )}
            
            {/* Enrichment-specific buttons - only show on needs-enrichment and needs-review */}
            {showEnrichmentButtons && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleForceClearAll}
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Emergency Stop (safe)</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCleanupStuckJobs}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clean Up Stuck Jobs</span>
                </Button>
              </>
            )}
            
            {/* Universal refresh button - always visible */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
