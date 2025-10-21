import { useQuery } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Globe, TrendingUp, DollarSign, Calendar, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AmbassadorDomains() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: domains, isLoading } = useQuery({
    queryKey: ['my-domains'],
    queryFn: () => ambassadorService.getMyDomains(),
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

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Set Custom Pricing
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Custom Pricing for {domain.reports.domain}</DialogTitle>
                        <DialogDescription>
                          Set custom monthly platform fee and per-lead pricing. Minimum $0.20 per lead.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Monthly Platform Fee</Label>
                          <Input type="number" placeholder="100.00" min="100" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label>Per-Lead Price</Label>
                          <Input type="number" placeholder="1.00" min="0.20" step="0.01" />
                        </div>
                        <Button className="w-full">Save Pricing</Button>
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
  );
}
