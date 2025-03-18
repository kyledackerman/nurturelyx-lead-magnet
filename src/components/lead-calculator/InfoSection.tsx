
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
        <Alert className="mt-4 bg-white" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 font-semibold">API Connection Error</AlertTitle>
          <AlertDescription className="text-red-700">
            <p>We couldn't connect to the SpyFu API. Please enter your traffic data manually to continue.</p>
            <p className="text-sm mt-2 text-gray-600">Enter your traffic data manually to continue without the API.</p>
          </AlertDescription>
        </Alert>
      ) : (
        // Display Railway connection status when no error
        <>
          {proxyConnected && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md mt-4">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>Connected to SpyFu API via Railway proxy</span>
            </div>
          )}
        </>
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
