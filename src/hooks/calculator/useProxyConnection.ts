
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL, hasSpyFuApiKey, PROXY_SERVER_URL } from "@/services/api/spyfuConfig";

export function useProxyConnection() {
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

  const resetConnectionState = () => {
    setConnectionAttempted(false);
  };

  return {
    proxyConnected,
    isUsingRailway,
    resetConnectionState
  };
}
