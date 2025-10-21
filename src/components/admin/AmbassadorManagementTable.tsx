import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, Loader2, TrendingUp, DollarSign, Target, Award } from "lucide-react";

interface Ambassador {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  status: string;
  platform_fee_tier: string;
  per_lead_tier: string;
  total_signups_lifetime: number;
  active_domains_count: number;
  total_domains_purchased: number;
  total_leads_processed: number;
  total_revenue_generated: number;
  total_spent_on_leads: number;
  pending_commission: number;
  eligible_commission: number;
  lifetime_commission_paid: number;
  created_at: string;
}

export const AmbassadorManagementTable = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);

  useEffect(() => {
    fetchAmbassadors();
    
    // Real-time updates
    const channel = supabase
      .channel('ambassador-profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ambassador_profiles' },
        () => {
          fetchAmbassadors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAmbassadors(data || []);
    } catch (error) {
      console.error('Error fetching ambassadors:', error);
      toast.error('Failed to fetch ambassadors');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Gold</Badge>;
      case 'silver':
        return <Badge className="bg-gray-400/10 text-gray-600 border-gray-400/20">Silver</Badge>;
      case 'bronze':
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Bronze</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-400/10 text-gray-600 border-gray-400/20">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ambassador Management</CardTitle>
              <CardDescription>
                View and manage all ambassadors
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {ambassadors.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : ambassadors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ambassadors yet
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(ambassadors.reduce((sum, a) => sum + Number(a.total_revenue_generated), 0))}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Signups</p>
                        <p className="text-2xl font-bold">
                          {ambassadors.reduce((sum, a) => sum + a.total_signups_lifetime, 0)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Domains</p>
                        <p className="text-2xl font-bold">
                          {ambassadors.reduce((sum, a) => sum + a.active_domains_count, 0)}
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Paid</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(ambassadors.reduce((sum, a) => sum + Number(a.lifetime_commission_paid), 0))}
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Platform Tier</TableHead>
                    <TableHead>Per-Lead Tier</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Active Domains</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ambassadors.map((ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ambassador.full_name}</p>
                          <p className="text-xs text-muted-foreground">{ambassador.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ambassador.status)}</TableCell>
                      <TableCell>{getTierBadge(ambassador.platform_fee_tier)}</TableCell>
                      <TableCell>{getTierBadge(ambassador.per_lead_tier)}</TableCell>
                      <TableCell className="font-medium">{ambassador.total_signups_lifetime}</TableCell>
                      <TableCell className="font-medium">{ambassador.active_domains_count}</TableCell>
                      <TableCell>{formatCurrency(Number(ambassador.total_revenue_generated))}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatCurrency(Number(ambassador.lifetime_commission_paid))}</p>
                          <p className="text-xs text-muted-foreground">
                            Pending: {formatCurrency(Number(ambassador.pending_commission))}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedAmbassador(ambassador)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ambassador Details Dialog */}
      <Dialog open={selectedAmbassador !== null} onOpenChange={() => setSelectedAmbassador(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ambassador Details</DialogTitle>
            <DialogDescription>
              Complete profile for {selectedAmbassador?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedAmbassador && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm">{selectedAmbassador.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{selectedAmbassador.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{selectedAmbassador.location || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status & Tiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedAmbassador.status)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Platform Fee Tier</p>
                      <div className="mt-1">{getTierBadge(selectedAmbassador.platform_fee_tier)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Per-Lead Tier</p>
                      <div className="mt-1">{getTierBadge(selectedAmbassador.per_lead_tier)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Signups</p>
                      <p className="text-2xl font-bold">{selectedAmbassador.total_signups_lifetime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Domains</p>
                      <p className="text-2xl font-bold">{selectedAmbassador.active_domains_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Domains Purchased</p>
                      <p className="text-2xl font-bold">{selectedAmbassador.total_domains_purchased}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Leads Processed</p>
                      <p className="text-2xl font-bold">{selectedAmbassador.total_leads_processed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue Generated</p>
                      <p className="text-2xl font-bold">{formatCurrency(Number(selectedAmbassador.total_revenue_generated))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Spent on Leads</p>
                      <p className="text-2xl font-bold">{formatCurrency(Number(selectedAmbassador.total_spent_on_leads))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Pending Commission</p>
                      <p className="text-xl font-bold text-yellow-600">{formatCurrency(Number(selectedAmbassador.pending_commission))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Eligible Commission</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(Number(selectedAmbassador.eligible_commission))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lifetime Paid</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(Number(selectedAmbassador.lifetime_commission_paid))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground">
                Member since: {new Date(selectedAmbassador.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
