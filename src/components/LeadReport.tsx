
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from "@/types/report";
import { DollarSign, Users, ShoppingCart, Check, AlertTriangle } from "lucide-react";
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

// Changelog component to display latest report changes
const Changelog = () => {
  return (
    <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Report Overview</CardTitle>
        <CardDescription>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span>Combined paid and organic traffic data from SearchAtlas API</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span>Calculated potential leads (20% of total monthly traffic)</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span>Estimated sales (1% of potential leads) and monthly revenue impact</span>
          </li>
          <li className="flex items-start">
            <AlertTriangle size={16} className="mr-2 mt-0.5 text-amber-500" />
            <span>All metrics represent <strong>monthly averages</strong> unless otherwise specified</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

const LeadReport = ({ data, onReset }: LeadReportProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Changelog */}
      <Changelog />
      
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
            <strong className="block mt-1 text-accent">
              Note: "Visitors" represents the combined total of organic and paid traffic for each month
            </strong>
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
