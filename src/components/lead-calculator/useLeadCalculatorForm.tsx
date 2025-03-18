
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";
import { toast } from "sonner";
import { hasSpyFuApiKey, PROXY_SERVER_URL } from "@/services/spyfuService";

export function useLeadCalculatorForm(initialData?: FormData | null, apiError?: string | null) {
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

  return {
    formData,
    errors,
    canCalculate,
    showTrafficFields,
    proxyConnected,
    handleChange,
    validateForm,
    setCanCalculate
  };
}
