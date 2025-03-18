
import { useState } from "react";
import { LineChart, AlertCircle, ExternalLink, HelpCircle, Server, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DEFAULT_PUBLIC_PROXY_URL } from "@/services/api/spyfuConfig";
import { ProxyConfigForm } from "./ProxyConfigForm";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoSectionProps {
  apiError?: string | null;
  proxyConnected?: boolean;
}

export const InfoSection = ({ apiError, proxyConnected }: InfoSectionProps) => {
  const [showProxyConfig, setShowProxyConfig] = useState(false);

  return (
    <>
      {apiError ? (
        <Alert className="mt-4 bg-white" variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-amber-800 font-semibold">API Not Available</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p>To continue calculating your results, please enter your traffic data manually below.</p>
            <p className="text-sm mt-2 text-gray-600">The calculator will work perfectly with your manually entered data.</p>
          </AlertDescription>
        </Alert>
      ) : (
        // Display connection information
        <>
          {proxyConnected ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md mt-4">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>Connected to SpyFu traffic data service</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs ml-auto text-green-800 hover:text-green-900 hover:bg-green-100 p-1 h-auto"
                onClick={() => setShowProxyConfig(!showProxyConfig)}
              >
                <Server className="h-3 w-3 mr-1" />
                Server info
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-md mt-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Trying to connect to API. Enter traffic information below if connection fails.</span>
            </div>
          )}
        </>
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
}
