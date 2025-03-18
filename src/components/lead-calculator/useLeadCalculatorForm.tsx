
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL, hasSpyFuApiKey, PROXY_SERVER_URL } from "@/services/api/spyfuConfig";

// Default empty form state
const DEFAULT_FORM_STATE: FormData = {
  domain: "",
  monthlyVisitors: 0,
  organicTrafficManual: 0,
  isUnsureOrganic: false,
  isUnsurePaid: false,
  avgTransactionValue: 0,
};

export function useLeadCalculatorForm(initialData?: FormData | null, apiError?: string | null) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_STATE);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [canCalculate, setCanCalculate] = useState<boolean>(true);
  const [showTrafficFields, setShowTrafficFields] = useState<boolean>(false);
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [isUsingRailway, setIsUsingRailway] = useState<boolean>(true);

  // Reset form to default state
  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setErrors({});
    setShowTrafficFields(false);
    setConnectionAttempted(false);
  };

  useEffect(() => {
    const checkProxyConnection = async () => {
      if (isCheckingConnection || connectionAttempted) return;
      
      setIsCheckingConnection(true);
      const connectionToastId = toast.loading("Checking SpyFu API connection...");
      
      try {
        const proxyUrl = PROXY_SERVER_URL();
        console.log("Testing proxy connection to:", `${proxyUrl}/`);
        
        setIsUsingRailway(proxyUrl === DEFAULT_PUBLIC_PROXY_URL);
        
        // Minimum delay to avoid flashing toasts too quickly
        const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test endpoint with a specific test query
        // Using a special endpoint first that just returns cors headers - less prone to errors
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const corsTestUrl = `${proxyUrl}/cors-test`;
        console.log("Testing CORS configuration first:", corsTestUrl);
        
        try {
          const corsResponse = await fetch(corsTestUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache'
            },
            mode: 'cors',
            signal: controller.signal,
            cache: 'no-cache',
            credentials: 'omit'
          });
          
          if (corsResponse.ok) {
            console.log("✅ CORS test endpoint successful, CORS is properly configured");
          } else {
            console.log("⚠️ CORS test endpoint failed, but continuing with root endpoint test");
          }
        } catch (corsError) {
          // If CORS test fails, try the root endpoint instead
          console.log("⚠️ CORS test endpoint error:", corsError);
        }
        
        // Now try the root endpoint
        const response = await fetch(`${proxyUrl}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          mode: 'cors',
          signal: controller.signal,
          cache: 'no-cache',
          credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        // Ensure minimum delay for toast visibility
        await minDelayPromise;
        
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
        
        // Ensure a minimum display time for the loading toast
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if error is CORS-related with extensive pattern matching
        const errorStr = String(error).toLowerCase();
        const isCorsError = errorStr.includes('cors') || 
                           errorStr.includes('cross-origin') || 
                           errorStr.includes('failed to fetch') ||
                           errorStr.includes('network error') ||
                           errorStr.includes('blocked by') ||
                           errorStr.includes('access-control-allow-origin') ||
                           errorStr.includes('not allowed by') ||
                           errorStr.includes('opaque response');
        
        if (isCorsError) {
          toast.error("CORS Policy Blocked API Connection", {
            id: connectionToastId,
            description: "The browser's security policy is preventing connection to the API. You can enter traffic data manually to continue."
          });
          
          // Only show traffic fields if explicitly requested, not on initial load with error
          if (apiError) {
            setShowTrafficFields(true);
          }
        } else {
          toast.error("SpyFu API connection failed", {
            id: connectionToastId,
            description: "You can enter traffic data manually to continue."
          });
          
          // Only show traffic fields if explicitly requested, not on initial load with error
          if (apiError) {
            setShowTrafficFields(true);
          }
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
  }, [isCheckingConnection, connectionAttempted, apiError]);
  
  useEffect(() => {
    // Show traffic fields ONLY when API error is present, not on initial load
    if (apiError) {
      setShowTrafficFields(true);
    }
  }, [apiError]);

  useEffect(() => {
    // Initialize form with initial data if provided
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
    setShowTrafficFields,
    resetForm
  };
}
