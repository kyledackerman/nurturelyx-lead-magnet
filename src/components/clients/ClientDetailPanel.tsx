import { useEffect, useState } from "react";
import { X, ExternalLink, Edit2, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useClientAccount, useClientImplementation, useUpdateClientAccount, useUpdateClientImplementation } from "@/hooks/useClientAccounts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MiniTicketPreview } from "./MiniTicketPreview";

interface ClientDetailPanelProps {
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailPanel({ clientId, onClose }: ClientDetailPanelProps) {
  const queryClient = useQueryClient();
  const { data: client, isLoading: clientLoading } = useClientAccount(clientId);
  const { data: implementation, isLoading: implLoading } = useClientImplementation(clientId);
  const updateClient = useUpdateClientAccount();
  const updateImplementation = useUpdateClientImplementation();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);

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

  const handleSaveClientField = (field: string, value: any) => {
    if (!clientId) return;
    updateClient.mutate({ id: clientId, updates: { [field]: value } });
    setEditingField(null);
  };

  const handleSaveImplementationField = (field: string, value: any) => {
    if (!clientId) return;
    updateImplementation.mutate({ clientId, updates: { [field]: value } });
    setEditingField(null);
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue(null);
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
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {editingField === 'status' ? (
                        <div className="flex items-center gap-2">
                          <Select value={editValue} onValueChange={setEditValue}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="onboarding">Onboarding</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="at_risk">At Risk</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="churned">Churned</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveClientField('status', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(client?.status || '')}>
                            {client?.status}
                          </Badge>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('status', client?.status)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Health Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Health Score</span>
                      {editingField === 'health_score' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value))}
                            className="w-20"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleSaveClientField('health_score', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{client?.health_score}/100</span>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('health_score', client?.health_score)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Contract Value */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Value</span>
                      {editingField === 'contract_value' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue || ''}
                            onChange={(e) => setEditValue(parseFloat(e.target.value) || null)}
                            className="w-32"
                            placeholder="0"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleSaveClientField('contract_value', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {client?.contract_value
                              ? `$${client.contract_value.toLocaleString()}`
                              : '—'}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('contract_value', client?.contract_value)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Contract Start */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contract Start</span>
                      {editingField === 'contract_start_date' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={editValue ? new Date(editValue).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-40"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleSaveClientField('contract_start_date', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {client?.contract_start_date
                              ? new Date(client.contract_start_date).toLocaleDateString()
                              : '—'}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('contract_start_date', client?.contract_start_date)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Next Renewal */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Renewal</span>
                      {editingField === 'next_renewal_date' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={editValue ? new Date(editValue).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-40"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleSaveClientField('next_renewal_date', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {client?.next_renewal_date
                              ? new Date(client.next_renewal_date).toLocaleDateString()
                              : '—'}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('next_renewal_date', client?.next_renewal_date)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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
                    {/* Implementation Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {editingField === 'implementation_status' ? (
                        <div className="flex items-center gap-2">
                          <Select value={editValue} onValueChange={setEditValue}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveImplementationField('implementation_status', editValue)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getImplementationStatusColor(
                              implementation?.implementation_status || ''
                            )}
                          >
                            {implementation?.implementation_status?.replace('_', ' ')}
                          </Badge>
                          <Button size="icon" variant="ghost" onClick={() => startEdit('implementation_status', implementation?.implementation_status)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <Separator />
                    {/* Tracking Code Installed */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tracking Code Installed</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={implementation?.tracking_code_installed}
                            onCheckedChange={(checked) => {
                              const updates: any = { tracking_code_installed: checked };
                              if (checked && !implementation?.tracking_code_verified_at) {
                                updates.tracking_code_verified_at = new Date().toISOString();
                              }
                              handleSaveImplementationField('multiple', updates);
                            }}
                          />
                        </div>
                      </div>
                      {implementation?.tracking_code_verified_at && (
                        <p className="text-xs text-muted-foreground">
                          Verified: {new Date(implementation.tracking_code_verified_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Separator />
                    {/* Data Flowing */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Flowing</span>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={implementation?.data_flowing}
                            onCheckedChange={(checked) => {
                              const updates: any = { data_flowing: checked };
                              if (checked && !implementation?.first_data_received_at) {
                                updates.first_data_received_at = new Date().toISOString();
                              }
                              handleSaveImplementationField('multiple', updates);
                            }}
                          />
                        </div>
                      </div>
                      {implementation?.first_data_received_at && (
                        <p className="text-xs text-muted-foreground">
                          First data: {new Date(implementation.first_data_received_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Separator />
                    {/* Integration Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Notes</span>
                        {editingField !== 'integration_notes' && (
                          <Button size="icon" variant="ghost" onClick={() => startEdit('integration_notes', implementation?.integration_notes || '')}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {editingField === 'integration_notes' ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[100px]"
                            placeholder="Add implementation notes..."
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveImplementationField('integration_notes', editValue)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {implementation?.integration_notes || 'No notes yet'}
                        </p>
                      )}
                    </div>
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
                    {clientId && <MiniTicketPreview clientId={clientId} />}
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
