
import { useState, useEffect, useCallback } from "react";

// Direct hardcoded URL for maximum reliability - no function calls that could fail
const DIRECT_RAILWAY_URL = "https://nurture-lead-vision-production.up.railway.app";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const MAX_RETRIES = 3;

  const checkProxyConnection = useCallback(async () => {
    if (connectionAttempted && retryCount >= MAX_RETRIES) return;
    
    setIsCheckingConnection(true);
    setConnectionAttempted(true);
    setConnectionError(null);
    
    try {
      console.log(`Testing Railway connection at: ${DIRECT_RAILWAY_URL}`);
      
      // Try the /health endpoint first for diagnostics
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${DIRECT_RAILWAY_URL}/health`, { 
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
      
      if (response.ok) {
        // Store diagnostic info
        const data = await response.json();
        setDiagnosticInfo(data);
        console.log("Health check successful:", data);
        
        // Now try a simple ping to the root endpoint
        const pingResponse = await fetch(DIRECT_RAILWAY_URL, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-store'
        });
        
        if (pingResponse.ok) {
          console.log("✅ Railway connection successful!");
          setProxyConnected(true);
          setConnectionError(null);
        } else {
          throw new Error(`Root endpoint responded with status: ${pingResponse.status}`);
        }
      } else {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("❌ Railway connection error:", error);
      
      // Enhanced error messages with more details
      let errorMessage = "Cannot connect to API server. Try refreshing or check your network.";
      
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. The server might be down or your network might be blocking the connection.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}. This could be due to CORS, network issues, or server unavailability.`;
      }
      
      // Try a CORS-specific debug endpoint if available
      try {
        const corsDebugResponse = await fetch(`${DIRECT_RAILWAY_URL}/debug-headers`, { 
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (corsDebugResponse.ok) {
          const corsDebugData = await corsDebugResponse.json();
          console.log("CORS debug info:", corsDebugData);
          setDiagnosticInfo(corsDebugData);
          
          if (!corsDebugData.headers || !corsDebugData.headers['access-control-allow-origin']) {
            errorMessage += " CORS headers may be missing on the server.";
          }
        }
      } catch (corsError) {
        console.error("CORS debug endpoint failed:", corsError);
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
    setDiagnosticInfo(null);
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
    diagnosticInfo,
    resetConnectionState,
    retryConnection
  };
}
