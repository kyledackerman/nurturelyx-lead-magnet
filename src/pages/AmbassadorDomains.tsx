import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Globe, TrendingUp, DollarSign, Calendar, ExternalLink, PlusCircle, Phone, Mail, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AmbassadorDomains() {
  const [searchTerm, setSearchTerm] = useState("");
  const [perLeadPrice, setPerLeadPrice] = useState<{ [key: string]: string }>({});
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [openActivityDialog, setOpenActivityDialog] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string>("");
  const [activityNotes, setActivityNotes] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery({
    queryKey: ['my-domains'],
    queryFn: () => ambassadorService.getMyDomains(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true, // Refresh on focus to show latest enrichment status
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ prospectActivityId, perLeadPrice }: { prospectActivityId: string; perLeadPrice: number }) =>
      ambassadorService.updateClientPricing(prospectActivityId, 100, perLeadPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-domains'] });
      toast({
        title: "Pricing Updated",
        description: "Custom per-lead pricing has been saved successfully.",
      });
      setOpenDialog(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logActivityMutation = useMutation({
    mutationFn: ({ prospectActivityId, activityType, notes }: { prospectActivityId: string; activityType: string; notes: string }) =>
      ambassadorService.logActivity(prospectActivityId, activityType, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-domains'] });
      toast({
        title: "Activity Logged",
        description: "Your activity has been recorded successfully.",
      });
      setOpenActivityDialog(null);
      setActivityType("");
      setActivityNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredDomains = domains?.filter(domain =>
    domain.reports.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.reports.extracted_company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Domains</h1>
        <p className="text-muted-foreground">Manage your assigned domains and customize pricing</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {filteredDomains && filteredDomains.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No domains assigned yet</p>
            <Button className="mt-4" onClick={() => window.location.href = '/ambassador/marketplace'}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredDomains?.map((domain) => {
          const reportData = domain.reports.report_data as any;
          const monthlyRevenue = reportData?.monthlyRevenueLost || 0;
          const missedLeads = reportData?.missedLeads || 0;

          return (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-xl">{domain.reports.domain}</CardTitle>
                        <CardDescription>
                          {domain.reports.extracted_company_name || 'Company Name TBD'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      domain.status === 'closed_won' ? 'default' :
                      domain.status === 'contacted' ? 'secondary' :
                      'outline'
                    }>
                      {domain.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={domain.priority === 'hot' ? 'destructive' : 'secondary'}>
                      {domain.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                      <div className="font-semibold">${monthlyRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Missed Leads</div>
                      <div className="font-semibold">{missedLeads.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Assigned Date</div>
                      <div className="font-semibold">
                        {new Date(domain.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Dialog open={openActivityDialog === domain.id} onOpenChange={(open) => setOpenActivityDialog(open ? domain.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Log Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Activity for {domain.reports.domain}</DialogTitle>
                        <DialogDescription>
                          Track your sales activities to stay organized
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Activity Type</Label>
                          <Select value={activityType} onValueChange={setActivityType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="called">
                                <Phone className="h-4 w-4 inline mr-2" />
                                Called
                              </SelectItem>
                              <SelectItem value="emailed">
                                <Mail className="h-4 w-4 inline mr-2" />
                                Emailed
                              </SelectItem>
                              <SelectItem value="demo">
                                <MessageSquare className="h-4 w-4 inline mr-2" />
                                Demo Scheduled
                              </SelectItem>
                              <SelectItem value="proposal">
                                <FileText className="h-4 w-4 inline mr-2" />
                                Proposal Sent
                              </SelectItem>
                              <SelectItem value="follow_up">Follow-Up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Add any relevant details..."
                            value={activityNotes}
                            onChange={(e) => setActivityNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            if (!activityType) {
                              toast({
                                title: "Missing Information",
                                description: "Please select an activity type",
                                variant: "destructive",
                              });
                              return;
                            }
                            logActivityMutation.mutate({
                              prospectActivityId: domain.id,
                              activityType,
                              notes: activityNotes,
                            });
                          }}
                          disabled={logActivityMutation.isPending}
                        >
                          {logActivityMutation.isPending ? "Logging..." : "Log Activity"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={openDialog === domain.id} onOpenChange={(open) => setOpenDialog(open ? domain.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Set Per-Lead Price
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Per-Lead Price for {domain.reports.domain}</DialogTitle>
                        <DialogDescription>
                          Set the custom per-lead pricing agreed with the customer. Minimum $0.20 per lead. Platform fee is fixed at $100/month.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Per-Lead Price</Label>
                          <Input 
                            type="number" 
                            placeholder="1.00" 
                            min="0.20" 
                            step="0.01"
                            value={perLeadPrice[domain.id] || ""}
                            onChange={(e) => setPerLeadPrice(prev => ({ ...prev, [domain.id]: e.target.value }))}
                          />
                          <p className="text-sm text-muted-foreground">
                            Monthly platform fee: $100.00 (fixed)
                          </p>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            const price = parseFloat(perLeadPrice[domain.id] || "0");
                            if (price < 0.20) {
                              toast({
                                title: "Invalid Price",
                                description: "Per-lead price must be at least $0.20",
                                variant: "destructive",
                              });
                              return;
                            }
                            updatePricingMutation.mutate({
                              prospectActivityId: domain.id,
                              perLeadPrice: price,
                            });
                          }}
                          disabled={updatePricingMutation.isPending}
                        >
                          {updatePricingMutation.isPending ? "Saving..." : "Save Pricing"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" asChild>
                    <a href={`/report/${domain.reports.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Report
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      </div>
    </>
  );
}
