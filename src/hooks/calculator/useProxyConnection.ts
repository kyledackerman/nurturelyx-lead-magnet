
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
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      try {
        // Force no-cache for this request
        const response = await fetch('/api/check', {
          method: 'GET',
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
        if (!response) {
          throw new Error("Server returned no response");
        }
        
        // Log response properties for debugging
        console.log(`API response status: ${response.status}, ok: ${response.ok}, headers:`, 
          Object.fromEntries([...response.headers.entries()]));
        
        // Get response text first to verify if it's actually JSON
        let responseText = '';
        try {
          responseText = await response.text();
          console.log("API response text:", responseText ? responseText.substring(0, 100) + "..." : "[empty]");
        } catch (textError) {
          console.error("Failed to get response text:", textError);
          throw new Error(`Failed to read server response: ${textError.message}`);
        }
        
        // Check if empty response
        if (!responseText || responseText.trim() === '') {
          setDiagnosticInfo({
            error: "Empty response from server",
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries([...response.headers.entries()]),
            url: "/api/check"
          });
          throw new Error("Empty response from server");
        }
        
        const contentType = response.headers.get('content-type');
        
        // Check if response contains HTML markers
        const isHtmlResponse = responseText.includes('<!DOCTYPE') || 
                             responseText.includes('<html') || 
                             contentType?.includes('text/html');
        
        if (isHtmlResponse) {
          setDiagnosticInfo({
            error: "Server returned HTML instead of JSON",
            contentType: contentType,
            responsePreview: responseText.substring(0, 250),
            htmlDetected: true,
            status: response.status,
            statusText: response.statusText,
            url: "/api/check"
          });
          
          throw new Error("The server is returning HTML instead of JSON. This usually means the Express API routes are not being handled correctly.");
        }
        
        // Try parsing as JSON only if it doesn't look like HTML
        let jsonData = null;
        
        try {
          // Parse the text as JSON
          jsonData = JSON.parse(responseText);
          
          // If we get here, it's valid JSON
          console.log("API endpoint returned valid JSON:", jsonData);
          
          if (response.ok && jsonData) {
            console.log("✅ API connection successful!");
            setProxyConnected(true);
            setConnectionError(null);
            setDiagnosticInfo({
              ...jsonData,
              contentType,
              status: response.status,
              headers: Object.fromEntries([...response.headers.entries()])
            });
          } else {
            throw new Error(`API endpoint responded with status: ${response.status}`);
          }
        } catch (parseError) {
          // JSON parsing failed but it's not HTML
          console.error("Failed to parse response as JSON:", parseError);
          
          setDiagnosticInfo({
            error: "Server returned non-JSON content",
            contentType: contentType,
            responsePreview: responseText.substring(0, 250),
            htmlDetected: responseText.includes("<!DOCTYPE") || responseText.includes("<html"),
            status: response.status,
            statusText: response.statusText,
            url: "/api/check"
          });
          
          throw new Error(`Server returned non-JSON response: ${parseError.message}`);
        }
      } catch (fetchError) {
        // Catch fetch errors separately to provide better diagnostics
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("❌ API connection error:", error);
      
      let errorMessage = "Cannot connect to API server. Try refreshing or check your network.";
      
      if (error.name === "AbortError") {
        errorMessage = "Connection timed out. The server might be down or your network might be blocking the connection.";
      } else if (error.message && (
        error.message.includes("HTML instead of JSON") || 
        error.message.includes("non-JSON") || 
        diagnosticInfo?.htmlDetected
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
          isAbortError: error.name === "AbortError",
          url: "/api/check"
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
