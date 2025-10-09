import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, UserCheck, Search, Target, CheckCircle, Sparkles } from "lucide-react";
import CRMHeader from "@/components/crm/CRMHeader";
import CRMMetrics from "@/components/crm/CRMMetrics";
import CRMTableView from "@/components/crm/CRMTableView";
import TasksWidget from "@/components/crm/TasksWidget";
import ProspectDetailPanel from "@/components/crm/ProspectDetailPanel";
import { AutoEnrichmentBar } from "@/components/crm/AutoEnrichmentBar";
import PipelineStatusCards from "@/components/crm/PipelineStatusCards";

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"new-prospects" | "needs-enrichment" | "ready-outreach" | "dashboard" | "closed">("dashboard");
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string | null>(null);

  const handlePipelineClick = (status: string) => {
    // Toggle filter - click same status to clear
    setPipelineStatusFilter(prev => prev === status ? null : status);
  };

  return (
    <div className="min-h-screen bg-background">
      <CRMHeader />
      
      <div className="container mx-auto px-4 py-6 max-w-[2000px]">
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-5 mb-6">
            <TabsTrigger value="new-prospects" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              New Prospects
            </TabsTrigger>
            <TabsTrigger value="needs-enrichment" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Needs Enrichment
            </TabsTrigger>
            <TabsTrigger value="ready-outreach" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Ready for Outreach
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Active Pipeline
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Closed Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new-prospects">
            <CRMTableView 
              onSelectProspect={setSelectedProspectId}
              compact={false}
              view="new-prospects"
            />
          </TabsContent>

          <TabsContent value="needs-enrichment">
            <AutoEnrichmentBar />
            <CRMTableView 
              onSelectProspect={setSelectedProspectId}
              compact={false}
              view="needs-enrichment"
            />
          </TabsContent>

          <TabsContent value="ready-outreach">
            <CRMTableView 
              onSelectProspect={setSelectedProspectId}
              compact={false}
              view="ready-outreach"
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <CRMMetrics />
            
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
          </TabsContent>

          <TabsContent value="closed">
            <CRMTableView 
              onSelectProspect={setSelectedProspectId}
              compact={false}
              view="closed"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Prospect Detail Panel */}
      {selectedProspectId && (
        <ProspectDetailPanel
          prospectId={selectedProspectId}
          onClose={() => setSelectedProspectId(null)}
        />
      )}
    </div>
  );
}
