
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PUBLIC_PROXY_URL } from "@/services/api/spyfuConfig";
import { AlertTriangle, CheckCircle2, Info, Server } from "lucide-react";

interface ProxyConfigFormProps {
  onClose: () => void;
}

export const ProxyConfigForm = ({ onClose }: ProxyConfigFormProps) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <Server size={16} />
        Proxy Server Configuration
      </h3>
      
      <div className="p-3 bg-blue-50 text-blue-700 rounded-md mb-4 text-sm">
        <div className="flex items-start gap-2">
          <Info size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Railway Proxy Server</p>
            <p className="text-xs bg-white p-1.5 rounded mt-1 font-mono">
              {DEFAULT_PUBLIC_PROXY_URL}
            </p>
            <p className="text-xs mt-2">
              For reliability, we always use the Railway proxy server. Custom proxy configuration has been disabled.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
