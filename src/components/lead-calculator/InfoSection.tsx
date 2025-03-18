
import { useState } from "react";
import { LineChart, AlertCircle, ExternalLink, Settings, HelpCircle, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PROXY_SERVER_URL, getProxyTestUrl } from "@/services/api/spyfuConfig";
import { ProxyConfigForm } from "./ProxyConfigForm";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoSectionProps {
  apiError?: string | null;
  proxyConnected?: boolean;
}

export const InfoSection = ({ apiError, proxyConnected }: InfoSectionProps) => {
  const [showProxyConfig, setShowProxyConfig] = useState(false);
  
  // Show proxy config button for everyone (removed admin-only restriction)
  const showProxySettings = true;

  return (
    <>
      {apiError ? (
        <Alert className="mt-4 bg-white" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 font-semibold">API Connection Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {apiError.includes("proxy") ? (
              <>
                <p>We couldn't connect to the proxy server. Please check that:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
                  <li>Your proxy server is running at <code className="bg-gray-200 px-1 rounded">{PROXY_SERVER_URL}</code></li>
                  <li>Your proxy server has CORS enabled for this domain</li>
                  <li>Your network/firewall allows connections to the proxy server</li>
                </ol>
                {showProxySettings && (
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
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">Technical details</summary>
            <p className="text-xs text-red-600 mt-1 bg-gray-50 p-1 rounded">{apiError}</p>
          </details>
        </Alert>
      ) : (
        // Always show the proxy config button when no API error
        !apiError && showProxySettings && (
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
        )
      )}
      
      {showProxyConfig && (
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
