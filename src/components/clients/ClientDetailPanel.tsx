import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientAccount, useClientImplementation } from "@/hooks/useClientAccounts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ClientDetailPanelProps {
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailPanel({ clientId, onClose }: ClientDetailPanelProps) {
  const queryClient = useQueryClient();
  const { data: client, isLoading: clientLoading } = useClientAccount(clientId);
  const { data: implementation, isLoading: implLoading } = useClientImplementation(clientId);

  useEffect(() => {
    if (!clientId) return;

    // Subscribe to real-time updates for this client
    const channel = supabase
      .channel(`client-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'client_accounts',
          filter: `id=eq.${clientId}`,
        },
        () => {
          // Refetch queries when client updates
          queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  if (!clientId) return null;

  const isLoading = clientLoading || implLoading;

  const getStatusColor = (status: string) => {
    const colors = {
      onboarding: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      at_risk: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      churned: 'bg-red-500/10 text-red-500 border-red-500/20',
      paused: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getImplementationStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      blocked: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[status as keyof typeof colors] || colors.not_started;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-background border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <>
              <h2 className="text-2xl font-bold">{client?.company_name}</h2>
              <p className="text-sm text-muted-foreground">{client?.domain}</p>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="outline" className={getStatusColor(client?.status || '')}>
                        {client?.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Health Score</span>
                      <span className="font-semibold">{client?.health_score}/100</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Value</span>
                      <span className="font-semibold">
                        {client?.contract_value
                          ? `$${client.contract_value.toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Start</span>
                      <span>
                        {client?.contract_start_date
                          ? new Date(client.contract_start_date).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Renewal</span>
                      <span>
                        {client?.next_renewal_date
                          ? new Date(client.next_renewal_date).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Progress</CardTitle>
                    <CardDescription>
                      Track technical onboarding and setup status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge
                        variant="outline"
                        className={getImplementationStatusColor(
                          implementation?.implementation_status || ''
                        )}
                      >
                        {implementation?.implementation_status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tracking Code Installed</span>
                        <Badge variant={implementation?.tracking_code_installed ? 'default' : 'secondary'}>
                          {implementation?.tracking_code_installed ? '✓ Yes' : 'No'}
                        </Badge>
                      </div>
                      {implementation?.tracking_code_verified_at && (
                        <p className="text-xs text-muted-foreground">
                          Verified: {new Date(implementation.tracking_code_verified_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Flowing</span>
                        <Badge variant={implementation?.data_flowing ? 'default' : 'secondary'}>
                          {implementation?.data_flowing ? '✓ Yes' : 'No'}
                        </Badge>
                      </div>
                      {implementation?.first_data_received_at && (
                        <p className="text-xs text-muted-foreground">
                          First data: {new Date(implementation.first_data_received_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {implementation?.integration_notes && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-sm font-medium">Notes</span>
                          <p className="text-sm text-muted-foreground mt-2">
                            {implementation.integration_notes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                    <CardDescription>
                      Recent support tickets for this client
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      View all tickets for this client in the Support Tickets section.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={`/admin/clients?view=support&client=${clientId}`}>
                        View All Support Tickets
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Journey</CardTitle>
                    <CardDescription>
                      View the complete history from prospect to client
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/admin/crm?prospect=${client?.prospect_activity_id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Original Prospect
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
