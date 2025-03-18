
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROXY_SERVER_URL, saveCustomProxyUrl } from "@/services/spyfuService";

interface ProxyConfigFormProps {
  onClose: () => void;
}

export const ProxyConfigForm = ({ onClose }: ProxyConfigFormProps) => {
  const [proxyUrl, setProxyUrl] = useState<string>(PROXY_SERVER_URL);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProxyUrl(url);
    setIsValidUrl(url.startsWith('http://') || url.startsWith('https://'));
  };

  const handleSave = () => {
    if (isValidUrl) {
      saveCustomProxyUrl(proxyUrl);
      onClose();
    }
  };

  const resetToDefault = () => {
    const defaultUrl = 'http://65.184.26.60:3001';
    setProxyUrl(defaultUrl);
    setIsValidUrl(true);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h3 className="font-medium mb-2">Configure Proxy Server URL</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter your proxy server address:
      </p>
      
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            value={proxyUrl}
            onChange={handleUrlChange}
            placeholder="http://65.184.26.60:3001"
            className={!isValidUrl ? "border-red-500" : ""}
          />
          {!isValidUrl && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid URL starting with http:// or https://
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Examples: 
            <code className="bg-gray-200 px-1 rounded mx-1">http://65.184.26.60:3001</code> or 
            <code className="bg-gray-200 px-1 rounded mx-1">https://your-proxy-domain.com</code>
          </p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={resetToDefault} size="sm">Reset to Default</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValidUrl}
            className="bg-accent hover:bg-accent/90"
          >
            Save & Reload
          </Button>
        </div>
      </div>
    </div>
  );
};
