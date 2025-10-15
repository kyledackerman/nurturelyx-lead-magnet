import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadReport from "@/components/LeadReport";
import SaveReportPrompt from "@/components/SaveReportPrompt";
import { FormData, ReportData } from "@/types/report";
import { fetchDomainData, calculateReportMetrics } from "@/services/spyfuService";
import { reportService } from "@/services/reportService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";

// Import our new components
import LoadingState from "@/components/calculator/LoadingState";
import HeroWithForm from "@/components/calculator/HeroWithForm";
import IdentityResolutionExplainer from "@/components/calculator/IdentityResolutionExplainer";
import CallToActionSection from "@/components/CallToActionSection";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { MetaTags } from "@/components/seo/MetaTags";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { Helmet } from "react-helmet-async";

const Index = () => {
  usePageViewTracking('marketing');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formDataCache, setFormDataCache] = useState<FormData | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Pre-fill form based on industry query parameter
  useEffect(() => {
    const industry = searchParams.get('industry');
    if (industry === 'hvac' && !formDataCache) {
      setFormDataCache({
        domain: "",
        monthlyVisitors: 0,
        organicTrafficManual: 0,
        isUnsureOrganic: true,
        isUnsurePaid: true,
        avgTransactionValue: 250, // Default HVAC service call value
      });
    }
  }, [searchParams, formDataCache]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCalculate = async (formData: FormData) => {
    const domain = formData.domain || "example.com";

    setIsCalculating(true);
    setApiError(null);
    setCalculationProgress(0);
    setFormDataCache({ ...formData, domain });

    const progressInterval = setInterval(() => {
      setCalculationProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
    }, 500);

    try {
      // Fetch domain data from SpyFu
      const apiData = await fetchDomainData(
        domain,
        formData.organicTrafficManual,
        formData.isUnsureOrganic
      );

      setCalculationProgress(95);

      const paidTraffic = formData.isUnsurePaid
        ? 0
        : formData.monthlyVisitors || 0;

      const metrics = calculateReportMetrics(
        paidTraffic,
        formData.avgTransactionValue,
        apiData.organicTraffic,
        apiData.paidTraffic,
        apiData.monthlyRevenueData,
        apiData.dataSource === "api"
      );

      const fullReportData: ReportData = {
        ...formData,
        ...apiData,
        ...metrics,
      };

      setCalculationProgress(100);
      setTimeout(() => {
        // Store the generated report data for later use
        setReportData(fullReportData);
        
        // Save report to database in background
        try {
          reportService.saveReport(fullReportData, user?.id).then((saveResult) => {
            setReportData(prev => prev ? { 
              ...prev, 
              reportId: saveResult.reportId,
              slug: saveResult.slug 
            } : null);
            console.log('Report saved:', saveResult);
            
            // Show save confirmation message for logged in users
            if (user) {
              toast.success('Report saved to your account!', {
                description: 'View it anytime in your dashboard.',
                duration: 4000,
              });
            }
          }).catch((saveError) => {
            console.error('Failed to save report:', saveError);
            // Don't show error to user - report generation succeeded
          });
        } catch (saveError) {
          console.error('Failed to save report:', saveError);
        }
        
        setIsCalculating(false);
        clearInterval(progressInterval);

        // Show save prompt for anonymous users
        if (!user) {
          setShowSavePrompt(true);
        }

        let dataSourceMessage = "";
        switch (apiData.dataSource) {
          case "api":
            dataSourceMessage = "using SpyFu data";
            break;
          case "manual":
            dataSourceMessage = "using your manually entered data";
            break;
          case "both":
            dataSourceMessage = "using combined SpyFu and manual data";
            break;
          case "fallback":
            dataSourceMessage = "using industry estimates (API unavailable)";
            break;
        }

        toast.success(`Report generated successfully ${dataSourceMessage}`, {
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      console.error("Error calculating report:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setApiError(errorMsg);
      setIsCalculating(false);
      clearInterval(progressInterval);

      toast.error("Failed to generate report", {
        description: "Please provide your traffic data manually to continue.",
        duration: 8000,
      });
    }
  };

  const handleReset = () => {
    setReportData(null);
    setApiError(null);
    setFormDataCache(null);
    setShowSavePrompt(false);
    toast.success("All data cleared. You can start fresh!", {
      duration: 3000,
    });
  };

  const handleEditData = () => {
    setReportData(null);
    setApiError(null); // Don't show error in edit mode
    setShowSavePrompt(false);
    toast.info("Edit your information and submit again", {
      description: "Your previous entries have been preserved.",
      duration: 5000,
    });
  };

  const handleReportUpdate = async () => {
    if (!reportData?.reportId) {
      console.warn('No reportId available for update');
      return;
    }

    try {
      // Fetch the updated report from the database
      const result = await reportService.getReport(reportData.reportId);
      setReportData(result.reportData);
      toast.success('Report data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing report:', error);
      toast.error('Failed to refresh report data');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MetaTags
        title="Identify Anonymous Website Visitors | Lost Revenue Calculator - NurturelyX"
        description="Calculate how much revenue you're losing from anonymous website traffic. Identify visitors, capture leads, and convert them into customers with NurturelyX visitor identification."
        canonical="https://x1.nurturely.io/"
        keywords="website visitor identification, anonymous traffic tracking, lead generation, B2B lead generation, visitor identification software, lost revenue calculator, website analytics, identity resolution"
        ogType="website"
        ogImage="https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png"
      />
      
      <ServiceSchema
        name="Website Visitor Identification"
        description="Identify anonymous website visitors and convert them into qualified B2B leads. NurturelyX provides comprehensive visitor identification technology to help businesses recover lost revenue from anonymous traffic."
        serviceType="Business Service"
        areaServed={["United States", "Canada", "United Kingdom"]}
      />
      
      <WebPageSchema
        name="Lost Revenue Calculator - Identify Anonymous Website Visitors"
        description="Calculate how much revenue you're losing from anonymous website traffic and learn how to identify these visitors."
        url="https://x1.nurturely.io/"
        keywords={["visitor identification", "lead generation", "anonymous traffic", "revenue calculator"]}
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://x1.nurturely.io",
            "name": "NurturelyX",
            "description": "Identify anonymous website visitors and turn them into qualified B2B leads",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://x1.nurturely.io/?domain={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <OrganizationSchema />
      <Header />

      <main role="main" className="flex-1 bg-background"
        itemScope itemType="https://schema.org/WebPage">
        {isCalculating ? (
          <LoadingState
            calculationProgress={calculationProgress}
            onReset={handleReset}
          />
        ) : !reportData ? (
          <>
            <HeroWithForm
              apiError={apiError}
              formDataCache={formDataCache}
              onCalculate={handleCalculate}
              onReset={handleReset}
              isCalculating={isCalculating}
            />

            <IdentityResolutionExplainer />
            <CallToActionSection />
            
          </>
        ) : (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <LeadReport
                data={reportData}
                onReset={handleReset}
                onEditData={handleEditData}
                onUpdate={handleReportUpdate}
              />
              
              {/* Show save prompt for anonymous users */}
              {showSavePrompt && !user && (
                <SaveReportPrompt onDismiss={() => setShowSavePrompt(false)} />
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
