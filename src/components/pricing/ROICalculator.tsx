import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Target } from "lucide-react";

const ROICalculator = () => {
  const [monthlyVisitors, setMonthlyVisitors] = useState(5000);
  const [avgTransactionValue, setAvgTransactionValue] = useState(2000);
  const [conversionRate, setConversionRate] = useState(3);

  // Calculations
  const identificationRate = 0.15; // 15% of visitors can be identified
  const leadsIdentified = Math.round(monthlyVisitors * identificationRate);
  const leadCost = leadsIdentified * 1; // $1 per lead
  const platformFee = 100;
  const totalMonthlyCost = platformFee + leadCost;
  
  const salesGenerated = Math.round(leadsIdentified * (conversionRate / 100));
  const revenueGenerated = salesGenerated * avgTransactionValue;
  const netProfit = revenueGenerated - totalMonthlyCost;
  const roi = totalMonthlyCost > 0 ? ((netProfit / totalMonthlyCost) * 100).toFixed(0) : 0;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Calculate Your ROI
        </h2>
        <p className="text-muted-foreground">
          See how much revenue you could generate with NurturelyX
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Metrics</CardTitle>
            <CardDescription>Adjust the sliders to match your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="visitors">Monthly Website Visitors</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="visitors"
                  min={1000}
                  max={50000}
                  step={500}
                  value={[monthlyVisitors]}
                  onValueChange={(value) => setMonthlyVisitors(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={monthlyVisitors}
                  onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="transaction">Average Transaction Value</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="transaction"
                  min={100}
                  max={10000}
                  step={100}
                  value={[avgTransactionValue]}
                  onValueChange={(value) => setAvgTransactionValue(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={avgTransactionValue}
                  onChange={(e) => setAvgTransactionValue(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="conversion">Conversion Rate (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="conversion"
                  min={1}
                  max={10}
                  step={0.5}
                  value={[conversionRate]}
                  onValueChange={(value) => setConversionRate(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Your Projected Results</CardTitle>
            <CardDescription>Based on your inputs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium">Leads Identified</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{leadsIdentified.toLocaleString()}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">New Sales</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{salesGenerated}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-background/80 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-medium">Revenue Generated</span>
                </div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(revenueGenerated)}</div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Monthly Cost:</span>
                <span>{formatCurrency(totalMonthlyCost)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Net Profit:</span>
                <span className="text-primary font-bold">{formatCurrency(netProfit)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-primary/20">
                <span className="text-lg font-bold">ROI:</span>
                <span className="text-3xl font-bold text-primary">{roi}%</span>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                That's <span className="font-bold text-primary">{formatCurrency(netProfit * 12)}</span> in 
                additional annual profit!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ROICalculator;
