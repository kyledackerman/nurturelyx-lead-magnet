
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL, hasSpyFuApiKey, PROXY_SERVER_URL } from "@/services/api/spyfuConfig";

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
  const [canCalculate, setCanCalculate] = useState<boolean>(true);
  const [showTrafficFields, setShowTrafficFields] = useState<boolean>(false);
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [isUsingRailway, setIsUsingRailway] = useState<boolean>(PROXY_SERVER_URL === DEFAULT_PUBLIC_PROXY_URL);

  // Check proxy connection only once on initial load
  useEffect(() => {
    const checkProxyConnection = async () => {
      if (isCheckingConnection || connectionAttempted) return;
      
      setIsCheckingConnection(true);
      const connectionToastId = toast.loading("Checking SpyFu API connection...");
      
      try {
        console.log("Testing proxy connection to:", `${PROXY_SERVER_URL}/proxy/spyfu?domain=ping`);
        
        // Update the isUsingRailway state
        setIsUsingRailway(PROXY_SERVER_URL === DEFAULT_PUBLIC_PROXY_URL);
        
        // Show the loading toast for at least 2 seconds
        const connectionPromise = fetch(`${PROXY_SERVER_URL}/proxy/spyfu?domain=ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          // Use a timeout for better UX
          signal: AbortSignal.timeout(7000),
        });
        
        // Ensure we show the loading state for at least 2 seconds
        const [response] = await Promise.all([
          connectionPromise,
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        
        if (response.ok) {
          console.log("✅ Proxy server is running at:", PROXY_SERVER_URL);
          setProxyConnected(true);
          
          toast.success("SpyFu API connection established", {
            id: connectionToastId
          });
          
          if (PROXY_SERVER_URL === DEFAULT_PUBLIC_PROXY_URL) {
            console.log("✅ Using Railway deployment:", DEFAULT_PUBLIC_PROXY_URL);
          } else {
            console.log("⚠️ Using custom proxy URL instead of Railway:", PROXY_SERVER_URL);
          }
        } else {
          throw new Error(`Proxy server returned status: ${response.status}`);
        }
      } catch (error) {
        console.error("Proxy connection error:", error);
        setProxyConnected(false);
        
        // Wait a minimum of 3 seconds before showing the error
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        toast.error("SpyFu API connection failed", {
          id: connectionToastId,
          description: "You can enter traffic data manually to continue."
        });
        
        if (PROXY_SERVER_URL === DEFAULT_PUBLIC_PROXY_URL) {
          console.log("❌ Railway proxy connection failed:", DEFAULT_PUBLIC_PROXY_URL);
        } else {
          console.log("❌ Proxy server connection failed at:", PROXY_SERVER_URL);
        }
      } finally {
        setIsCheckingConnection(false);
        setConnectionAttempted(true);
      }
    };
    
    if (hasSpyFuApiKey()) {
      checkProxyConnection();
    }
  }, [isCheckingConnection, connectionAttempted]);
  
  // Only show traffic fields when there's an explicit API error
  useEffect(() => {
    if (apiError) {
      setShowTrafficFields(true);
    } else {
      setShowTrafficFields(false); // Ensure fields are hidden when no API error
    }
  }, [apiError]);

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
    isUsingRailway,
    handleChange,
    validateForm,
    setCanCalculate,
    setShowTrafficFields
  };
}
