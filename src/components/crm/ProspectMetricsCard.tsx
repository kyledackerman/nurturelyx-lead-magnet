import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Globe, DollarSign } from "lucide-react";

interface ProspectMetricsCardProps {
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  estimatedLeads: number;
  monthlyTraffic: number;
}

export function ProspectMetricsCard({
  monthlyRevenueLost,
  yearlyRevenueLost,
  estimatedLeads,
  monthlyTraffic,
}: ProspectMetricsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-3 bg-orange-500/5 border-orange-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Monthly Revenue Lost</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {formatCurrency(monthlyRevenueLost)}
            </p>
          </div>
          <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-1" />
        </div>
      </Card>

      <Card className="p-3 bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Yearly Revenue</p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(yearlyRevenueLost)}
            </p>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground mt-1" />
        </div>
      </Card>

      <Card className="p-3 bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Est. Leads</p>
            <p className="text-xl font-bold mt-1">
              {formatNumber(estimatedLeads)}
            </p>
          </div>
          <Users className="h-4 w-4 text-muted-foreground mt-1" />
        </div>
      </Card>

      <Card className="p-3 bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Monthly Traffic</p>
            <p className="text-xl font-bold mt-1">
              {formatNumber(monthlyTraffic)}
            </p>
          </div>
          <Globe className="h-4 w-4 text-muted-foreground mt-1" />
        </div>
      </Card>
    </div>
  );
}
