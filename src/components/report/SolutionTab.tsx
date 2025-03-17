
import { ArrowUpRight, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SolutionTabProps {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
}

const SolutionTab = ({
  missedLeads,
  estimatedSalesLost,
  monthlyRevenueLost,
  yearlyRevenueLost
}: SolutionTabProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle>How NurturelyX Solves Your Lead Gap</CardTitle>
        <CardDescription className="text-gray-400">
          Turn anonymous traffic into identified leads with our one-line script
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-accent/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Identify Up to 20% of Anonymous Visitors</h3>
              <p className="text-gray-400">
                Our proprietary technology identifies visitors without requiring them to opt-in
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-accent/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Simple One-Line Installation</h3>
              <p className="text-gray-400">
                Add a single line of JavaScript to your website - no complex setup required
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-accent/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Compliant and Ethical</h3>
              <p className="text-gray-400">
                Our solution is fully compliant with privacy regulations including GDPR and CCPA
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-accent/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Seamless CRM Integration</h3>
              <p className="text-gray-400">
                Automatically push identified leads to your existing CRM or marketing automation platform
              </p>
            </div>
          </div>
          
          <div className="methodology-card mt-6">
            <h3 className="methodology-title text-accent">
              Stop Losing {formatCurrency(monthlyRevenueLost)} Every Month
            </h3>
            <p className="methodology-text">
              With NurturelyX, you could be converting an additional {missedLeads.toLocaleString()} leads per month,
              potentially resulting in {estimatedSalesLost.toLocaleString()} sales worth approximately {formatCurrency(monthlyRevenueLost)} 
              in monthly revenue or {formatCurrency(yearlyRevenueLost)} annually.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full gradient-bg text-accent-foreground" size="lg">
          Apply for Beta
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SolutionTab;
