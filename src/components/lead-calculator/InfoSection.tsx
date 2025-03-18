
import { LineChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InfoSectionProps {
  apiError?: string | null;
}

export const InfoSection = ({ apiError }: InfoSectionProps) => {
  return (
    <>
      {apiError && (
        <Alert className="mt-4 bg-white" variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 font-semibold">SpyFu API Connection Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {apiError.includes("proxy") ? (
              <>
                We couldn't connect to the proxy server. Please make sure your Express.js proxy server is running at http://localhost:3001. If you haven't set up the proxy server yet, please follow the setup instructions provided.
              </>
            ) : (
              <>
                We couldn't connect to the SpyFu API to fetch your traffic data. This is most likely due to CORS restrictions, which require using a proxy server. Please enter your traffic numbers manually to continue or set up the proxy server.
              </>
            )}
          </AlertDescription>
          <p className="text-red-600 mt-2 text-xs">Technical details: {apiError}</p>
        </Alert>
      )}
      
      <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-accent/10 p-2 rounded-full">
            <LineChart className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">How We Calculate Results</h3>
            <p className="text-sm text-gray-400">
              We analyze both your organic traffic and your paid traffic (from SpyFu data or your input) to identify 20% of total visitors that could be converted into leads, with 1% of those leads becoming sales.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
