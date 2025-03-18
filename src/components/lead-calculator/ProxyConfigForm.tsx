
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROXY_SERVER_URL, saveCustomProxyUrl } from "@/services/api/spyfuConfig";
import { AlertTriangle, CheckCircle2, Globe, Server } from "lucide-react";

interface ProxyConfigFormProps {
  onClose: () => void;
}

export const ProxyConfigForm = ({ onClose }: ProxyConfigFormProps) => {
  const [proxyUrl, setProxyUrl] = useState<string>(PROXY_SERVER_URL);
  const [isValidUrl, setIsValidUrl] = useState<boolean>(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [isPublicUrl, setIsPublicUrl] = useState<boolean>(!proxyUrl.includes('localhost') && !proxyUrl.includes('127.0.0.1'));

  useEffect(() => {
    // Validate URL whenever it changes
    const isValid = proxyUrl.startsWith('http://') || proxyUrl.startsWith('https://');
    setIsValidUrl(isValid);
    
    // Check if it's a public URL (not localhost)
    setIsPublicUrl(!proxyUrl.includes('localhost') && !proxyUrl.includes('127.0.0.1'));

    // Reset test status when URL changes
    if (testStatus !== 'idle') {
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [proxyUrl, testStatus]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProxyUrl(url);
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection...');
    
    try {
      const testUrl = `${proxyUrl}/proxy/spyfu?domain=ping`;
      console.log(`Testing connection to: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setTestStatus('success');
          setTestMessage('Connection successful! Proxy server is responding with valid data.');
          console.log("✅ Connection test successful with data:", data);
        } catch (error) {
          // Response was OK but not valid JSON
          setTestStatus('success');
          setTestMessage('Connection successful! Proxy server is responding.');
          console.log("✅ Connection test successful (no valid JSON)");
        }
      } else {
        setTestStatus('error');
        setTestMessage(`Connection failed with status: ${response.status} ${response.statusText}`);
        console.error(`❌ Connection test failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Proxy test connection error:", error);
      setTestStatus('error');
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // More helpful error for CORS or network issues
        if (proxyUrl.includes('localhost')) {
          setTestMessage(`Cannot connect to localhost from browser. For production use, you need a publicly accessible proxy server URL.`);
        } else {
          setTestMessage(`Network error: Could not connect to the proxy server. Check for CORS issues or server availability.`);
        }
      } else {
        setTestMessage(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const handleSave = () => {
    if (isValidUrl) {
      saveCustomProxyUrl(proxyUrl);
      onClose();
    }
  };

  const resetToDefault = () => {
    // Try to detect if we're running locally
    const isLocalHost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1');
    
    const defaultUrl = isLocalHost ? 'http://localhost:3001' : 'https://yourproxyserver.com';
    setProxyUrl(defaultUrl);
    setTestStatus('idle');
    setTestMessage('');
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h3 className="font-medium mb-2">Configure Proxy Server URL</h3>
      
      <div className="p-3 bg-blue-50 text-blue-700 rounded-md mb-4 text-sm">
        <div className="flex items-start gap-2">
          <Globe size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Public Proxy Server Setup</p>
            <p className="text-sm mt-1">
              For production use, you need a publicly accessible proxy server instead of localhost. 
              Your proxy server must:
            </p>
            <ul className="list-disc ml-5 mt-1 text-xs space-y-1">
              <li>Be accessible over the internet (not localhost)</li>
              <li>Have CORS enabled to allow requests from your website</li>
              <li>Implement the same API endpoints as your local proxy</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Proxy Server URL</label>
          <Input
            type="text"
            value={proxyUrl}
            onChange={handleUrlChange}
            placeholder="https://yourproxyserver.com"
            className={!isValidUrl ? "border-red-500" : ""}
          />
          {!isValidUrl && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid URL starting with http:// or https://
            </p>
          )}
          {!isPublicUrl && (
            <div className="mt-2 text-xs text-amber-600 flex items-start gap-1.5 bg-amber-50 p-2 rounded">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                <strong>Warning:</strong> Using localhost will only work when developing locally. 
                For production use, please enter a publicly accessible URL.
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Examples: 
            <code className="bg-gray-200 px-1 rounded mx-1">https://yourproxyserver.com</code> or 
            <code className="bg-gray-200 px-1 rounded mx-1">http://your-domain.com:3001</code>
          </p>
        </div>

        {testStatus !== 'idle' && (
          <div className={`text-sm p-2 rounded flex items-start gap-2 ${
            testStatus === 'testing' ? 'bg-blue-50 text-blue-700' :
            testStatus === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {testStatus === 'success' ? (
              <CheckCircle2 size={16} className="mt-0.5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertTriangle size={16} className="mt-0.5 text-amber-500 flex-shrink-0" />
            )}
            <span>{testMessage}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testConnection}
            disabled={!isValidUrl || testStatus === 'testing'}
            className="text-xs"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetToDefault} 
            size="sm"
            className="text-xs"
          >
            Reset to Default
          </Button>
        </div>
        
        <div className="flex justify-end space-x-2">
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
