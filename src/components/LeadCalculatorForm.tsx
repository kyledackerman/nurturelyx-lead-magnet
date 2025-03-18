
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
    isCheckingConnection,
    connectionError,
    retryConnection,
    handleChange,
    validateForm,
    setShowTrafficFields,
    resetForm
  } = useLeadCalculatorForm(initialData, apiError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Try to use the SpyFu API but fall back to manual mode if needed
        onCalculate(formData);
        toast.success("Calculating your report", {
          description: "Processing your data to generate insights."
        });
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

  const handleResetClick = () => {
    if (onReset) {
      resetForm(); // Reset form state in the hook
      onReset(); // Call parent reset function
    }
  };

  // If we have a connection error or aren't connected, always show traffic fields
  const shouldShowTrafficFields = showTrafficFields || 
                                !proxyConnected || 
                                !!apiError || 
                                !!connectionError;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <FormHeader onReset={handleResetClick} />
      </CardHeader>
      <CardContent>
        {apiError && (
          <div className="mb-6">
            <div className="flex items-start text-sm bg-amber-50 text-amber-800 p-3 rounded border border-amber-200">
              <AlertCircle size={18} className="mr-2 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium">API Connection Unavailable</p>
                <p className="text-sm text-amber-700 mt-1">
                  Don't worry! You can still get accurate results by entering your traffic data below.
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
            showTrafficFields={shouldShowTrafficFields} 
          />
          
          <TransactionValueInput 
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
          
          <InfoSection 
            apiError={apiError}
            connectionError={connectionError}
            proxyConnected={proxyConnected}
            isCheckingConnection={isCheckingConnection}
            onRetryConnection={retryConnection}
          />
          
          <FormActions 
            isCalculating={isCalculating || isCheckingConnection}
            canCalculate={canCalculate}
            onReset={handleResetClick}
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
