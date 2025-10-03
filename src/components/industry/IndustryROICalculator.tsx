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
  const [transactionValue, setTransactionValue] = useState<string>(avgTransactionValue.toString());
  
  const visitors = parseInt(monthlyVisitors) || 0;
  const avgTxValue = parseInt(transactionValue) || avgTransactionValue;
  const identifiedVisitors = Math.round(visitors * 0.35); // 35% identification rate (these are leads)
  const newSales = Math.round(identifiedVisitors * (avgConversionRate / 100));
  const additionalRevenue = newSales * avgTxValue;

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

        <div className="space-y-2">
          <Label htmlFor="transaction-value">Average Transaction Value</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="transaction-value"
              type="number"
              value={transactionValue}
              onChange={(e) => setTransactionValue(e.target.value)}
              placeholder={avgTransactionValue.toString()}
              className="text-lg pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Industry average is ${avgTransactionValue.toLocaleString()}. Adjust based on your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              New Sales Per Month
            </div>
            <div className="text-3xl font-bold text-primary">
              {newSales.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <strong className="text-primary">We identify {identifiedVisitors.toLocaleString()} leads for you</strong> - your team converts them to sales
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Additional <strong>Monthly</strong> Revenue
            </div>
            <div className="text-3xl font-bold text-primary">
              ${additionalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <strong>${(additionalRevenue * 12).toLocaleString()}</strong> annually
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="text-sm text-muted-foreground">
            <strong>Industry Averages:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Lead-to-sale conversion rate: {avgConversionRate}%</li>
              <li>Average transaction value: ${avgTransactionValue.toLocaleString()} (industry default)</li>
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
