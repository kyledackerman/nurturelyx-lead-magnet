
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
  const [isUsingRailway, setIsUsingRailway] = useState<boolean>(true);

  useEffect(() => {
    const checkProxyConnection = async () => {
      if (isCheckingConnection || connectionAttempted) return;
      
      setIsCheckingConnection(true);
      const connectionToastId = toast.loading("Checking SpyFu API connection...");
      
      try {
        const proxyUrl = PROXY_SERVER_URL();
        console.log("Testing proxy connection to:", `${proxyUrl}/`);
        
        setIsUsingRailway(proxyUrl === DEFAULT_PUBLIC_PROXY_URL);
        
        // First, try a simple connection to the root endpoint instead of the SpyFu endpoint
        // This might have less chance of CORS issues
        const minDelayPromise = new Promise(resolve => setTimeout(resolve, 3000));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const fetchPromise = fetch(`${proxyUrl}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          mode: 'cors', // Explicitly request CORS mode
          signal: controller.signal,
          cache: 'no-cache',
          credentials: 'omit' // Don't send cookies
        });
        
        const [response] = await Promise.all([
          fetchPromise,
          minDelayPromise
        ]);
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log("✅ Proxy server root endpoint is running at:", proxyUrl);
          setProxyConnected(true);
          
          toast.success("SpyFu API connection established", {
            id: connectionToastId
          });
          
          if (proxyUrl === DEFAULT_PUBLIC_PROXY_URL) {
            console.log("✅ Using Railway deployment:", DEFAULT_PUBLIC_PROXY_URL);
          } else {
            console.log("⚠️ Using custom proxy URL instead of Railway:", proxyUrl);
          }
        } else {
          throw new Error(`Proxy server returned status: ${response.status}`);
        }
      } catch (error) {
        console.error("Proxy connection error:", error);
        setProxyConnected(false);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if error is CORS-related
        const errorStr = String(error).toLowerCase();
        if (errorStr.includes('cors') || 
            errorStr.includes('cross-origin') || 
            errorStr.includes('failed to fetch') ||
            errorStr.includes('network error')) {
          toast.error("CORS Policy Blocked API Connection", {
            id: connectionToastId,
            description: "The browser blocked the connection due to CORS policy. You can enter traffic data manually to continue."
          });
        } else {
          toast.error("SpyFu API connection failed", {
            id: connectionToastId,
            description: "You can enter traffic data manually to continue."
          });
        }
        
        const proxyUrl = PROXY_SERVER_URL();
        if (proxyUrl === DEFAULT_PUBLIC_PROXY_URL) {
          console.log("❌ Railway proxy connection failed:", DEFAULT_PUBLIC_PROXY_URL);
        } else {
          console.log("❌ Proxy server connection failed at:", proxyUrl);
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
  
  useEffect(() => {
    if (apiError) {
      setShowTrafficFields(true);
    } else {
      setShowTrafficFields(false);
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
