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

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"warm-inbound" | "new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed" | "needs-review" | "interested" | "missing-emails">("needs-review");
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
              <CRMHeader onResumeEnrichment={handleResumeEnrichment} />
              
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
