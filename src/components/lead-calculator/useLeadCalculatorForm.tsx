
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
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);

  useEffect(() => {
    const checkProxyConnection = async () => {
      // Only check if we're not already checking to avoid multiple parallel requests
      if (isCheckingConnection) return;
      
      setIsCheckingConnection(true);
      try {
        console.log("Testing proxy connection to:", `${PROXY_SERVER_URL}/proxy/spyfu?domain=ping`);
        
        const response = await fetch(`${PROXY_SERVER_URL}/proxy/spyfu?domain=ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Use a shorter timeout for better UX
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          setProxyConnected(true);
          setShowTrafficFields(false);
          console.log("✅ Proxy server is running at:", PROXY_SERVER_URL);
          
          // Only show toast when connection changes from disconnected to connected
          if (!proxyConnected) {
            toast.success("Proxy server connected", {
              description: "SpyFu API requests will now be processed through your proxy server",
              duration: 5000,
            });
          }
        } else {
          throw new Error(`Proxy server returned status: ${response.status}`);
        }
      } catch (error) {
        setProxyConnected(false);
        setShowTrafficFields(true);
        console.log("❌ Proxy server connection failed. Make sure it's running at:", PROXY_SERVER_URL);
        console.error("Proxy connection error:", error);
        
        // Only show toast on initial failure or when explicitly requested
        if (apiError && !showTrafficFields) {
          toast.error("Proxy server not detected", {
            description: "Make sure your proxy server is running. Manual traffic data input is now enabled.",
            duration: 8000,
          });
        }
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    if (hasSpyFuApiKey()) {
      // Check connection immediately
      checkProxyConnection();
      
      // Then check periodically but less frequently (every 30 seconds)
      const intervalId = setInterval(checkProxyConnection, 30000);
      return () => clearInterval(intervalId);
    }
  }, [apiError, proxyConnected, isCheckingConnection]);
  
  // Update showTrafficFields when API error occurs or proxy is disconnected
  useEffect(() => {
    const shouldShow = !!apiError || !proxyConnected;
    setShowTrafficFields(shouldShow);
    
    // If we need to show manual fields and there's an API error,
    // make sure the user is aware they need to provide data manually
    if (shouldShow && apiError) {
      toast.info("Please enter your traffic data manually", {
        description: "We couldn't connect to the SpyFu API. Manual input is required to continue.",
        duration: 5000,
      });
    }
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
