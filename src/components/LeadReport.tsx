
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from "@/types/report";
import { DollarSign, Users, ShoppingCart } from "lucide-react";
import MonthlyRevenueTable from "./MonthlyRevenueTable";
import StatCard from "./report/StatCard";
import MethodologyCard from "./report/MethodologyCard";
import ReportTabs from "./report/ReportTabs";

interface LeadReportProps {
  data: ReportData;
  onReset: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const LeadReport = ({ data, onReset }: LeadReportProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <StatCard
          label="Missed Leads Per Month"
          value={data.missedLeads.toLocaleString()}
          description="Based on a 20% visitor identification rate"
          icon={Users}
        />
        
        <StatCard
          label="Estimated Lost Sales"
          value={data.estimatedSalesLost.toLocaleString()}
          description="Based on a 1% lead-to-sale conversion rate"
          icon={ShoppingCart}
        />
        
        <StatCard
          label="Lost Revenue Per Month"
          value={formatCurrency(data.monthlyRevenueLost)}
          description={`${formatCurrency(data.yearlyRevenueLost)} annually`}
          icon={DollarSign}
        />
      </div>
      
      {/* Methodology */}
      <MethodologyCard
        domain={data.domain}
        monthlyVisitors={data.monthlyVisitors}
        avgTransactionValue={data.avgTransactionValue}
      />
      
      {/* Monthly revenue data table */}
      <Card className="bg-secondary animate-fade-in">
        <CardHeader>
          <CardTitle>Monthly Opportunity Breakdown</CardTitle>
          <CardDescription className="text-gray-400">
            Historical data for {data.domain} over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueTable data={data.monthlyRevenueData} />
        </CardContent>
      </Card>
      
      {/* Information and Charts */}
      <ReportTabs data={data} />
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={onReset} className="border-accent text-accent hover:text-accent">
          Start a New Calculation
        </Button>
      </div>
    </div>
  );
};

export default LeadReport;
