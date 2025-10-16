import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ActiveEnrichmentJobsIndicator from "./ActiveEnrichmentJobsIndicator";
import { CompanyNameRegenerationDialog } from "./CompanyNameRegenerationDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface CRMHeaderProps {
  onResumeEnrichment?: (jobId: string) => void;
}

export default function CRMHeader({ onResumeEnrichment }: CRMHeaderProps) {
  const navigate = useNavigate();
  const [regenerationResults, setRegenerationResults] = useState<any>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const handleCleanupStuckJobs = async () => {
    try {
      const { error } = await supabase.functions.invoke('cleanup-stuck-enrichment-jobs');
      
      if (error) throw error;
      
      toast.success("Stuck enrichment jobs cleaned up");
    } catch (error) {
      console.error('Error cleaning up stuck jobs:', error);
      toast.error("Failed to clean up stuck jobs");
    }
  };

  const handleForceClearAll = async () => {
    const confirmed = window.confirm(
      "⚠️ This will FORCE STOP all running enrichments and clear ALL locks. Are you sure?"
    );
    
    if (!confirmed) return;
    
    try {
      toast.loading("Force clearing all enrichments...");
      const { data, error } = await supabase.functions.invoke('force-clear-enrichments');
      
      if (error) throw error;
      
      toast.success(`✅ Force cleared: ${data.jobsFailed} jobs, ${data.locksReleased} locks, ${data.prospectsMoved} prospects moved to review`);
      
      // Refresh the page after 1 second
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error force clearing enrichments:', error);
      toast.error("Failed to force clear enrichments");
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

  const handleFixCompanyNames = async () => {
    const confirmed = window.confirm(
      "Regenerate proper company names for all enriched prospects with domain-like names? This will use AI credits."
    );
    
    if (!confirmed) return;
    
    const loadingToast = toast.loading("Regenerating company names...");
    
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-company-names', {
        body: { regenerate_all: true }
      });
      
      if (error) {
        toast.dismiss(loadingToast);
        if (error.message?.includes("402") || error.message?.includes("credits")) {
          toast.error("Out of AI Credits", {
            description: "Please add credits to your Lovable workspace (Settings → Usage) before regenerating company names.",
          });
        } else {
          toast.error("Failed to fix company names", {
            description: error.message,
          });
        }
        return;
      }
      
      toast.dismiss(loadingToast);
      setRegenerationResults(data);
      setShowResultsDialog(true);
      
      if (data.updated?.length > 0) {
        toast.success(`Updated ${data.updated.length} company names`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.info("No company names needed fixing");
      }
    } catch (error: any) {
      console.error('Error fixing company names:', error);
      toast.dismiss(loadingToast);
      if (error.message?.includes("402") || error.message?.includes("credits")) {
        toast.error("Out of AI Credits", {
          description: "Please add credits to your Lovable workspace (Settings → Usage) before regenerating company names.",
        });
      } else {
        toast.error("Failed to fix company names");
      }
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleForceClearAll}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Force Clear ALL</span>
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

      <CompanyNameRegenerationDialog
        open={showResultsDialog}
        onOpenChange={setShowResultsDialog}
        results={regenerationResults}
      />
    </div>
  );
}
