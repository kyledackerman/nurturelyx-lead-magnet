
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
      
      // Use our special JSON-check endpoint
      const pingResponse = await fetch('/api/check', {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      // First check if the response is actually JSON
      const contentType = pingResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Server returned non-JSON content type: ${contentType}`);
        const responseText = await pingResponse.text();
        setDiagnosticInfo({
          error: "Server returned non-JSON content type",
          contentType: contentType,
          responseText: responseText.substring(0, 250),
          htmlDetected: responseText.includes("<!DOCTYPE") || responseText.includes("<html"),
          status: pingResponse.status,
          statusText: pingResponse.statusText
        });
        throw new Error(`Server returned non-JSON content: ${contentType}`);
      }
      
      // Now safely parse the JSON response
      const jsonData = await pingResponse.json();
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
    } catch (error: any) {
      console.error("❌ API connection error:", error);
      
      let errorMessage = "Cannot connect to API server. Try refreshing or check your network.";
      
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. The server might be down or your network might be blocking the connection.";
      } else if (error.message && (error.message.includes("HTML") || error.message.includes("<!DOCTYPE") || error.message.includes("non-JSON"))) {
        errorMessage = "The server is returning HTML instead of JSON. This usually means the Express API routes are not being handled correctly.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      setProxyConnected(false);
      setConnectionError(errorMessage);
      
      setDiagnosticInfo({
        error: error.message || "Unknown error",
        name: error.name || "Error",
        isAbortError: error.name === "AbortError",
        isHtmlResponse: error.message && (error.message.includes("HTML") || error.message.includes("<!DOCTYPE") || error.message.includes("non-JSON"))
      });
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
