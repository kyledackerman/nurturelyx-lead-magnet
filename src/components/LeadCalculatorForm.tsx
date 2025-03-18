import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormData } from "@/types/report";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TrafficInputFields } from "./lead-calculator/TrafficInputFields";
import { TransactionValueInput } from "./lead-calculator/TransactionValueInput";
import { InfoSection } from "./lead-calculator/InfoSection";
import { FormActions } from "./lead-calculator/FormActions";
import { hasSpyFuApiKey, PROXY_SERVER_URL } from "@/services/spyfuService";

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
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    monthlyVisitors: 0,
    organicTrafficManual: 0,
    isUnsureOrganic: false,
    isUnsurePaid: false,
    avgTransactionValue: 0,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [canCalculate, setCanCalculate] = useState<boolean>(false);
  const [showTrafficFields, setShowTrafficFields] = useState<boolean>(false);
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);

  useEffect(() => {
    const checkProxyConnection = async () => {
      try {
        const response = await fetch(`${PROXY_SERVER_URL}/proxy/spyfu?domain=ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(3000),
        });
        
        setProxyConnected(true);
        console.log("✅ Proxy server is running at:", PROXY_SERVER_URL);
        
        toast.success("Proxy server connected", {
          description: "SpyFu API requests will now be processed through your local proxy",
          duration: 5000,
        });
      } catch (error) {
        setProxyConnected(false);
        console.log("❌ Proxy server connection failed. Make sure it's running at:", PROXY_SERVER_URL);
        console.error("Proxy connection error:", error);
        
        if (apiError) {
          toast.error("Proxy server not detected", {
            description: "Make sure your Express server is running on port 3001",
            duration: 8000,
          });
        }
      }
    };
    
    if (hasSpyFuApiKey()) {
      checkProxyConnection();
      
      const intervalId = setInterval(checkProxyConnection, 15000);
      return () => clearInterval(intervalId);
    }
  }, [apiError]);
  
  useEffect(() => {
    setShowTrafficFields(!!apiError || !proxyConnected);
  }, [apiError, proxyConnected]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
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
    
    if (!formData.domain.trim()) {
      newErrors.domain = "Please enter a valid domain";
    }
    
    if (showTrafficFields) {
      if (formData.isUnsurePaid === false && (!formData.monthlyVisitors || formData.monthlyVisitors < 0)) {
        newErrors.monthlyVisitors = "Please enter a valid number of monthly paid visitors";
      }
      
      if (formData.isUnsureOrganic === false && (!formData.organicTrafficManual || formData.organicTrafficManual < 0)) {
        newErrors.organicTrafficManual = "Please enter a valid number of monthly organic visitors";
      }
    }
    
    if (formData.avgTransactionValue <= 0) {
      newErrors.avgTransactionValue = "Please enter a valid transaction value greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      </CardHeader>
      <CardContent>
        {apiError && (
          <div className="mb-6">
            <div className="flex items-center justify-center text-sm text-red-600 mt-2 bg-white p-2 rounded border border-red-200">
              <AlertCircle size={16} className="mr-1" />
              <p dangerouslySetInnerHTML={{ __html: apiError }}></p>
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
          
          <InfoSection apiError={apiError} proxyConnected={proxyConnected} />
          
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

export default LeadCalculatorForm;
