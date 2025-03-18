import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData } from "@/types/report";
import { RefreshCw, AlertCircle, ServerOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TrafficInputFields } from "./lead-calculator/TrafficInputFields";
import { TransactionValueInput } from "./lead-calculator/TransactionValueInput";
import { InfoSection } from "./lead-calculator/InfoSection";
import { FormActions } from "./lead-calculator/FormActions";
import { useLeadCalculatorForm } from "./lead-calculator/useLeadCalculatorForm";
import { fetchDomainData } from "@/services/spyfuService";

interface LeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  onReset?: () => void;
  isCalculating: boolean;
  initialData?: FormData | null;
  apiError?: string | null;
}

const LeadCalculatorForm = ({ 
  onCalculate, 
  onReset, 
  isCalculating, 
  initialData, 
  apiError 
}: LeadCalculatorFormProps) => {
  const {
    formData,
    errors,
    canCalculate,
    showTrafficFields,
    proxyConnected,
    handleChange,
    validateForm,
    setShowTrafficFields
  } = useLeadCalculatorForm(initialData, apiError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Check if we should try API first
        if (!showTrafficFields && formData.domain) {
          const toastId = toast.loading("Analyzing domain...", {
            description: "Fetching traffic data from SpyFu API"
          });
          
          try {
            // Create a promise that resolves with a minimum delay of 7 seconds
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 7000));
            
            // Try fetching data from API with a timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            // Make the API request
            const fetchPromise = fetchDomainData(formData.domain);
            
            // Wait for both the minimum delay and the API response (or timeout)
            try {
              await Promise.all([fetchPromise, minDelayPromise]);
              clearTimeout(timeoutId);
              
              // If successful, continue with form submission
              onCalculate(formData);
              toast.success("Calculating your report", {
                id: toastId,
                description: "Processing your data to generate insights."
              });
            } catch (error) {
              clearTimeout(timeoutId);
              throw error; // Re-throw to be caught by outer catch
            }
          } catch (error) {
            // If API fails after minimum delay, show traffic fields and ask for manual input
            console.error("API fetch failed:", error);
            setShowTrafficFields(true);
            
            // Ensure a minimum loading time before showing error
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // More descriptive error message
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isCorsError = errorMessage.toLowerCase().includes('cors') || 
                               errorMessage.toLowerCase().includes('network') ||
                               errorMessage.toLowerCase().includes('failed to fetch');
            
            if (isCorsError) {
              toast.error("CORS Security Restriction", {
                id: toastId,
                description: "The browser's security policy is preventing connection to the API. Please enter your traffic data manually."
              });
            } else {
              toast.error("API Connection Issue", {
                id: toastId,
                description: "Please enter your traffic data manually to continue."
              });
            }
          }
        } else {
          // Traffic fields are already visible, just submit the form
          onCalculate(formData);
          toast.success("Calculating your report", {
            description: "Processing your data to generate insights."
          });
        }
      } catch (error) {
        toast.error("Error submitting form", {
          description: "Please check your inputs and try again."
        });
      }
    } else {
      toast.error("Please fix the errors before continuing", {
        description: "Some required information is missing or invalid."
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <FormHeader onReset={onReset} />
      </CardHeader>
      <CardContent>
        {apiError && (
          <div className="mb-6">
            <div className="flex items-start text-sm bg-red-50 text-red-800 p-3 rounded border border-red-200">
              <ServerOff size={18} className="mr-2 mt-0.5 text-red-600 shrink-0" />
              <div>
                <p className="font-medium">API Connection Error</p>
                <p className="text-sm text-red-700 mt-1">
                  {apiError}
                </p>
                <p className="text-sm font-medium mt-1">
                  Please provide traffic data manually below to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <TrafficInputFields 
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            showTrafficFields={showTrafficFields || !!apiError}
          />
          
          <TransactionValueInput 
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
          
          <InfoSection 
            apiError={apiError} 
            proxyConnected={proxyConnected} 
          />
          
          <FormActions 
            isCalculating={isCalculating}
            canCalculate={canCalculate}
            onReset={onReset}
          />
        </form>
      </CardContent>
    </Card>
  );
};

// Form header component
const FormHeader = ({ onReset }: { onReset?: () => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-2xl font-bold text-center">
        Calculate Your Missing Lead Opportunity
      </CardTitle>
      <CardDescription className="text-center">
        Discover how many leads you're missing without requiring any technical setup
      </CardDescription>
    </div>
    {onReset && (
      <Button 
        variant="outline" 
        onClick={onReset}
        className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
        size="sm"
        type="button"
      >
        <RefreshCw size={16} />
        Restart
      </Button>
    )}
  </div>
);

export default LeadCalculatorForm;
