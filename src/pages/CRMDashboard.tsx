import { useState } from "react";
import CRMHeader from "@/components/crm/CRMHeader";
import CRMTableView from "@/components/crm/CRMTableView";
import TasksWidget from "@/components/crm/TasksWidget";
import ProspectDetailPanel from "@/components/crm/ProspectDetailPanel";
import PipelineStatusCards from "@/components/crm/PipelineStatusCards";
import { ContactTrendChart } from "@/components/crm/ContactTrendChart";
import { ProspectTrendChart } from "@/components/crm/ProspectTrendChart";
import { CRMRealtimeProvider } from "@/contexts/CRMRealtimeContext";
import { CRMErrorBoundary } from "@/components/crm/CRMErrorBoundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/crm/CRMSidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"warm-inbound" | "new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed" | "needs-review" | "interested" | "missing-emails" | "bad-company-names">("needs-review");
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string | null>(null);
  const [resumedJobId, setResumedJobId] = useState<string | null>(null);

  const handlePipelineClick = (status: string) => {
    // Toggle filter - click same status to clear
    setPipelineStatusFilter(prev => prev === status ? null : status);
  };

  const handleResumeEnrichment = (jobId: string) => {
    setResumedJobId(jobId);
    // Switch to needs-enrichment view to show the table with resume capability
    setSelectedView("needs-enrichment");
  };

  return (
    <CRMErrorBoundary>
      <CRMRealtimeProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full bg-background">
            <CRMSidebar 
              selectedView={selectedView}
              onViewChange={setSelectedView}
            />
            
            <main className="flex-1 flex flex-col">
      <CRMHeader 
        onResumeEnrichment={handleResumeEnrichment}
        onReconcileStatus={async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              toast.error("Not authenticated");
              return;
            }

            toast.loading("Reconciling prospect statuses...", { id: "reconcile" });

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reconcile-prospect-status`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const result = await response.json();

            if (response.ok && result.success) {
              toast.success(
                `✅ Reconciliation complete! ${result.fixed_to_enriched} promoted to enriched, ${result.moved_to_review} moved to review, ${result.reset_to_enriching} reset to enriching`,
                { id: "reconcile", duration: 6000 }
              );
            } else {
              toast.error(result.error || "Reconciliation failed", { id: "reconcile" });
            }
          } catch (error) {
            console.error("Reconciliation error:", error);
            toast.error("Failed to reconcile statuses", { id: "reconcile" });
          }
        }}
      />
              
              <div className="container mx-auto px-4 py-6 max-w-[2000px]">
                {selectedView === "warm-inbound" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="warm-inbound"
                  />
                )}

                {selectedView === "needs-review" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="needs-review"
                  />
                )}

                {selectedView === "missing-emails" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="missing-emails"
                  />
                )}

                {selectedView === "new-prospects" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="new-prospects"
                  />
                )}

                {selectedView === "needs-enrichment" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="needs-enrichment"
                    resumeJobId={resumedJobId}
                    onJobResumed={() => setResumedJobId(null)}
                  />
                )}

                {selectedView === "ready-outreach" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="ready-outreach"
                  />
                )}

                {selectedView === "interested" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="interested"
                  />
                )}

                {selectedView === "dashboard" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ProspectTrendChart />
                      <ContactTrendChart />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-1">
                        <TasksWidget />
                      </div>
                      <div className="lg:col-span-2">
                        <PipelineStatusCards 
                          onStatusClick={handlePipelineClick}
                          activeStatus={pipelineStatusFilter}
                        />
                      </div>
                    </div>

                    <CRMTableView 
                      onSelectProspect={setSelectedProspectId}
                      compact={false}
                      view="active"
                      externalStatusFilter={pipelineStatusFilter}
                    />
                  </div>
                )}

                {selectedView === "closed" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="closed"
                  />
                )}

                {selectedView === "bad-company-names" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-orange-900 mb-2">⚠️ Company Names Need Fixing</h3>
                      <p className="text-sm text-orange-800">
                        These prospects have domain-like company names or missing names. 
                        Use "✨ Fix Company Names" button in header to regenerate all, or manually edit each one.
                      </p>
                    </div>
                    <CRMTableView 
                      onSelectProspect={setSelectedProspectId}
                      compact={false}
                      view="bad-company-names"
                    />
                  </div>
                )}
              </div>

              {/* Prospect Detail Panel */}
              {selectedProspectId && (
                <ProspectDetailPanel
                  prospectId={selectedProspectId}
                  onClose={() => setSelectedProspectId(null)}
                />
              )}
            </main>
          </div>
        </SidebarProvider>
      </CRMRealtimeProvider>
    </CRMErrorBoundary>
  );
}
