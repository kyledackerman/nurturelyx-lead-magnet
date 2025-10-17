import { useState } from "react";
import CRMHeader from "@/components/crm/CRMHeader";
import CRMTableView from "@/components/crm/CRMTableView";
import ProspectDetailPanel from "@/components/crm/ProspectDetailPanel";
import BulkEnrichmentProgressDialog from "@/components/crm/BulkEnrichmentProgressDialog";
import PipelineStatusCards from "@/components/crm/PipelineStatusCards";
import { UniqueDomainsTrendChart } from "@/components/crm/UniqueDomainsTrendChart";
import { OutreachVelocityChart } from "@/components/crm/OutreachVelocityChart";
import { ConversionFunnelCard } from "@/components/crm/ConversionFunnelCard";
import { CRMRealtimeProvider } from "@/contexts/CRMRealtimeContext";
import { CRMErrorBoundary } from "@/components/crm/CRMErrorBoundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/crm/CRMSidebar";
import { toast } from "sonner";

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"warm-inbound" | "new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed" | "needs-review" | "interested" | "missing-emails" | "needs-company">("needs-review");
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string | null>(null);
  const [progressDialogJobId, setProgressDialogJobId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePipelineClick = (status: string) => {
    // Toggle filter - click same status to clear
    setPipelineStatusFilter(prev => prev === status ? null : status);
  };

  const handleOpenProgressDialog = (jobId: string) => {
    setProgressDialogJobId(jobId);
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success("Refreshing data...");
  };

  const handleDomainSelect = (prospectId: string) => {
    setSelectedProspectId(prospectId);
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
            onOpenProgressDialog={handleOpenProgressDialog}
            currentView={selectedView}
            onRefreshData={handleRefreshData}
            onDomainSelect={handleDomainSelect}
          />
              
              <div className="container mx-auto px-4 py-6 max-w-[2000px]">
                {selectedView === "warm-inbound" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="warm-inbound"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "needs-review" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="needs-review"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "missing-emails" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="missing-emails"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "needs-company" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="needs-company"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "new-prospects" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="new-prospects"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "needs-enrichment" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="needs-enrichment"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "ready-outreach" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="ready-outreach"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "interested" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="interested"
                    refreshTrigger={refreshTrigger}
                  />
                )}

                {selectedView === "dashboard" && (
                  <div className="space-y-6">
                    {/* Conversion Funnel */}
                    <ConversionFunnelCard />
                    
                    {/* Trend Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <UniqueDomainsTrendChart />
                      <OutreachVelocityChart />
                    </div>
                    
                    {/* Pipeline Status Cards */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Pipeline by Status</h3>
                      <PipelineStatusCards 
                        onStatusClick={handlePipelineClick}
                        activeStatus={pipelineStatusFilter}
                      />
                    </div>

                    {/* Active Prospects Table */}
                    <CRMTableView 
                      onSelectProspect={setSelectedProspectId}
                      compact={false}
                      view="active"
                      externalStatusFilter={pipelineStatusFilter}
                      refreshTrigger={refreshTrigger}
                    />
                  </div>
                )}

                {selectedView === "closed" && (
                  <CRMTableView 
                    onSelectProspect={setSelectedProspectId}
                    compact={false}
                    view="closed"
                    refreshTrigger={refreshTrigger}
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

              {/* Enrichment Progress Dialog */}
              {progressDialogJobId && (
                <BulkEnrichmentProgressDialog
                  open={!!progressDialogJobId}
                  onOpenChange={(open) => {
                    if (!open) {
                      setProgressDialogJobId(null);
                      handleRefreshData();
                    }
                  }}
                  progress={new Map()}
                  jobId={progressDialogJobId}
                />
              )}
            </main>
          </div>
        </SidebarProvider>
      </CRMRealtimeProvider>
    </CRMErrorBoundary>
  );
}
