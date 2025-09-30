import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormData } from "@/types/report";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrafficInputFields } from "../lead-calculator/TrafficInputFields";
import { TransactionValueInput } from "../lead-calculator/TransactionValueInput";
import { InfoSection } from "../lead-calculator/InfoSection";
import { useLeadCalculatorForm } from "../lead-calculator/useLeadCalculatorForm";

interface AdminLeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  onReset?: () => void;
  isCalculating: boolean;
  initialData?: FormData | null;
  apiError?: string | null;
}

const AdminLeadCalculatorForm = ({
  onCalculate,
  onReset,
  isCalculating,
  initialData,
  apiError: externalApiError,
}: AdminLeadCalculatorFormProps) => {
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
    validateForm,
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
      resetForm();
      onReset();
    }
  };

  const apiError = externalApiError || connectionError;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Generate Report</CardTitle>
        <CardDescription>
          Enter domain and traffic information to generate a lead analysis report
        </CardDescription>
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
                  You can still generate accurate results by entering traffic data manually.
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

          <div className="flex gap-2 pt-2">
            {onReset && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetClick}
                disabled={isCalculating || isCheckingConnection}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            <Button
              type="submit"
              disabled={!canCalculate || isCalculating || isCheckingConnection}
              className="flex-1"
            >
              {isCalculating || isCheckingConnection ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLeadCalculatorForm;
