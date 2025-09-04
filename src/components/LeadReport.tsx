
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import ScrollToCTAButton from "./report/ScrollToCTAButton";
import CallToAction from "./report/CallToAction";
import PrintStyles from "./report/PrintStyles";
import ShareReportButton from "./report/ShareReportButton";

interface LeadReportProps {
  data: ReportData;
  onReset: () => void;
  onEditData?: () => void;
  isPublicView?: boolean;
}

const LeadReport = ({ data, onReset, onEditData, isPublicView = false }: LeadReportProps) => {
  // Generate a consistent reportId if one doesn't exist
  const reportId = data.reportId || `report_${Date.now()}_${data.domain.replace(/\./g, '_')}`;
  
  useEffect(() => {
    // Scroll to stats overview immediately after report renders
    const statsSection = document.getElementById('stats-overview');
    if (statsSection) {
      setTimeout(() => {
        statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Small delay to ensure DOM is ready
    }
  }, []);
  
  return (
    <div
      className="w-full max-w-6xl mx-auto space-y-8"
      id="leadReport"
    >
      <div className="flex justify-between items-center">
        <ReportHeader onReset={onReset} onEditData={onEditData} />
        
        {!isPublicView && (
          <ShareReportButton reportData={data} reportId={reportId} />
        )}
      </div>

      <StatsOverview
        missedLeads={data.missedLeads}
        estimatedSalesLost={data.estimatedSalesLost}
        monthlyRevenueLost={data.monthlyRevenueLost}
        yearlyRevenueLost={data.yearlyRevenueLost}
      />

      <ChangelogCard reportData={data} />

      <ScrollToCTAButton />

      <MethodologyCard
        domain={data.domain}
        monthlyVisitors={data.monthlyVisitors}
        avgTransactionValue={data.avgTransactionValue}
      />

      <Card className="bg-secondary animate-fade-in">
        <CardHeader>
          <CardTitle>Monthly Opportunity Breakdown</CardTitle>
          <CardDescription className="text-white">
            Historical data for {data.domain} over the last 6 months
            <strong className="block mt-1 text-white">
              Note: "Visitors" represents the combined total of organic and paid
              traffic for each month
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

      {!isPublicView && <Testimonials />}

      <Glossary />

      <div data-cta-section="true">
        <CallToAction yearlyRevenueLost={data.yearlyRevenueLost} />
      </div>

      {!isPublicView && (
        <Card className="bg-secondary p-6 border-accent/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Share Your Report</CardTitle>
            <CardDescription className="text-white/80">
              Let others know about the potential revenue they might be losing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-sm text-white">
                <p>Sharing this report can help others understand:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The value of visitor identification</li>
                  <li>Potential revenue they're missing</li>
                  <li>How to improve lead generation</li>
                </ul>
              </div>
              <ShareReportButton reportData={data} reportId={reportId} />
            </div>
          </CardContent>
        </Card>
      )}

      <PrintStyles />
    </div>
  );
};

export default LeadReport;
