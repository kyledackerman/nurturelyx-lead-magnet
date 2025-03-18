
import { useState, useEffect, useCallback } from "react";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const MAX_RETRIES = 2; // Reduced from 3 to 2 to fail faster

  const checkProxyConnection = useCallback(async () => {
    if (connectionAttempted && retryCount >= MAX_RETRIES) return;
    
    setIsCheckingConnection(true);
    setConnectionAttempted(true);
    setConnectionError(null);
    
    try {
      console.log(`Testing API connection at: /api`);
      
      // Try the API endpoint first for diagnostics
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced from 8000 to 5000ms for faster timeout
      
      // Use a simple GET request to the API endpoint
      const pingResponse = await fetch('/api', {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      // Save the response text for debugging
      const responseText = await pingResponse.text();
      
      // Try to parse it as JSON
      let jsonData = null;
      try {
        jsonData = JSON.parse(responseText);
        console.log("API endpoint returned valid JSON:", jsonData);
      } catch (e) {
        console.error("API endpoint did not return valid JSON. Got:", responseText.substring(0, 100));
        setDiagnosticInfo({
          error: "Invalid JSON response",
          responseText: responseText.substring(0, 250), // First 250 chars
          htmlDetected: responseText.includes("<!DOCTYPE") || responseText.includes("<html")
        });
        throw new Error(`Server returned HTML instead of JSON: ${responseText.substring(0, 50)}...`);
      }
      
      if (pingResponse.ok && jsonData) {
        console.log("✅ API connection successful!");
        setProxyConnected(true);
        setConnectionError(null);
        setDiagnosticInfo(jsonData);
      } else {
        throw new Error(`API endpoint responded with status: ${pingResponse.status}`);
      }
    } catch (error: any) {
      console.error("❌ API connection error:", error);
      
      // Enhanced error messages with more details
      let errorMessage = "Cannot connect to API server. Try refreshing or check your network.";
      
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. The server might be down or your network might be blocking the connection.";
      } else if (error.message.includes("HTML") || error.message.includes("<!DOCTYPE")) {
        errorMessage = "The server is returning HTML instead of JSON. This happens when only the frontend is running, not the API server.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      setProxyConnected(false);
      setConnectionError(errorMessage);
      
      // Store error diagnostics
      setDiagnosticInfo({
        error: error.message || "Unknown error",
        name: error.name || "Error",
        isAbortError: error.name === "AbortError",
        isHtmlResponse: error.message.includes("HTML") || error.message.includes("<!DOCTYPE")
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
    }, 7000); // Try every 7 seconds - reduced from 10s 
    
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
