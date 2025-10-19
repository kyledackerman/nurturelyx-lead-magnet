
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadReport from "@/components/LeadReport";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { ReportData } from "@/types/report";
import { reportService } from "@/services/reportService";
import { formatCurrency } from "@/lib/utils";

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

  // Generate SEO-optimized metadata
  const generateMetadata = (data: ReportData) => {
    const yearlyRevenue = data.yearlyRevenueLost || 0;
    const monthlyRevenue = data.monthlyRevenueLost || 0;
    const leads = data.missedLeads || 0;
    
    const title = `${data.domain || 'Company'} Lead Loss Report | ${formatCurrency(yearlyRevenue)}/year Lost Revenue`;
    const description = `${data.domain || 'Company'} is losing $${formatCurrency(monthlyRevenue)}/month ($${formatCurrency(yearlyRevenue)}/year) from ${leads.toLocaleString()} missed leads. Free analysis and recommendations.`;
    const url = `https://x1.nurturely.io/report/${slug}`;

    return { title, description, url };
  };
  
  return (
    <>
      {reportData && (
        <>
          <MetaTags
            title={generateMetadata(reportData).title}
            description={generateMetadata(reportData).description}
            canonical={generateMetadata(reportData).url}
            keywords={`${reportData.domain} leads, ${reportData.domain} revenue loss, anonymous traffic analysis, lead generation report`}
            ogType="article"
          />

          <ArticleSchema
            title={`${reportData.domain} Lead Loss Report`}
            description={generateMetadata(reportData).description}
            publishedAt={new Date().toISOString()}
            updatedAt={new Date().toISOString()}
            author="NurturelyX"
            url={generateMetadata(reportData).url}
            category="Revenue Analysis"
          />

          <WebPageSchema
            name={`${reportData.domain} Lead Loss Report`}
            description={generateMetadata(reportData).description}
            url={generateMetadata(reportData).url}
            breadcrumbs={[
              { name: "Reports", url: "/reports" },
              { name: reportData.domain, url: `/report/${slug}` }
            ]}
            keywords={[reportData.domain, "lead analysis", "revenue loss report"]}
          />
        </>
      )}

      <Header />
      
      <main className="min-h-screen flex flex-col bg-background py-12">
        <div className="container mx-auto">
          {reportData && (
            <div className="max-w-6xl mx-auto mb-6">
              <Breadcrumb items={[
                { label: "Reports", href: "/top-companies" },
                { label: reportData.domain, href: `/report/${slug}` }
              ]} />
            </div>
          )}
          
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading report...</p>
              </div>
          ) : reportData ? (
            <>
              <article className="mb-8 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Lead Loss Report for{" "}
                  <span className="text-primary text-4xl">{reportData.domain}</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-2">
                  This report shows how much revenue this website is potentially losing 
                  due to anonymous visitor traffic.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <Button 
                  onClick={handleCreateMyReport} 
                  className="gradient-bg mx-auto mb-12"
                  size="lg"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Generate My Own Report
                </Button>
              </article>
              
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
    </>
  );
};

export default PublicReportPage;
