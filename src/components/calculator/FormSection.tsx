import { FormData } from "@/types/report";
import LeadCalculatorForm from "@/components/LeadCalculatorForm";
import { AlertCircle, ServerOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormSectionProps {
  apiError: string | null;
  formDataCache: FormData | null;
  onCalculate: (formData: FormData) => void;
  onReset: () => void;
  isCalculating: boolean;
}

const FormSection = ({
  apiError,
  formDataCache,
  onCalculate,
  onReset,
  isCalculating,
}: FormSectionProps) => {
  return (
    <section className="bg-black py-12" data-form-section="true">
      <div className="container mx-auto px-4 max-w-4xl">
        {apiError && (
          <div className="mb-8">
            <Alert
              variant="destructive"
              className="border-red-500 bg-red-50 mb-4"
            >
              <ServerOff className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-800 text-lg">
                API Connection Error
              </AlertTitle>
              <AlertDescription>
                <p className="text-red-700">{apiError}</p>
                <p className="mt-2 font-medium text-red-800">
                  Please enter your traffic data manually to continue.
                </p>
              </AlertDescription>
            </Alert>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className="h-5 w-5 text-amber-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Technical Details (for Administrators)
                  </h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>
                      The application is unable to connect to the SpyFu API
                      proxy server.
                    </p>
                    <p className="mt-1">
                      {apiError.includes("CORS") ||
                      apiError.includes("browser's security policy")
                        ? "This appears to be a CORS (Cross-Origin Resource Sharing) policy issue. The browser is blocking requests to the API for security reasons."
                        : "This could be a network connectivity issue or the proxy server may be unavailable."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                <span className="font-medium text-blue-700">
                  Don't worry! You can still use the calculator by entering your
                  traffic data manually below.
                </span>
              </div>
            </div>
          </div>
        )}

        <LeadCalculatorForm
          onCalculate={onCalculate}
          onReset={onReset}
          isCalculating={isCalculating}
          initialData={formDataCache}
          apiError={apiError}
        />
      </div>
    </section>
  );
};

export default FormSection;
