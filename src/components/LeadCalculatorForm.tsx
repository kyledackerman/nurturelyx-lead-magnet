import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormData } from "@/types/report";
import { RefreshCw, AlertCircle } from "lucide-react";
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
  apiError: externalApiError,
}: LeadCalculatorFormProps) => {
  const {
    formData,
    errors,
    canCalculate,
    showTrafficFields,
    proxyConnected,
    isCheckingConnection,
    connectionError,
    diagnosticInfo,
    retryConnection,
    handleChange,
    validateAndSubmit,
    validateForm,
    setShowTrafficFields,
    resetForm,
  } = useLeadCalculatorForm(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onCalculate(formData);
    }
  };

  const handleResetClick = () => {
    if (onReset) {
      resetForm(); // Reset form state in the hook
      onReset(); // Call parent reset function
    }
  };

  const apiError = externalApiError || connectionError;

  console.log(externalApiError, "--------------", connectionError);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <FormHeader />
      </CardHeader>
      <CardContent>
        {apiError && (
          <div className="mb-6">
            <div className="flex items-start text-sm bg-amber-50 text-amber-800 p-3 rounded border border-amber-200">
              <AlertCircle
                size={18}
                className="mr-2 mt-0.5 text-amber-600 shrink-0"
              />
              <div>
                <p className="font-medium">API Connection Unavailable</p>
                <p className="text-sm text-amber-700 mt-1">
                  Don't worry! You can still get accurate results by entering
                  your traffic data below.
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
            connectionError={connectionError}
            proxyConnected={proxyConnected}
            isCheckingConnection={isCheckingConnection}
            diagnosticInfo={diagnosticInfo}
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

// Form header component - simplified for better mobile experience
const FormHeader = () => (
  <div className="text-center space-y-2 px-2">
    <CardTitle className="text-2xl sm:text-4xl font-bold text-foreground leading-tight">
      Get Free Report
    </CardTitle>
    <CardDescription className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
      Discover how many leads you're missing without ID resolution technology
    </CardDescription>
    <div className="mt-3">
      <span className="inline-flex items-center text-sm font-medium text-green-600">
        ✓ No opt-in required • Get your data instantly
      </span>
    </div>
  </div>
);

export default LeadCalculatorForm;
