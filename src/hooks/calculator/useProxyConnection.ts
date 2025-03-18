
import { useState, useEffect, useCallback } from "react";
import { DEFAULT_PUBLIC_PROXY_URL, getProxyTestUrl } from "@/services/api/spyfuConfig";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 2;

  const checkProxyConnection = useCallback(async () => {
    if (connectionAttempted && retryCount >= MAX_RETRIES) return;
    
    setIsCheckingConnection(true);
    setConnectionAttempted(true);
    
    try {
      const testUrl = getProxyTestUrl();
      console.log(`Testing proxy connection at: ${testUrl}`);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit', // Don't send credentials
        cache: 'no-cache', // Don't use cache
        redirect: 'follow'
      });
      
      if (response.ok) {
        console.log("Proxy connection successful!");
        setProxyConnected(true);
        setConnectionError(null);
      } else {
        console.error("Proxy connection failed with status:", response.status);
        setProxyConnected(false);
        setConnectionError(`API responded with status: ${response.status}. Using manual mode.`);
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Proxy connection error:", error);
      setProxyConnected(false);
      setConnectionError("Cannot connect to API server. Using manual mode.");
      setRetryCount(prev => prev + 1);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [connectionAttempted, retryCount]);

  useEffect(() => {
    checkProxyConnection();
  }, [checkProxyConnection]);

  const resetConnectionState = () => {
    setConnectionAttempted(false);
    setConnectionError(null);
    setIsCheckingConnection(true);
    setRetryCount(0);
  };

  const retryConnection = () => {
    if (retryCount < MAX_RETRIES) {
      setConnectionAttempted(false);
      checkProxyConnection();
    }
  };

  return {
    proxyConnected,
    isUsingRailway: true,
    connectionError,
    isCheckingConnection,
    resetConnectionState,
    retryConnection
  };
}
