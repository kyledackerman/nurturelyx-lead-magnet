
import { useState, useEffect, useCallback } from "react";

// Direct hardcoded Railway URL for maximum reliability
const RAILWAY_URL = "https://nurture-lead-vision-production.up.railway.app";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  const checkProxyConnection = useCallback(async () => {
    if (connectionAttempted && retryCount >= MAX_RETRIES) return;
    
    setIsCheckingConnection(true);
    setConnectionAttempted(true);
    setConnectionError(null);
    
    try {
      console.log(`Testing proxy connection at: ${RAILWAY_URL}`);
      
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${RAILWAY_URL}/`, { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache' 
        },
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log("✅ Proxy connection successful!");
        setProxyConnected(true);
        setConnectionError(null);
      } else {
        console.error(`❌ Proxy connection failed with status: ${response.status}`);
        setProxyConnected(false);
        setConnectionError(`API server responded with status: ${response.status}. Using manual mode.`);
        setRetryCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("❌ Proxy connection error:", error);
      
      // Provide more detailed error message
      let errorMessage = "Cannot connect to API server. Using manual mode.";
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. Using manual mode.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}. Using manual mode.`;
      }
      
      setProxyConnected(false);
      setConnectionError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [connectionAttempted, retryCount]);

  useEffect(() => {
    // When component mounts, immediately attempt to connect
    checkProxyConnection();
    
    // Cleanup
    return () => {
      // No cleanup needed
    };
  }, [checkProxyConnection]);

  const resetConnectionState = useCallback(() => {
    setConnectionAttempted(false);
    setConnectionError(null);
    setIsCheckingConnection(true);
    setRetryCount(0);
  }, []);

  const retryConnection = useCallback(() => {
    resetConnectionState();
    setTimeout(() => {
      checkProxyConnection();
    }, 100);
  }, [checkProxyConnection, resetConnectionState]);

  return {
    proxyConnected,
    isUsingRailway: true,
    connectionError,
    isCheckingConnection,
    resetConnectionState,
    retryConnection
  };
}
