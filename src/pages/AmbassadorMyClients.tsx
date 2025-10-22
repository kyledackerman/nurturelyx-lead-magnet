import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Building2, TrendingUp, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";

export default function AmbassadorMyClients() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ['my-clients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get the prospect_activity_ids for this ambassador
      const { data: prospectActivities, error: prospectError } = await supabase
        .from('prospect_activities')
        .select('id')
        .eq('purchased_by_ambassador', user.id);

      if (prospectError) throw prospectError;

      const prospectIds = prospectActivities?.map(p => p.id) || [];
      
      if (prospectIds.length === 0) {
        return [];
      }

      // Then get client accounts for those prospects
      const { data, error } = await supabase
        .from('client_accounts')
        .select(`
          id,
          domain,
          company_name,
          status,
          health_score,
          contract_value,
          contract_start_date,
          next_renewal_date,
          created_at,
          prospect_activity_id,
          client_implementation (
            tracking_code_installed,
            data_flowing,
            first_data_received_at,
            implementation_status
          )
        `)
        .in('prospect_activity_id', prospectIds)
        .in('status', ['onboarding', 'active', 'at_risk'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const filteredClients = clients?.filter(client =>
    client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = (score: number | null) => {
    if (!score) return "secondary";
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      onboarding: "secondary",
      at_risk: "destructive",
    };
    return variants[status] || "outline";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">Track implementation and performance of your closed deals</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {filteredClients && filteredClients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active clients yet</p>
              <Button className="mt-4" onClick={() => window.location.href = '/ambassador/domains'}>
                View My Domains
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {filteredClients?.map((client) => {
            const implementation = Array.isArray(client.client_implementation) 
              ? client.client_implementation[0] 
              : client.client_implementation;

            return (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-xl">{client.company_name}</CardTitle>
                          <CardDescription>{client.domain}</CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(client.status)}>
                        {client.status}
                      </Badge>
                      <Badge variant={getHealthColor(client.health_score)}>
                        Health: {client.health_score || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Implementation Status */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Implementation Progress</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {implementation?.tracking_code_installed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Tracking Code Installed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {implementation?.data_flowing ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Data Flowing</span>
                      </div>
                      {implementation?.first_data_received_at && (
                        <p className="text-xs text-muted-foreground">
                          First data received: {new Date(implementation.first_data_received_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {implementation?.implementation_status || 'not_started'}
                    </Badge>
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Contract Value</div>
                        <div className="font-semibold">
                          {client.contract_value ? `$${client.contract_value.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Contract Start</div>
                        <div className="font-semibold">
                          {client.contract_start_date 
                            ? new Date(client.contract_start_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Next Renewal</div>
                        <div className="font-semibold">
                          {client.next_renewal_date 
                            ? new Date(client.next_renewal_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Stats Placeholder */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2">Recent Activity</h3>
                    <p className="text-xs text-muted-foreground">
                      Last activity: {new Date(client.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lead delivery metrics coming soon
                    </p>
                  </div>

                  {client.status === 'at_risk' && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>This client needs attention - contact admin for details</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
