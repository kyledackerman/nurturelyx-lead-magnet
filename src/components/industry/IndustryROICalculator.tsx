import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { scrollToTopIfHomeLink } from "@/lib/scroll";

interface IndustryROICalculatorProps {
  industryName: string;
  avgConversionRate: number;
  avgTransactionValue: number;
}

export const IndustryROICalculator = ({ 
  industryName, 
  avgConversionRate, 
  avgTransactionValue 
}: IndustryROICalculatorProps) => {
  const [monthlyVisitors, setMonthlyVisitors] = useState<string>("1000");
  
  const visitors = parseInt(monthlyVisitors) || 0;
  const identifiedVisitors = Math.round(visitors * 0.35); // 35% identification rate
  const newLeads = Math.round(identifiedVisitors * (avgConversionRate / 100));
  const additionalRevenue = newLeads * avgTransactionValue;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">{industryName} ROI Calculator</CardTitle>
        <p className="text-muted-foreground">
          See how much additional revenue you could generate with visitor identification
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="visitors">Monthly Website Visitors</Label>
          <Input
            id="visitors"
            type="number"
            value={monthlyVisitors}
            onChange={(e) => setMonthlyVisitors(e.target.value)}
            placeholder="1000"
            className="text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              New Leads Per Month
            </div>
            <div className="text-3xl font-bold text-primary">
              {newLeads.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From {identifiedVisitors.toLocaleString()} identified visitors
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Additional Annual Revenue
            </div>
            <div className="text-3xl font-bold text-primary">
              ${(additionalRevenue * 12).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              At 1% conversion rate (industry example)
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="text-sm text-muted-foreground">
            <strong>Industry Averages:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Standard conversion rate: 1% (example)</li>
              <li>Average transaction value: ${avgTransactionValue.toLocaleString()}</li>
              <li>Visitor identification rate: 35%</li>
            </ul>
          </div>
        </div>

        <Button asChild className="w-full gradient-bg" onClick={scrollToTopIfHomeLink}>
          <Link to="/">Get Your Detailed Report</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
