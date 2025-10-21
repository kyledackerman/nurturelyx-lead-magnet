import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import { ShoppingCart, TrendingUp, DollarSign, Search, MapPin, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";

export default function AmbassadorMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['marketplace-leads'],
    queryFn: () => ambassadorService.getMarketplaceLeads(100),
  });

  const purchaseMutation = useMutation({
    mutationFn: (prospectId: string) => ambassadorService.purchaseLead(prospectId),
    onSuccess: () => {
      toast.success('Lead purchased successfully for $0.05!');
      queryClient.invalidateQueries({ queryKey: ['marketplace-leads'] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-domains'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase lead');
    },
  });

  const bulkPurchaseMutation = useMutation({
    mutationFn: (prospectIds: string[]) => ambassadorService.bulkPurchaseLeads(prospectIds),
    onSuccess: (data: any) => {
      setSelectedLeads(new Set());
      toast.success(data.message || `Successfully purchased ${data.purchased} leads!`);
      queryClient.invalidateQueries({ queryKey: ['marketplace-leads'] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-domains'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to purchase leads');
    },
  });

  const filteredLeads = leads?.filter(lead =>
    lead.reports.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.reports.extracted_company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.reports.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredLeads) {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkPurchase = () => {
    if (selectedLeads.size === 0) return;
    
    const totalCost = (selectedLeads.size * 0.05).toFixed(2);
    const confirmMessage = `Purchase ${selectedLeads.size} lead${selectedLeads.size !== 1 ? 's' : ''} for $${totalCost}?`;
    
    if (window.confirm(confirmMessage)) {
      bulkPurchaseMutation.mutate(Array.from(selectedLeads));
    }
  };

  const allSelected = filteredLeads && filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length;
  const totalCost = (selectedLeads.size * 0.05).toFixed(2);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Marketplace</h1>
        <p className="text-muted-foreground">Purchase unassigned leads for $0.05 each</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by domain, company name, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Selection Toolbar */}
      {filteredLeads && filteredLeads.length > 0 && (
        <Card className="sticky top-0 z-10 shadow-md">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Select All
                </label>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {selectedLeads.size} of {filteredLeads.length} selected
              </div>

              {selectedLeads.size > 0 && (
                <>
                  <Button
                    onClick={handleBulkPurchase}
                    disabled={bulkPurchaseMutation.isPending}
                    className="ml-auto"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Selected ({selectedLeads.size} leads - ${totalCost})
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeads(new Set())}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredLeads && filteredLeads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads available in the marketplace</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredLeads?.map((lead) => {
          const reportData = lead.reports.report_data as any;
          const monthlyRevenue = reportData?.monthlyRevenueLost || 0;
          const missedLeads = reportData?.missedLeads || 0;
          const traffic = reportData?.organicTraffic || 0;
          const isSelected = selectedLeads.has(lead.id);

          return (
            <Card 
              key={lead.id} 
              className={`hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{lead.reports.domain}</CardTitle>
                      <CardDescription>
                        {lead.reports.extracted_company_name || 'Company Name TBD'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={lead.priority === 'hot' ? 'destructive' : 'secondary'}>
                    {lead.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(lead.reports.city || lead.reports.state) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {lead.reports.city && lead.reports.state 
                      ? `${lead.reports.city}, ${lead.reports.state}`
                      : lead.reports.state || lead.reports.city}
                  </div>
                )}

                {lead.reports.industry && (
                  <Badge variant="outline">{lead.reports.industry}</Badge>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Monthly Revenue
                    </span>
                    <span className="font-semibold">${monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Missed Leads</span>
                    <span className="font-semibold">{missedLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Traffic</span>
                    <span className="font-semibold">{traffic.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contacts Found</span>
                    <span className="font-semibold">{lead.contact_count || 0} contacts</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Purchase Price</span>
                    <span className="text-2xl font-bold flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      0.05
                    </span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => purchaseMutation.mutate(lead.id)}
                    disabled={purchaseMutation.isPending || isSelected}
                    variant={isSelected ? "secondary" : "default"}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isSelected ? 'Selected' : 'Purchase Lead'}
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
