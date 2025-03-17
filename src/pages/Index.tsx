
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadCalculatorForm from "@/components/LeadCalculatorForm";
import LeadReport from "@/components/LeadReport";
import { FormData, ReportData } from "@/types/report";
import { fetchDomainData, calculateReportMetrics } from "@/services/apiService";
import { ArrowRight, LineChart, Users, Zap, Loader2, RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formDataCache, setFormDataCache] = useState<FormData | null>(null);
  
  const handleCalculate = async (formData: FormData) => {
    // Directly assign a default domain if not provided - helps with API that needs a domain identifier
    const domain = formData.domain || "yourdomain.com";
    
    setIsCalculating(true);
    setApiError(null);
    setCalculationProgress(0);
    setFormDataCache({...formData, domain});
    
    const progressInterval = setInterval(() => {
      setCalculationProgress(prev => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
    }, 500);
    
    try {
      const apiData = await fetchDomainData(
        domain, 
        formData.organicTrafficManual, 
        formData.isUnsureOrganic
      );
      
      setCalculationProgress(95);
      
      const paidTraffic = formData.isUnsurePaid ? 0 : formData.monthlyVisitors;
      
      const metrics = calculateReportMetrics(
        paidTraffic,
        formData.avgTransactionValue,
        apiData.organicTraffic,
        apiData.paidTraffic
      );
      
      const fullReportData: ReportData = {
        ...formData,
        ...apiData,
        ...metrics
      };
      
      setCalculationProgress(100);
      setTimeout(() => {
        setReportData(fullReportData);
        setIsCalculating(false);
        clearInterval(progressInterval);
        
        let dataSourceMessage = "";
        switch(apiData.dataSource) {
          case 'api':
            dataSourceMessage = "using Google Analytics data";
            break;
          case 'manual':
            dataSourceMessage = "using your manually entered data";
            break;
          case 'both':
            dataSourceMessage = "using combined API and manual data";
            break;
          case 'fallback':
            dataSourceMessage = "using industry estimates (API unavailable)";
            break;
        }
        
        toast.success(`Report generated successfully ${dataSourceMessage}`, {
          duration: 5000,
        });
      }, 500);
    } catch (error) {
      console.error("Error calculating report:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
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
    sessionStorage.removeItem('google_analytics_token');
    toast.success("All data cleared. You can start fresh!", {
      duration: 3000,
    });
  };
  
  const handleEditData = () => {
    setReportData(null);
    if (!apiError) {
      setApiError("Edit mode - all fields are editable");
    }
    toast.info("Edit your information and submit again", {
      description: "Your previous entries have been preserved.",
      duration: 5000,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Header />
      
      <main className="flex-1 bg-background">
        {isCalculating ? (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Processing your domain data...</h2>
                <p className="text-gray-400 mb-6">
                  We're connecting to Google Analytics API to analyze your website domain.
                  This usually takes around 30 seconds.
                </p>
                
                <div className="w-full max-w-md mx-auto mb-4">
                  <Progress value={calculationProgress} className="h-2" />
                </div>
                
                <p className="text-sm text-gray-500">
                  {calculationProgress < 30 && "Initializing search..."}
                  {calculationProgress >= 30 && calculationProgress < 60 && "Fetching domain statistics..."}
                  {calculationProgress >= 60 && calculationProgress < 90 && "Analyzing traffic data..."}
                  {calculationProgress >= 90 && "Calculating opportunity metrics..."}
                </p>
              </div>
              
              <div className="space-y-6 animate-pulse">
                <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
                
                <Skeleton className="h-64 mt-8" />
                <Skeleton className="h-40 mt-8" />
              </div>
              
              <div className="text-center mt-12">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
                >
                  <RefreshCw size={16} />
                  Restart Calculation
                </Button>
              </div>
            </div>
          </div>
        ) : !reportData ? (
          <>
            <section className="bg-gradient-to-r from-background to-secondary py-16 md:py-24">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
                    Discover Your Website's Hidden Lead Potential
                  </h1>
                  <p className="text-xl text-gray-400 mb-8">
                    Calculate how many leads you're missing and the revenue impact with our free estimation tool
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <div className="flex items-center">
                      <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                        <LineChart className="h-5 w-5 text-accent" />
                      </div>
                      <span className="ml-2 text-sm text-gray-400">Backed by data</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <span className="ml-2 text-sm text-gray-400">20% visitor identification</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-accent" />
                      </div>
                      <span className="ml-2 text-sm text-gray-400">One-line implementation</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="py-12">
              <div className="container mx-auto px-4">
                {apiError && (
                  <div className="mb-6 max-w-3xl mx-auto">
                    <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>API Error</AlertTitle>
                      <AlertDescription>
                        {apiError}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                <LeadCalculatorForm 
                  onCalculate={handleCalculate} 
                  onReset={handleReset}
                  isCalculating={isCalculating} 
                  initialData={formDataCache}
                  apiError={apiError}
                />
              </div>
            </section>
            
            <section className="py-16 bg-background">
              <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-6 text-foreground">How NurturelyX Works</h2>
                  <p className="text-gray-400 mb-12">
                    Our identity resolution technology identifies up to 20% of your anonymous website visitors
                    without requiring them to fill out a form or opt-in.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
                    <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
                      <span className="text-accent font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-foreground">Install Our Script</h3>
                    <p className="text-gray-400">
                      Add a single line of JavaScript to your website that activates our proprietary visitor identification technology.
                    </p>
                  </div>
                  
                  <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
                    <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
                      <span className="text-accent font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-foreground">Identify Visitors</h3>
                    <p className="text-gray-400">
                      Our technology identifies up to 20% of your anonymous website visitors, revealing their contact information.
                    </p>
                  </div>
                  
                  <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
                    <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
                      <span className="text-accent font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-foreground">Convert to Customers</h3>
                    <p className="text-gray-400">
                      Target these previously anonymous visitors with personalized marketing to convert them into paying customers.
                    </p>
                  </div>
                </div>
                
                <div className="mt-12 text-center">
                  <a href="#" className="inline-flex items-center text-accent font-medium">
                    Learn more about our technology
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </section>
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
