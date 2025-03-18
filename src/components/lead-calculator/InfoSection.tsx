
import { useState } from "react";
import { LineChart, AlertCircle, ExternalLink, Settings, HelpCircle, Server, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DEFAULT_PUBLIC_PROXY_URL, PROXY_SERVER_URL, getProxyTestUrl } from "@/services/api/spyfuConfig";
import { ProxyConfigForm } from "./ProxyConfigForm";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoSectionProps {
  apiError?: string | null;
  proxyConnected?: boolean;
}

export const InfoSection = ({ apiError, proxyConnected }: InfoSectionProps) => {
  const [showProxyConfig, setShowProxyConfig] = useState(false);
  
  // Restrict proxy config to admin only via localStorage flag
  const isAdmin = typeof localStorage !== 'undefined' && localStorage.getItem('admin_access') === 'true';
  const isUsingRailway = PROXY_SERVER_URL() === DEFAULT_PUBLIC_PROXY_URL;

  return (
    <>
      {apiError ? (
        <Alert className="mt-4 bg-white" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 font-semibold">API Connection Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {apiError.includes("proxy") ? (
              <>
                <p>We couldn't connect to the SpyFu API. Please enter your traffic data manually to continue.</p>
                {isAdmin && (
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowProxyConfig(!showProxyConfig)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Settings size={14} />
                      {showProxyConfig ? "Hide Config" : "Configure Proxy URL"}
                    </Button>
                  </div>
                )}
                <p className="text-sm mt-2 text-gray-600">Enter your traffic data manually to continue without the API.</p>
              </>
            ) : (
              <>
                We couldn't connect to get your traffic data automatically. Please enter your traffic numbers manually to continue.
              </>
            )}
          </AlertDescription>
          {isAdmin && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer">Technical details (admin only)</summary>
              <p className="text-xs text-red-600 mt-1 bg-gray-50 p-1 rounded">{apiError}</p>
              <p className="text-xs text-red-700 mt-1">Current proxy URL: {PROXY_SERVER_URL()}</p>
            </details>
          )}
        </Alert>
      ) : (
        // Display Railway connection status when no error
        <>
          {proxyConnected && isUsingRailway && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md mt-4">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>Connected to SpyFu API via Railway proxy</span>
            </div>
          )}
          
          {/* Show proxy config button only for admins */}
          {!apiError && isAdmin && (
            <div className="flex items-center mt-4 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowProxyConfig(!showProxyConfig)}
                className="flex items-center gap-1 text-xs ml-auto"
              >
                <Server size={14} />
                {showProxyConfig ? "Hide Proxy Config" : "Configure Proxy Server"}
              </Button>
            </div>
          )}
        </>
      )}
      
      {showProxyConfig && isAdmin && (
        <ProxyConfigForm onClose={() => setShowProxyConfig(false)} />
      )}
      
      <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-accent/10 p-2 rounded-full">
            <LineChart className="h-6 w-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">How We Calculate Results</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="text-xs">
                      Our calculation methodology assumes that with proper anonymous visitor identification tools, 
                      you could identify up to 20% of your website visitors, and convert 1% of those identified visitors into customers.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-500">
              We analyze both your organic traffic and your paid traffic to identify 20% of total visitors that could be converted into leads, with 1% of those leads becoming sales.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
