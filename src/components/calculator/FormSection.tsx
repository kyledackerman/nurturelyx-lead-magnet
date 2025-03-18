
import { FormData } from "@/types/report";
import LeadCalculatorForm from "@/components/LeadCalculatorForm";
import { AlertCircle, ServerOff } from "lucide-react";

interface FormSectionProps {
  apiError: string | null;
  formDataCache: FormData | null;
  onCalculate: (formData: FormData) => void;
  onReset: () => void;
  isCalculating: boolean;
}

const FormSection = ({ apiError, formDataCache, onCalculate, onReset, isCalculating }: FormSectionProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {apiError && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ServerOff className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>{apiError}</p>
                    <p className="mt-1 font-medium">
                      {apiError.includes("browser's security policy") 
                        ? "Please enter your traffic data manually to continue." 
                        : "You can enter your traffic data manually to continue."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <div className="inline-flex items-center">
                <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                <span>Having trouble? Try entering your traffic data manually in the form below.</span>
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
