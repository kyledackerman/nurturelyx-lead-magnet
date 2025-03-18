
import { useState, useEffect, useCallback } from "react";

// Direct hardcoded URL for maximum reliability - no function calls that could fail
const DIRECT_RAILWAY_URL = "https://nurture-lead-vision-production.up.railway.app";

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
      console.log(`Testing direct Railway connection at: ${DIRECT_RAILWAY_URL}`);
      
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Use no-cors mode to avoid CORS issues
      const response = await fetch(DIRECT_RAILWAY_URL, { 
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: {
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 200) {
        console.log("✅ Railway connection successful!");
        setProxyConnected(true);
        setConnectionError(null);
      } else {
        console.error(`❌ Railway connection failed with status: ${response.status}`);
        setProxyConnected(false);
        setConnectionError(`API server responded with status: ${response.status}. Using manual mode.`);
      }
    } catch (error: any) {
      console.error("❌ Railway connection error:", error);
      
      // Handle connection errors
      let errorMessage = "Cannot connect to API server. Using manual mode.";
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. Using manual mode.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}. Using manual mode.`;
      }
      
      setProxyConnected(false);
      setConnectionError(errorMessage);
    } finally {
      setIsCheckingConnection(false);
      setRetryCount(prev => prev + 1);
    }
  }, [connectionAttempted, retryCount, MAX_RETRIES]);

  useEffect(() => {
    // Attempt connection immediately when component mounts
    checkProxyConnection();
    
    // Set up auto-retry mechanism
    const retryTimer = setInterval(() => {
      if (!proxyConnected && retryCount < MAX_RETRIES) {
        console.log(`Auto-retry connection attempt ${retryCount + 1}/${MAX_RETRIES}`);
        checkProxyConnection();
      } else {
        clearInterval(retryTimer);
      }
    }, 10000); // Try every 10 seconds
    
    // Cleanup
    return () => {
      clearInterval(retryTimer);
    };
  }, [checkProxyConnection, proxyConnected, retryCount, MAX_RETRIES]);

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
