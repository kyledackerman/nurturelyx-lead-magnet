
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from "@/types/report";
import { DollarSign, Users, ShoppingCart, Check, AlertTriangle, Info, Edit, Printer, RefreshCw } from "lucide-react";
import MonthlyRevenueTable from "./MonthlyRevenueTable";
import StatCard from "./report/StatCard";
import MethodologyCard from "./report/MethodologyCard";
import ReportTabs from "./report/ReportTabs";
import VideoExplainer from "./report/VideoExplainer";
import CompetitorComparison from "./report/CompetitorComparison";
import Testimonials from "./report/Testimonials";
import Glossary from "./report/Glossary";

interface LeadReportProps {
  data: ReportData;
  onReset: () => void;
  onEditData?: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const handlePrintReport = () => {
  document.body.classList.add('printing-report');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-report');
  }, 1000);
};

const Changelog = ({ reportData }: { reportData: ReportData }) => {
  const currentDate = new Date().toLocaleDateString();
  
  let dataSourceMessage = "";
  switch(reportData.dataSource) {
    case 'api':
      dataSourceMessage = "Using SearchAtlas API data";
      break;
    case 'manual':
      dataSourceMessage = "Using your manually entered data";
      break;
    case 'both':
      dataSourceMessage = "Using combined API and manual data (averaged)";
      break;
    case 'fallback':
      dataSourceMessage = "Using industry estimates (API unavailable)";
      break;
  }
  
  return (
    <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Info className="mr-2" size={20} />
          Report Summary & Changelog
        </CardTitle>
        <CardDescription>
          Generated on {currentDate} at {new Date().toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span><strong>Data Source:</strong> {dataSourceMessage}</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span><strong>Monthly Metrics:</strong> All values represent <strong>monthly averages</strong> unless otherwise stated</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span><strong>Leads Calculation:</strong> Potential leads are based on 20% of your total monthly traffic (organic + paid)</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span><strong>Sales Estimation:</strong> Estimated at 1% conversion of identified leads with {formatCurrency(data.avgTransactionValue)} average value</span>
          </li>
          <li className="flex items-start">
            <AlertTriangle size={16} className="mr-2 mt-0.5 text-amber-500" />
            <span>The revenue figures represent <strong>additional potential</strong> beyond your current performance</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

const LeadReport = ({ data, onReset, onEditData }: LeadReportProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in" id="leadReport">
      <div className="flex justify-between flex-wrap gap-4">
        {onEditData && (
          <Button 
            variant="outline" 
            onClick={onEditData} 
            className="flex items-center gap-2 text-accent border-accent hover:bg-accent/10"
            size="sm"
          >
            <Edit size={16} />
            My Information Isn't Right
          </Button>
        )}
        
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
            size="sm"
          >
            <RefreshCw size={16} />
            Restart
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrintReport}
            className="flex items-center gap-2"
            size="sm"
          >
            <Printer size={16} />
            Save as PDF
          </Button>
        </div>
      </div>
      
      <Changelog reportData={data} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <StatCard
          label="Missed Leads"
          value={data.missedLeads.toLocaleString()}
          description="Monthly average based on <strong>20% visitor identification</strong>"
          icon={Users}
        />
        
        <StatCard
          label="Lost Sales*"
          value={data.estimatedSalesLost.toLocaleString()}
          description="Monthly average based on <strong>1% lead conversion</strong>"
          icon={ShoppingCart}
        />
        
        <StatCard
          label="Lost Revenue"
          value={formatCurrency(data.monthlyRevenueLost)}
          description={`<strong>${formatCurrency(data.yearlyRevenueLost)}</strong> annually`}
          icon={DollarSign}
        />
      </div>
      
      <MethodologyCard
        domain={data.domain}
        monthlyVisitors={data.monthlyVisitors}
        avgTransactionValue={data.avgTransactionValue}
      />
      
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
      
      <VideoExplainer />
      
      <ReportTabs data={data} />
      
      <CompetitorComparison data={data} />
      
      <Testimonials />
      
      <Glossary />
      
      <Card className="bg-accent/10 border-accent mt-8 px-6 py-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-accent">Ready to Stop Losing {formatCurrency(data.yearlyRevenueLost)} Each Year?</h2>
          <p className="text-gray-400">
            Join the NurturelyX beta and start converting your anonymous traffic into real revenue.
            Only a limited number of spots available.
          </p>
          <Button className="gradient-bg text-accent-foreground mt-4 mx-auto" size="lg">
            Apply for Beta Access Now
          </Button>
        </div>
      </Card>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          #leadReport, #leadReport * {
            visibility: visible;
          }
          
          #leadReport {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          button {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default LeadReport;
