
import { AlertCircle, CheckCircle, Info, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiateGoogleAnalyticsAuth, getAvailableDomains } from "@/services/apiService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoogleAnalyticsConnectorProps {
  isGAConnected: boolean;
  setIsGAConnected: (connected: boolean) => void;
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  setDomainSelected: (selected: boolean) => void;
  updateFormDomain: (domain: string) => void;
  apiError: string | null | undefined;
  connectionFailed: boolean;
  setConnectionFailed: (failed: boolean) => void;
}

export const GoogleAnalyticsConnector = ({
  isGAConnected,
  setIsGAConnected,
  selectedDomain,
  setSelectedDomain,
  setDomainSelected,
  updateFormDomain,
  apiError,
  connectionFailed,
  setConnectionFailed,
}: GoogleAnalyticsConnectorProps) => {
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [loadingDomains, setLoadingDomains] = useState<boolean>(false);
  const [domainsLoaded, setDomainsLoaded] = useState<boolean>(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<{ domain?: string }>({});

  useEffect(() => {
    // Check if we have a Google Analytics token in session storage
    const hasToken = !!sessionStorage.getItem('google_analytics_token');
    
    if (hasToken !== isGAConnected) {
      setIsGAConnected(hasToken);
      
      // If we just became connected, show a success message
      if (hasToken && !isGAConnected) {
        toast.success("Successfully connected to Google Analytics");
        
        // Set a timeout to fetch domains or display an error
        const timeout = setTimeout(() => {
          if (!domainsLoaded && !loadingDomains) {
            setConnectionFailed(true);
            toast.error("Failed to load domains", {
              description: "Connection timed out. Please try refreshing domains or disconnect and try again."
            });
          }
        }, 10000); // 10-second timeout
        
        setConnectionTimeout(timeout);
      }
    }
    
    // If we have a token and domains haven't been loaded yet, fetch available domains
    if (hasToken && !apiError && !domainsLoaded && !loadingDomains) {
      fetchAvailableDomains();
    }
    
    return () => {
      // Clear timeout on unmount
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [isGAConnected, apiError, domainsLoaded, loadingDomains]);

  const fetchAvailableDomains = async () => {
    if (loadingDomains) return; // Prevent multiple simultaneous requests
    
    try {
      setLoadingDomains(true);
      setConnectionFailed(false);
      console.log("Fetching available domains...");
      
      // In a real implementation, this would fetch domains from the Google Analytics API
      const domains = await getAvailableDomains();
      
      console.log("Domains fetched:", domains);
      setAvailableDomains(domains);
      setDomainsLoaded(true);
      setLoadingDomains(false);
      
      // Clear any connection timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      
      // If we have domains and no selection yet, prompt the user to select
      if (domains.length > 0) {
        toast.success("Domains loaded successfully", {
          description: "Please select a domain from the dropdown to continue.",
        });
      } else {
        toast.warning("No domains found", {
          description: "Your Google Analytics account doesn't have any domains. Please add a domain or enter data manually.",
        });
      }
    } catch (error) {
      setLoadingDomains(false);
      setConnectionFailed(true);
      console.error("Error fetching domains:", error);
      toast.error("Failed to fetch domains", {
        description: "We had trouble retrieving your domains from Google Analytics. You can try refreshing or enter data manually."
      });
    }
  };

  const handleConnectGA = () => {
    toast.loading("Connecting to Google Analytics...");
    const success = initiateGoogleAnalyticsAuth();
    if (!success) {
      toast.error("Failed to open authentication popup", {
        description: "Please ensure popups are allowed for this site and try again."
      });
    }
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setDomainSelected(true);
    updateFormDomain(domain);
    
    toast.success(`Domain selected: ${domain}`, {
      description: "Now please enter your average transaction value to continue."
    });
  };

  const handleRefreshDomains = () => {
    setDomainsLoaded(false);
    setAvailableDomains([]);
    setConnectionFailed(false);
    fetchAvailableDomains();
  };
  
  const handleDisconnect = () => {
    sessionStorage.removeItem('google_analytics_token');
    setIsGAConnected(false);
    setDomainsLoaded(false);
    setAvailableDomains([]);
    setSelectedDomain("");
    setDomainSelected(false);
    setConnectionFailed(false);
    
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    
    toast.info("Disconnected from Google Analytics", {
      description: "You can reconnect at any time."
    });
  };

  // Display the connection status banner
  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      {isGAConnected ? (
        <div className="bg-green-50 p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Connected to Google Analytics</h3>
                {selectedDomain && (
                  <p className="text-green-700 text-sm">
                    Selected domain: <strong>{selectedDomain}</strong>
                  </p>
                )}
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
        <div className="bg-blue-50 p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-6 w-6 text-blue-500" />
              <h3 className="font-medium text-blue-800">Not connected to Google Analytics</h3>
            </div>
            <Button
              type="button"
              size="sm"
              className="bg-[#4285F4] hover:bg-[#3367D6] text-white"
              onClick={handleConnectGA}
            >
              Connect Now
            </Button>
          </div>
        </div>
      )}
      
      {isGAConnected && !apiError && !selectedDomain && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">Select Website Domain</div>
            {domainsLoaded && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshDomains}
                className="text-sm text-accent"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
          
          {connectionFailed ? (
            <div className="flex flex-col gap-2">
              <Alert className="bg-white">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Domain Loading Failed</AlertTitle>
                <AlertDescription>
                  We couldn't load domains from your Google Analytics account. 
                  Please try refreshing or proceed with manual data entry.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshDomains}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3" />
                  Disconnect
                </Button>
              </div>
            </div>
          ) : loadingDomains ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted rounded-lg border border-border">
              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
              <span className="font-medium">Loading your domains...</span>
            </div>
          ) : domainsLoaded && availableDomains.length === 0 ? (
            <Alert className="bg-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No domains found</AlertTitle>
              <AlertDescription>
                No domains were found in your Google Analytics account. Please check your account or enter data manually.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Select 
                value={selectedDomain} 
                onValueChange={handleDomainChange}
              >
                <SelectTrigger id="domain-select" className={`${errors.domain ? "border-red-300" : ""} bg-white`}>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-80">
                  {availableDomains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              {errors.domain && (
                <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p>{errors.domain}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1 text-accent" />
                We'll analyze this domain's traffic data from Google Analytics
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
