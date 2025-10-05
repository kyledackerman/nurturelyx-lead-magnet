import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Table, CheckCircle } from "lucide-react";
import CRMHeader from "@/components/crm/CRMHeader";
import CRMMetrics from "@/components/crm/CRMMetrics";
import CRMTableView from "@/components/crm/CRMTableView";
import TasksWidget from "@/components/crm/TasksWidget";
import ProspectDetailPanel from "@/components/crm/ProspectDetailPanel";

export default function CRMDashboard() {
  const [selectedView, setSelectedView] = useState<"dashboard" | "table" | "closed">("dashboard");
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <CRMHeader />
      
      <div className="container mx-auto px-4 py-6 max-w-[2000px]">
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Closed Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <CRMMetrics />
                <CRMTableView 
                  onSelectProspect={setSelectedProspectId}
                  compact={true}
                />
              </div>
              <div>
                <TasksWidget />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <CRMTableView 
              onSelectProspect={setSelectedProspectId}
              compact={false}
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
