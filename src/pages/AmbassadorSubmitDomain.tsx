import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ambassadorService } from "@/services/ambassadorService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AmbassadorSubmitDomain() {
  const [domain, setDomain] = useState("");
  const [industryHint, setIndustryHint] = useState("");
  const [estimatedTraffic, setEstimatedTraffic] = useState("");
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: () => ambassadorService.submitDomain(
      domain, 
      industryHint || undefined, 
      estimatedTraffic ? parseInt(estimatedTraffic) : undefined
    ),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Domain submitted and assigned to you for free!');
        queryClient.invalidateQueries({ queryKey: ['my-domains'] });
        queryClient.invalidateQueries({ queryKey: ['ambassador-stats'] });
        setDomain("");
        setIndustryHint("");
        setEstimatedTraffic("");
      } else if (data.alreadyExists && data.canPurchase) {
        toast.error(`Domain already exists. You can purchase it from the marketplace for $${data.purchase_price}`, {
          duration: 5000,
        });
      } else if (data.alreadyExists && !data.canPurchase) {
        toast.error('This domain is already assigned to another ambassador');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit domain');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit New Domain</h1>
        <p className="text-muted-foreground">Submit a new USA-based domain and get it assigned to you for free</p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Free Assignment:</strong> New domains are automatically assigned to you at no cost. 
          Only USA-based domains (.com, .net, .org, etc.) are accepted.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Domain Information</CardTitle>
          <CardDescription>
            Enter the domain details. We'll validate and create a report automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter without http:// or www. (e.g., example.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry Hint (Optional)</Label>
              <Input
                id="industry"
                placeholder="e.g., HVAC, Real Estate, Legal"
                value={industryHint}
                onChange={(e) => setIndustryHint(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="traffic">Estimated Monthly Traffic (Optional)</Label>
              <Input
                id="traffic"
                type="number"
                placeholder="e.g., 10000"
                value={estimatedTraffic}
                onChange={(e) => setEstimatedTraffic(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Domain'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">1. Domain Validation</div>
              <p className="text-sm text-muted-foreground">
                We verify the domain is USA-based and doesn't already exist in our system
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">2. Report Generation</div>
              <p className="text-sm text-muted-foreground">
                A detailed lead report is created with traffic estimates and revenue potential
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">3. Free Assignment</div>
              <p className="text-sm text-muted-foreground">
                The domain is automatically assigned to you at no cost
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">4. Start Earning</div>
              <p className="text-sm text-muted-foreground">
                Begin your sales process and earn commissions on successful conversions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Only USA-based domains (.com, .net, .org, .us, etc.) are accepted. 
          International domains (.co.uk, .ca, .au, etc.) and government/educational domains (.gov, .edu) will be rejected.
        </AlertDescription>
      </Alert>
    </div>
  );
}
