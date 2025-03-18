
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL, PROXY_SERVER_URL } from "@/services/api/spyfuConfig";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [isUsingRailway, setIsUsingRailway] = useState<boolean>(true);

  useEffect(() => {
    const checkProxyConnection = async () => {
      if (isCheckingConnection || connectionAttempted) return;
      
      setIsCheckingConnection(true);
      const connectionToastId = toast.loading("Checking API connection...");
      
      try {
        const proxyUrl = PROXY_SERVER_URL();
        console.log("Testing proxy connection to:", `${proxyUrl}/`);
        
        setIsUsingRailway(proxyUrl === DEFAULT_PUBLIC_PROXY_URL);
        
        // Test the root endpoint with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${proxyUrl}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log("✅ Proxy server is running at:", proxyUrl);
          setProxyConnected(true);
          
          toast.success("API connection established", {
            id: connectionToastId
          });
        } else {
          throw new Error(`Proxy server returned status: ${response.status}`);
        }
      } catch (error) {
        console.error("Proxy connection error:", error);
        setProxyConnected(false);
        
        toast.error("API connection failed", {
          id: connectionToastId,
          description: "You can enter traffic data manually to continue."
        });
        
        const proxyUrl = PROXY_SERVER_URL();
        console.log("❌ Proxy server connection failed at:", proxyUrl);
      } finally {
        setIsCheckingConnection(false);
        setConnectionAttempted(true);
      }
    };
    
    checkProxyConnection();
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
