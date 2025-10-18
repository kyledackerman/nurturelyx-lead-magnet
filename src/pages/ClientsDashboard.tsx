import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientsSidebar } from "@/components/clients/ClientsSidebar";
import { ClientsTableView } from "@/components/clients/ClientsTableView";
import { ClientDetailPanel } from "@/components/clients/ClientDetailPanel";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

export default function ClientsDashboard() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <ClientsSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">Client Management</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage client relationships and implementation
                  </p>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              <ClientsTableView onSelectClient={setSelectedClientId} />
            </main>
          </div>

          {/* Detail Panel */}
          {selectedClientId && (
            <ClientDetailPanel
              clientId={selectedClientId}
              onClose={() => setSelectedClientId(null)}
            />
          )}
        </div>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
