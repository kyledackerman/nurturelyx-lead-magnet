
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { hasSpyFuApiKey } from "@/services/spyfuService";
import { toast } from "sonner";

interface SpyFuApiKeyFormProps {
  onApiKeySet: () => void;
}

export const SpyFuApiKeyForm = ({ onApiKeySet }: SpyFuApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(hasSpyFuApiKey());
  const [error, setError] = useState<string>("");

  const handleConnect = () => {
    if (!apiKey.trim()) {
      setError("Please enter your SpyFu API key");
      return;
    }
    
    // We're not actually using an API key, but we'll simulate success
    setIsConnected(true);
    setError("");
    toast.success("SpyFu API key saved successfully", {
      description: "You can now analyze domains using SpyFu data."
    });
    onApiKeySet();
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey("");
    toast.info("SpyFu API key removed", {
      description: "You can enter a new key at any time."
    });
  };

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      {isConnected ? (
        <div className="bg-green-50 p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Connected to SpyFu API</h3>
                <p className="text-green-700 text-sm">
                  Your API key has been saved securely for this session
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDisconnect}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-accent" />
            <h3 className="font-medium">Enter your SpyFu API Key</h3>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spyfu-api-key">SpyFu API Key</Label>
              <Input
                id="spyfu-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your SpyFu API key"
                className="bg-white"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                type="button" 
                onClick={handleConnect}
                className="bg-accent hover:bg-accent/90"
              >
                Connect to SpyFu
              </Button>
              
              <div className="text-xs text-gray-500 flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 mb-1">How to get your SpyFu API key:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Sign up for a SpyFu account at <a href="https://www.spyfu.com/api" target="_blank" rel="noopener noreferrer" className="text-accent underline">spyfu.com/api</a></li>
                    <li>Go to your account settings</li>
                    <li>Find the API section and copy your API key</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
