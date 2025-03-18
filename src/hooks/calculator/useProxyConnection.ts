
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL, getProxyTestUrl } from "@/services/api/spyfuConfig";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Try to connect to the SpyFu proxy server
    const checkProxyConnection = async () => {
      if (connectionAttempted) return;
      
      setIsCheckingConnection(true);
      setConnectionAttempted(true);
      
      try {
        const testUrl = getProxyTestUrl();
        console.log(`Testing proxy connection at: ${testUrl}`);
        
        const response = await fetch(testUrl, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Include credentials and mode for better cross-origin support
          credentials: 'omit',
          mode: 'cors'
        });
        
        if (response.ok) {
          console.log("Proxy connection successful!");
          setProxyConnected(true);
          setConnectionError(null);
        } else {
          console.error("Proxy connection failed with status:", response.status);
          setProxyConnected(false);
          setConnectionError("Could not connect to the SpyFu API server. Using manual mode.");
        }
      } catch (error) {
        console.error("Proxy connection error:", error);
        setProxyConnected(false);
        setConnectionError("API connection error. Using manual mode.");
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkProxyConnection();
  }, [connectionAttempted]);

  const resetConnectionState = () => {
    setConnectionAttempted(false);
    setConnectionError(null);
  };

  return {
    proxyConnected,
    isUsingRailway: true,
    connectionError,
    isCheckingConnection,
    resetConnectionState
  };
}
