import { DollarSign, Users, ShoppingCart, TrendingUp, Calendar } from "lucide-react";
import StatCard from "./StatCard";

interface PeakMonth {
  month: string;
  year: number;
  value: number;
}

interface StatsOverviewProps {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  peakLeadLoss: PeakMonth | null;
  peakRevenue: PeakMonth | null;
}

const StatsOverview = ({
  missedLeads,
  estimatedSalesLost,
  monthlyRevenueLost,
  yearlyRevenueLost,
  peakLeadLoss,
  peakRevenue,
}: StatsOverviewProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div id="stats-overview" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-slide-up">
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
        isHighValue={monthlyRevenueLost > 5000}
      />

      {peakLeadLoss && (
        <StatCard
          label="Peak Lead Loss"
          value={`${peakLeadLoss.month} ${peakLeadLoss.year}`}
          subtitle={`${peakLeadLoss.value.toLocaleString()} leads`}
          icon={TrendingUp}
        />
      )}

      {peakRevenue && (
        <StatCard
          label="Peak Revenue Loss"
          value={`${peakRevenue.month} ${peakRevenue.year}`}
          subtitle={formatCurrency(peakRevenue.value)}
          icon={Calendar}
        />
      )}
    </div>
  );
};

export default StatsOverview;
