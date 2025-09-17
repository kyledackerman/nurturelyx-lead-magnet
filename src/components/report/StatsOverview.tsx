import { DollarSign, Users, ShoppingCart } from "lucide-react";
import StatCard from "./StatCard";

interface StatsOverviewProps {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
}

const StatsOverview = ({
  missedLeads,
  estimatedSalesLost,
  monthlyRevenueLost,
  yearlyRevenueLost,
}: StatsOverviewProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id="stats-overview" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      <StatCard
        label="Monthly Missed Leads"
        value={missedLeads.toLocaleString()}
        icon={Users}
      />

      <StatCard
        label="Monthly Lost Sales*"
        value={estimatedSalesLost.toLocaleString()}
        icon={ShoppingCart}
      />

      <StatCard
        label="Monthly Lost Revenue"
        value={formatCurrency(monthlyRevenueLost)}
        icon={DollarSign}
      />
    </div>
  );
};

export default StatsOverview;
