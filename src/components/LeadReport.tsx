
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from "@/types/report";
import MonthlyRevenueTable from "./MonthlyRevenueTable";
import ReportTabs from "./report/ReportTabs";
import VideoExplainer from "./report/VideoExplainer";
import CompetitorComparison from "./report/CompetitorComparison";
import Testimonials from "./report/Testimonials";
import Glossary from "./report/Glossary";
import ReportHeader from "./report/ReportHeader";
import ChangelogCard from "./report/ChangelogCard";
import StatsOverview from "./report/StatsOverview";
import MethodologyCard from "./report/MethodologyCard";
import CallToAction from "./report/CallToAction";
import PrintStyles from "./report/PrintStyles";

interface LeadReportProps {
  data: ReportData;
  onReset: () => void;
  onEditData?: () => void;
}

const LeadReport = ({ data, onReset, onEditData }: LeadReportProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in" id="leadReport">
      <ReportHeader onReset={onReset} onEditData={onEditData} />
      
      <ChangelogCard reportData={data} />
      
      <StatsOverview 
        missedLeads={data.missedLeads}
        estimatedSalesLost={data.estimatedSalesLost}
        monthlyRevenueLost={data.monthlyRevenueLost}
        yearlyRevenueLost={data.yearlyRevenueLost}
      />
      
      <MethodologyCard
        domain={data.domain}
        monthlyVisitors={data.monthlyVisitors}
        avgTransactionValue={data.avgTransactionValue}
      />
      
      <Card className="bg-secondary animate-fade-in">
        <CardHeader>
          <CardTitle>Monthly Opportunity Breakdown</CardTitle>
          <CardDescription className="text-black">
            Historical data for {data.domain} over the last 6 months
            <strong className="block mt-1 text-black">
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
      
      <CallToAction yearlyRevenueLost={data.yearlyRevenueLost} />
      
      <PrintStyles />
    </div>
  );
};

export default LeadReport;
