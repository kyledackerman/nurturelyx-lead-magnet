
import { useState } from "react";
import { LineChart, AlertCircle, HelpCircle, Server, CheckCircle2, Loader2, RefreshCw, TerminalSquare, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProxyConfigForm } from "./ProxyConfigForm";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoSectionProps {
  apiError?: string | null;
  connectionError?: string | null;
  proxyConnected?: boolean;
  isCheckingConnection?: boolean;
  diagnosticInfo?: any;
  onRetryConnection?: () => void;
}

export const InfoSection = ({ 
  apiError, 
  connectionError,
  proxyConnected,
  isCheckingConnection,
  diagnosticInfo,
  onRetryConnection
}: InfoSectionProps) => {
  const [showProxyConfig, setShowProxyConfig] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Is the error related to HTML response?
  const isHtmlError = connectionError?.includes("<!DOCTYPE") || 
                     connectionError?.includes("HTML") || 
                     connectionError?.includes("Unexpected token '<'") ||
                     (diagnosticInfo?.htmlDetected === true) ||
                     (diagnosticInfo?.isHtmlResponse === true);

  // Show loading when checking connection
  if (isCheckingConnection) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-md mt-4">
        <Loader2 size={16} className="animate-spin flex-shrink-0" />
        <span>Connecting to traffic data service...</span>
      </div>
    );
  }

  // Show API error message
  if (apiError) {
    return (
      <Alert className="mt-4 bg-white" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-red-800 font-semibold">Traffic Data Unavailable</AlertTitle>
        <AlertDescription className="text-red-700">
          <p>{apiError}</p>
          <p className="text-sm mt-2 font-medium">Enter your traffic data below to continue. Your report will still be accurate.</p>
          {onRetryConnection && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-fit" 
              onClick={onRetryConnection}
            >
              <RefreshCw size={16} className="mr-2" />
              Retry Connection
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Show connection error message with enhanced HTML detection
  if (connectionError) {
    return (
      <Alert className="mt-4 bg-white" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-red-800 font-semibold">API Connection Issue</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="flex flex-col">
            <p>{connectionError}</p>
            {isHtmlError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="font-medium text-yellow-800">HTML Response Detected Instead of JSON</p>
                <p className="text-yellow-700 mt-1">
                  This usually means the server is only running the frontend, not the backend API. 
                  Make sure your server.js file is running alongside the frontend.
                </p>
                <ul className="list-disc pl-5 mt-1 text-yellow-700 space-y-1">
                  <li>Check that your Railway deployment is running server.js</li>
                  <li>Ensure package.json has the correct start script</li>
                  <li>The Express server should serve both the API and frontend</li>
                </ul>
              </div>
            )}
            <p className="text-sm mt-3 font-medium">Enter your traffic data below to continue with the calculator.</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {onRetryConnection && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit" 
                  onClick={onRetryConnection}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retry Connection
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-800 hover:text-red-900 hover:bg-red-100 p-1 h-auto"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                <TerminalSquare className="h-3 w-3 mr-1" />
                {showDiagnostics ? "Hide Diagnostics" : "Show Diagnostics"}
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className="text-xs text-red-800 hover:text-red-900 hover:bg-red-100 p-1 h-auto"
                onClick={() => window.open('/api', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Test API Directly
              </Button>
            </div>
            
            {showDiagnostics && diagnosticInfo && (
              <div className="mt-3 p-2 bg-gray-900 text-gray-200 rounded text-xs font-mono overflow-x-auto">
                <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Default state - not connected, no explicit error
  return (
    <>
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md mt-4">
        <AlertCircle size={16} className="flex-shrink-0" />
        <span>Enter your website URL to continue. If connection fails, you can enter traffic data manually.</span>
        {onRetryConnection && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto text-amber-800 hover:text-amber-900 hover:bg-amber-100" 
            onClick={onRetryConnection}
          >
            <RefreshCw size={14} className="mr-1" />
            Try to Connect
          </Button>
        )}
      </div>
      
      {showProxyConfig && <ProxyConfigForm onClose={() => setShowProxyConfig(false)} diagnosticInfo={diagnosticInfo} />}
      
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
