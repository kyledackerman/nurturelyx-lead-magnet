
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData } from "@/types/report";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleAnalyticsConnector } from "./lead-calculator/GoogleAnalyticsConnector";
import { TrafficInputFields } from "./lead-calculator/TrafficInputFields";
import { TransactionValueInput } from "./lead-calculator/TransactionValueInput";
import { InfoSection } from "./lead-calculator/InfoSection";
import { FormActions } from "./lead-calculator/FormActions";

interface LeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  onReset?: () => void;
  isCalculating: boolean;
  initialData?: FormData | null;
  apiError?: string | null;
}

const LeadCalculatorForm = ({ onCalculate, onReset, isCalculating, initialData, apiError }: LeadCalculatorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    monthlyVisitors: 1000,
    organicTrafficManual: 0,
    isUnsureOrganic: false,
    isUnsurePaid: false,
    avgTransactionValue: 0,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isGAConnected, setIsGAConnected] = useState<boolean>(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [domainSelected, setDomainSelected] = useState<boolean>(false);
  const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
  const [canCalculate, setCanCalculate] = useState<boolean>(false);

  useEffect(() => {
    // Validate form to enable/disable calculate button
    const hasRequiredFields = formData.avgTransactionValue >= 0 && 
      ((apiError || connectionFailed) || // API error or connection failed - manual mode
       (isGAConnected && selectedDomain)); // Connected with domain selected
    
    setCanCalculate(hasRequiredFields);
  }, [formData, apiError, connectionFailed, isGAConnected, selectedDomain]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // If there's a domain in initialData, select it
      if (initialData.domain) {
        setSelectedDomain(initialData.domain);
        setDomainSelected(true);
      }
    }
  }, [initialData]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!apiError) {
      // Only check Google Analytics connection if there's no API error
      if (!isGAConnected) {
        newErrors.googleAnalytics = "Please connect to Google Analytics first";
      } else if (!selectedDomain && !connectionFailed) {
        newErrors.domain = "Please select a domain";
      }
    }
    
    if (apiError && formData.isUnsurePaid === false && (formData.monthlyVisitors === undefined || formData.monthlyVisitors < 0)) {
      newErrors.monthlyVisitors = "Please enter a valid number of monthly paid visitors";
    }
    
    if (apiError && formData.isUnsureOrganic === false && (formData.organicTrafficManual === undefined || formData.organicTrafficManual < 0)) {
      newErrors.organicTrafficManual = "Please enter a valid number of monthly organic visitors";
    }
    
    if (formData.avgTransactionValue < 0) {
      newErrors.avgTransactionValue = "Please enter a valid transaction value";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update domain in form data
      const updatedFormData = {
        ...formData,
        domain: selectedDomain || formData.domain || "example.com" // Fallback to example.com if no domain
      };
      onCalculate(updatedFormData);
      toast.success("Calculating your report", {
        description: "Processing your data to generate insights."
      });
    } else {
      // Show toast for validation errors
      toast.error("Please fix the errors before continuing", {
        description: "Some required information is missing or invalid."
      });
    }
  };

  // Only show manual traffic fields if Google Analytics connection failed or there's an API error
  const showManualTrafficFields = !!apiError || connectionFailed;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-center">
              Calculate Your Missing Lead Opportunity
            </CardTitle>
            <CardDescription className="text-center">
              Connect to Google Analytics and discover how many leads you're missing
            </CardDescription>
          </div>
          {onReset && (
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
              type="button"
            >
              <RefreshCw size={16} />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Google Analytics Connection Status */}
        <GoogleAnalyticsConnector 
          isGAConnected={isGAConnected}
          setIsGAConnected={(value) => setIsGAConnected(!!value)} // Ensure boolean type
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
          setDomainSelected={setDomainSelected}
          updateFormDomain={(domain) => handleChange("domain", domain)}
          apiError={apiError}
          connectionFailed={connectionFailed}
          setConnectionFailed={setConnectionFailed}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.googleAnalytics && !apiError && (
            <div className="flex items-center justify-center text-sm text-red-600 mt-2 bg-white p-2 rounded">
              <AlertCircle className="h-4 w-4 mr-1" />
              <p>{errors.googleAnalytics}</p>
            </div>
          )}
          
          {/* Show manual traffic fields if needed */}
          {showManualTrafficFields && (
            <TrafficInputFields 
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
          )}
          
          {/* Transaction Value Input */}
          <TransactionValueInput 
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
          
          {/* Information Section */}
          <InfoSection apiError={apiError} />
          
          {/* Form Actions */}
          <FormActions 
            onReset={onReset}
            isCalculating={isCalculating}
            canCalculate={canCalculate}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCalculatorForm;
