
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import LeadCalculatorForm from "@/components/LeadCalculatorForm";
import { FormData } from "@/types/report";

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
          <div className="mb-6 max-w-2xl mx-auto">
            <Alert variant="error">
              <Terminal className="h-4 w-4" />
              <AlertTitle>API Error</AlertTitle>
              <AlertDescription>
                {apiError}
              </AlertDescription>
            </Alert>
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
