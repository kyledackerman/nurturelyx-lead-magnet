
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
  yearlyRevenueLost 
}: StatsOverviewProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      <StatCard
        label="Missed Leads"
        value={missedLeads.toLocaleString()}
        description="Monthly average based on <strong>20% visitor identification</strong>"
        icon={Users}
      />
      
      <StatCard
        label="Lost Sales*"
        value={estimatedSalesLost.toLocaleString()}
        description="Monthly average based on <strong>1% lead conversion</strong>"
        icon={ShoppingCart}
      />
      
      <StatCard
        label="Lost Revenue"
        value={formatCurrency(monthlyRevenueLost)}
        description={`<strong>${formatCurrency(yearlyRevenueLost)}</strong> annually`}
        icon={DollarSign}
      />
    </div>
  );
};

export default StatsOverview;
