
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportData } from "@/types/report";

import ReportTabs from "./report/ReportTabs";
import VideoExplainer from "./report/VideoExplainer";
import FAQ from "./report/FAQ";
import CompetitorComparison from "./report/CompetitorComparison";
import Testimonials from "./report/Testimonials";
import Glossary from "./report/Glossary";
import ReportHeader from "./report/ReportHeader";
import ChangelogCard from "./report/ChangelogCard";
import StatsOverview from "./report/StatsOverview";

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
      <div className="flex items-center gap-2 flex-wrap">
        <ReportHeader onReset={onReset} onEditData={onEditData} />
        
        {!isPublicView && (
          <ShareReportButton reportData={data} reportId={reportId} slug={data.slug} />
        )}
      </div>

      <ChangelogCard reportData={data} />

      <StatsOverview
        missedLeads={data.missedLeads}
        estimatedSalesLost={data.estimatedSalesLost}
        monthlyRevenueLost={data.monthlyRevenueLost}
        yearlyRevenueLost={data.yearlyRevenueLost}
      />

      <div className="bg-secondary/50 border border-accent/20 rounded-lg p-4">
        <div className="text-white/90 text-sm text-center space-y-1">
          <p><span className="font-semibold text-accent">Missed Leads:</span> Visitors who weren't identified but could have been with NurturelyX</p>
          <p><span className="font-semibold text-accent">Lost Sales*:</span> Estimated conversions from those visitors</p>
          <p><span className="font-semibold text-accent">Lost Revenue:</span> Monthly opportunity being missed</p>
        </div>
        <p className="text-white/70 text-xs text-center mt-2">*Based on industry conversion rates</p>
      </div>

      <ScrollToCTAButton />

      <ReportTabs data={data} />



      <VideoExplainer />

      <FAQ data={data} />

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
              <ShareReportButton reportData={data} reportId={reportId} slug={data.slug} />
            </div>
          </CardContent>
        </Card>
      )}

      <PrintStyles />
    </div>
  );
};

export default LeadReport;
