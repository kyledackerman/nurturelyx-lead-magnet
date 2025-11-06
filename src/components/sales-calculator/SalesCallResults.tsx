import { DollarSign, TrendingUp, Target, Clock, Award, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/report/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesCallMetrics } from "@/types/salesCall";

interface SalesCallResultsProps {
  metrics: SalesCallMetrics;
}

export const SalesCallResults = ({ metrics }: SalesCallResultsProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 0): string => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getROIInsight = () => {
    if (metrics.roi >= 200) {
      return {
        message: `Outstanding ROI! You're generating $${(metrics.roi / 100 + 1).toFixed(2)} for every $1 spent on calling.`,
        color: "text-green-600"
      };
    } else if (metrics.roi >= 100) {
      return {
        message: `Great ROI! You're generating $${(metrics.roi / 100 + 1).toFixed(2)} for every $1 spent.`,
        color: "text-green-600"
      };
    } else if (metrics.roi >= 0) {
      return {
        message: `Positive ROI of ${metrics.roi.toFixed(0)}%. Consider optimizing conversion rate or deal value.`,
        color: "text-yellow-600"
      };
    } else {
      return {
        message: `Negative ROI. Your calling efforts are costing more than they generate. Review your strategy.`,
        color: "text-red-600"
      };
    }
  };

  const insight = getROIInsight();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Monthly Revenue Generated"
          value={formatCurrency(metrics.revenue)}
          icon={DollarSign}
          isHighValue={metrics.revenue > 10000}
        />
        <StatCard
          label="Net Profit (Monthly)"
          value={formatCurrency(metrics.netProfit)}
          icon={TrendingUp}
          isHighValue={metrics.netProfit > 0}
          subtitle={metrics.netProfit > 0 ? "Profitable" : "Operating at loss"}
        />
        <StatCard
          label="ROI Percentage"
          value={`${formatNumber(metrics.roi, 1)}%`}
          icon={Award}
          isHighValue={metrics.roi > 100}
        />
      </div>

      {/* Insight Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            Key Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-lg font-semibold ${insight.color}`}>
            {insight.message}
          </p>
        </CardContent>
      </Card>

      {/* Secondary Metrics */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Total Monthly Calls"
            value={formatNumber(metrics.totalMonthlyCalls)}
            icon={Target}
          />
          <StatCard
            label="Total Time Investment"
            value={`${formatNumber(metrics.hoursPerMonth, 1)} hrs`}
            icon={Clock}
          />
          <StatCard
            label="Cost of Time"
            value={formatCurrency(metrics.costOfTime)}
            icon={DollarSign}
          />
          <StatCard
            label="Expected Conversions"
            value={formatNumber(metrics.conversions, 1)}
            icon={CheckCircle2}
          />
          <StatCard
            label="Cost Per Conversion"
            value={formatCurrency(metrics.costPerConversion)}
            icon={DollarSign}
          />
          <StatCard
            label="Revenue Per Hour"
            value={formatCurrency(metrics.revenuePerHour)}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Annual Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Projections</CardTitle>
          <CardDescription>
            If you maintain these metrics consistently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(metrics.annualProjection.calls)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Revenue</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(metrics.annualProjection.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Annual Profit</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(metrics.annualProjection.profit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm">
              Break-even point: <strong>{formatNumber(metrics.breakEvenCalls, 1)} calls</strong> needed to cover time costs
            </p>
          </div>
          {metrics.roi < 50 && (
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm">
                Consider increasing average deal value or reducing time per call to improve ROI.
              </p>
            </div>
          )}
          {metrics.roi > 200 && (
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm">
                Excellent performance! Consider scaling your team to maximize revenue.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
