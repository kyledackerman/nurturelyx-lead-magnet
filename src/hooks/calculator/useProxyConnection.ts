
import { useState, useEffect, useCallback } from "react";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const MAX_RETRIES = 2;

  const checkProxyConnection = useCallback(async () => {
    if (connectionAttempted && retryCount >= MAX_RETRIES) return;
    
    setIsCheckingConnection(true);
    setConnectionAttempted(true);
    setConnectionError(null);
    
    try {
      console.log(`Testing API connection at: /api/check`);
      
      // Try the API endpoint with a shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Force no-cache for this request
      const pingResponse = await fetch('/api/check', {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      // First check if we got any response at all
      if (!pingResponse) {
        throw new Error("Server returned no response");
      }
      
      // Check if the response is actually JSON by attempting to parse it
      let jsonData: any = null;
      const contentType = pingResponse.headers.get('content-type');
      
      try {
        // Attempt to parse JSON regardless of content-type header
        // This is a more reliable way to detect if it's JSON
        const responseText = await pingResponse.text();
        jsonData = JSON.parse(responseText);
        
        // If we get here, it's valid JSON even if the content-type is wrong
        console.log("API endpoint returned valid JSON:", jsonData);
        
        if (pingResponse.ok && jsonData) {
          console.log("✅ API connection successful!");
          setProxyConnected(true);
          setConnectionError(null);
          setDiagnosticInfo({
            ...jsonData,
            contentType,
            status: pingResponse.status,
            headers: Object.fromEntries([...pingResponse.headers.entries()])
          });
        } else {
          throw new Error(`API endpoint responded with status: ${pingResponse.status}`);
        }
      } catch (parseError) {
        // If JSON parsing fails, it's likely HTML or other non-JSON content
        console.error("Failed to parse response as JSON:", parseError);
        
        // Get the first 250 characters of the response to help diagnose
        const responseText = await pingResponse.text();
        setDiagnosticInfo({
          error: "Server returned non-JSON content",
          contentType: contentType,
          responsePreview: responseText.substring(0, 250),
          htmlDetected: responseText.includes("<!DOCTYPE") || responseText.includes("<html"),
          status: pingResponse.status,
          statusText: pingResponse.statusText
        });
        
        throw new Error("Server returned non-JSON response");
      }
    } catch (error: any) {
      console.error("❌ API connection error:", error);
      
      let errorMessage = "Cannot connect to API server. Try refreshing or check your network.";
      
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. The server might be down or your network might be blocking the connection.";
      } else if (error.message && (
        error.message.includes("non-JSON") || 
        diagnosticInfo?.htmlDetected || 
        diagnosticInfo?.responsePreview?.includes("<!DOCTYPE") || 
        diagnosticInfo?.responsePreview?.includes("<html")
      )) {
        errorMessage = "The server is returning HTML instead of JSON. This usually means the Express API routes are not being handled correctly.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      setProxyConnected(false);
      setConnectionError(errorMessage);
      
      if (!diagnosticInfo) {
        setDiagnosticInfo({
          error: error.message || "Unknown error",
          name: error.name || "Error",
          isAbortError: error.name === "AbortError"
        });
      }
    } finally {
      setIsCheckingConnection(false);
      setRetryCount(prev => prev + 1);
    }
  }, [connectionAttempted, retryCount, MAX_RETRIES, diagnosticInfo]);

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
    }, 7000);
    
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
