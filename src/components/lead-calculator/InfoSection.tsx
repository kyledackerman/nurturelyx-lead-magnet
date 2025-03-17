
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InfoSectionProps {
  apiError?: string | null;
}

export const InfoSection = ({ apiError }: InfoSectionProps) => {
  return (
    <>
      {apiError && (
        <Alert className="mt-4 bg-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800 font-semibold">API Connection Error</AlertTitle>
          <AlertDescription className="text-red-700">
            We couldn't connect to the Google Analytics API to fetch your traffic data. Please enter your traffic numbers manually to continue.
          </AlertDescription>
          <p className="text-red-600 mt-2 text-xs">{apiError}</p>
        </Alert>
      )}
      
      <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-2">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-accent/10 p-1 rounded-full">
            <Info className="h-16 w-16 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">How We Calculate Results</h3>
            <p className="text-sm text-gray-400">
              We analyze both your organic traffic and your paid traffic (from Google Analytics or your input) to identify 20% of total visitors that could be converted into leads, with 1% of those leads becoming sales.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
