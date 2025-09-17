
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadReport from "@/components/LeadReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, ArrowRight } from "lucide-react";
import { ReportData } from "@/types/report";
import { reportService } from "@/services/reportService";

// Function to fetch report data by slug
const fetchPublicReport = async (slug: string): Promise<ReportData | null> => {
  try {
    const result = await reportService.getReport(undefined, slug);
    return result.reportData;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
};

const PublicReportPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPublicReport(slug);
        setReportData(data);
        
        console.log(`Report ${slug} viewed`);
      } catch (error) {
        console.error("Error loading report:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [slug]);
  
  const handleCreateMyReport = () => {
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading report...</p>
              </div>
          ) : reportData ? (
            <>
              <div className="mb-8 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Lead Opportunity Report for {reportData.domain}
                </h1>
                <p className="text-muted-foreground mb-6">
                  This report shows how much revenue this website is potentially losing 
                  due to anonymous visitor traffic.
                </p>
                 <Button 
                   onClick={handleCreateMyReport} 
                   className="gradient-bg mx-auto mb-12"
                   size="lg"
                 >
                   <ArrowRight className="mr-2 h-4 w-4" />
                   Generate My Own Report
                 </Button>
              </div>
              
              <LeadReport 
                data={reportData} 
                onReset={() => {}} 
                isPublicView={true}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Report Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The report you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={handleCreateMyReport} className="gradient-bg">
                <ArrowRight className="mr-2 h-4 w-4" />
                Create Your Own Report
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicReportPage;
