
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info } from "lucide-react";
import { hasSpyFuApiKey } from "@/services/spyfuService";
import { toast } from "sonner";

interface SpyFuApiKeyFormProps {
  onApiKeySet: () => void;
}

export const SpyFuApiKeyForm = ({ onApiKeySet }: SpyFuApiKeyFormProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(hasSpyFuApiKey());

  const handleContinue = () => {
    toast.success("SpyFu API access is ready", {
      description: "You can now analyze domains using our SpyFu API integration."
    });
    onApiKeySet();
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      <div className="bg-green-50 p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">SpyFu API Integration Available</h3>
              <p className="text-green-700 text-sm">
                Our app includes SpyFu API access for accurate traffic data
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleContinue}
            className="text-white border-accent hover:bg-accent/10"
          >
            Continue
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 flex items-start gap-2 bg-white mt-4 p-3 rounded-lg">
          <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700 mb-1">SpyFu API Benefits</p>
            <p>
              Our SpyFu API integration provides accurate SEO and traffic data for any domain you analyze.
              Simply enter a domain and we'll fetch all the relevant metrics automatically. If the API
              is unavailable, you can still enter your data manually and get the same quality results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
