import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadReport from "@/components/LeadReport";
import { FormData, ReportData } from "@/types/report";
import { calculateReportMetrics } from "@/services/apiService";
import { fetchDomainData } from "@/services/spyfuService";
import { toast } from "sonner";

// Import our new components
import LoadingState from "@/components/calculator/LoadingState";
import LandingPageHero from "@/components/calculator/LandingPageHero";
import IdentityResolutionExplainer from "@/components/calculator/IdentityResolutionExplainer";

import FormSection from "@/components/calculator/FormSection";

const Index = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formDataCache, setFormDataCache] = useState<FormData | null>(null);

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
        setReportData(fullReportData);
        setIsCalculating(false);
        clearInterval(progressInterval);

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
    toast.success("All data cleared. You can start fresh!", {
      duration: 3000,
    });
  };

  const handleEditData = () => {
    setReportData(null);
    setApiError(null); // Don't show error in edit mode
    toast.info("Edit your information and submit again", {
      description: "Your previous entries have been preserved.",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background ">
        {isCalculating ? (
          <LoadingState
            calculationProgress={calculationProgress}
            onReset={handleReset}
          />
        ) : !reportData ? (
          <>
            <LandingPageHero />
            <IdentityResolutionExplainer />

            <FormSection
              apiError={apiError}
              formDataCache={formDataCache}
              onCalculate={handleCalculate}
              onReset={handleReset}
              isCalculating={isCalculating}
            />

            
          </>
        ) : (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <LeadReport
                data={reportData}
                onReset={handleReset}
                onEditData={handleEditData}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
