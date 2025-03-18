
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DEFAULT_PUBLIC_PROXY_URL } from "@/services/api/spyfuConfig";

export function useProxyConnection() {
  const [proxyConnected, setProxyConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Assume connection fails for now and immediately go to manual mode
    // This prevents users from seeing errors when API is unavailable
    setProxyConnected(false);
    setConnectionAttempted(true);
    setConnectionError("API connection temporarily unavailable. Using manual mode.");
    
    // No toast for connection error - this provides a quieter experience
    console.log("Using manual input mode for traffic data");
  }, []);

  const resetConnectionState = () => {
    setConnectionAttempted(false);
    setConnectionError(null);
  };

  return {
    proxyConnected: false, // Always return false to use manual mode
    isUsingRailway: true, // Keep this for compatibility
    connectionError: "API connection temporarily unavailable. Using manual mode.",
    resetConnectionState
  };
}
