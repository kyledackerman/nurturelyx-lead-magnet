
import { Button } from "@/components/ui/button";
import { DEFAULT_PUBLIC_PROXY_URL } from "@/services/api/spyfuConfig";
import { Info, Server, TerminalSquare } from "lucide-react";
import { useState } from "react";

interface ProxyConfigFormProps {
  onClose: () => void;
  diagnosticInfo?: any;
}

export const ProxyConfigForm = ({ onClose, diagnosticInfo }: ProxyConfigFormProps) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

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
            <p className="text-xs bg-white p-1.5 rounded mt-1 font-mono text-black">
              {DEFAULT_PUBLIC_PROXY_URL}
            </p>
            <p className="text-xs mt-2">
              For reliability, we always use the Railway proxy server. Custom proxy configuration is not available.
            </p>
            <div className="mt-2 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                <TerminalSquare size={14} className="mr-1" />
                {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
              </Button>
              
              <a 
                href={DEFAULT_PUBLIC_PROXY_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline"
              >
                Test server in new tab
              </a>
            </div>
            
            {showDiagnostics && diagnosticInfo && (
              <div className="mt-3 p-2 bg-gray-900 text-gray-200 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
