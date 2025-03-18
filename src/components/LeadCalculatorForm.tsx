
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData } from "@/types/report";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TrafficInputFields } from "./lead-calculator/TrafficInputFields";
import { TransactionValueInput } from "./lead-calculator/TransactionValueInput";
import { InfoSection } from "./lead-calculator/InfoSection";
import { FormActions } from "./lead-calculator/FormActions";
import { useLeadCalculatorForm } from "./lead-calculator/useLeadCalculatorForm";

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
    validateForm
  } = useLeadCalculatorForm(initialData, apiError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCalculate(formData);
      toast.success("Calculating your report", {
        description: "Processing your data to generate insights."
      });
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
            <div className="flex items-start text-sm text-red-600 mt-2 bg-white p-2 rounded border border-red-200">
              <AlertCircle size={16} className="mr-1 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">SpyFu API Connection Error</p>
                <p className="text-xs text-red-500">
                  {apiError === "Edit mode - all fields are editable" 
                    ? "You can edit all fields and recalculate your report." 
                    : "Please provide traffic data manually to continue."}
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
            showTrafficFields={showTrafficFields}
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
