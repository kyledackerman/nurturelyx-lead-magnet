
import { AlertCircle, CheckCircle, Info, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiateGoogleAnalyticsAuth, getAvailableWebProperties } from "@/services/apiService";
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
  const [availableProperties, setAvailableProperties] = useState<{ id: string, name: string }[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [propertiesLoaded, setPropertiesLoaded] = useState<boolean>(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [errors, setErrors] = useState<{ property?: string }>({});

  useEffect(() => {
    // Check if we have a Google Analytics token in session storage
    const hasToken = !!sessionStorage.getItem('google_analytics_token');
    
    if (hasToken !== isGAConnected) {
      setIsGAConnected(hasToken);
      
      // If we just became connected, show a success message
      if (hasToken && !isGAConnected) {
        toast.success("Successfully connected to Google Analytics");
        
        // Set a timeout to fetch properties or display an error
        const timeout = setTimeout(() => {
          if (!propertiesLoaded && !loadingProperties) {
            setConnectionFailed(true);
            toast.error("Failed to load web properties", {
              description: "Connection timed out. Please try refreshing or disconnect and try again."
            });
          }
        }, 10000); // 10-second timeout
        
        setConnectionTimeout(timeout);
      }
    }
    
    // If we have a token and properties haven't been loaded yet, fetch available properties
    if (hasToken && !apiError && !propertiesLoaded && !loadingProperties) {
      fetchAvailableWebProperties();
    }
    
    return () => {
      // Clear timeout on unmount
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [isGAConnected, apiError, propertiesLoaded, loadingProperties]);

  const fetchAvailableWebProperties = async () => {
    if (loadingProperties) return; // Prevent multiple simultaneous requests
    
    try {
      setLoadingProperties(true);
      setConnectionFailed(false);
      console.log("Fetching available web properties...");
      
      // Fetch web properties from the Google Analytics API
      const properties = await getAvailableWebProperties();
      
      console.log("Web properties fetched:", properties);
      setAvailableProperties(properties);
      setPropertiesLoaded(true);
      setLoadingProperties(false);
      
      // Clear any connection timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      
      // If we have properties and no selection yet, prompt the user to select
      if (properties.length > 0) {
        toast.success("Web properties loaded successfully", {
          description: "Please select a web property from the dropdown to continue.",
        });
      } else {
        toast.warning("No web properties found", {
          description: "Your Google Analytics account doesn't have any web properties. Please add a property or enter data manually.",
        });
      }
    } catch (error) {
      setLoadingProperties(false);
      setConnectionFailed(true);
      console.error("Error fetching web properties:", error);
      toast.error("Failed to fetch web properties", {
        description: "We had trouble retrieving your web properties from Google Analytics. You can try refreshing or enter data manually."
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

  const handlePropertyChange = (propertyId: string) => {
    // Find the property name from the available properties
    const selectedProperty = availableProperties.find(prop => prop.id === propertyId);
    if (selectedProperty) {
      setSelectedDomain(selectedProperty.name);
      setDomainSelected(true);
      updateFormDomain(selectedProperty.name);
      
      toast.success(`Web property selected: ${selectedProperty.name}`, {
        description: "Now please enter your average transaction value to continue."
      });
    }
  };

  const handleRefreshProperties = () => {
    setPropertiesLoaded(false);
    setAvailableProperties([]);
    setConnectionFailed(false);
    fetchAvailableWebProperties();
  };
  
  const handleDisconnect = () => {
    sessionStorage.removeItem('google_analytics_token');
    setIsGAConnected(false);
    setPropertiesLoaded(false);
    setAvailableProperties([]);
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
                    Selected property: <strong>{selectedDomain}</strong>
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
            <div className="text-lg font-medium">Select Google Analytics Web Property</div>
            {propertiesLoaded && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshProperties}
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
                <AlertTitle>Web Properties Loading Failed</AlertTitle>
                <AlertDescription>
                  We couldn't load web properties from your Google Analytics account. 
                  Please try refreshing or proceed with manual data entry.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2 mt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshProperties}
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
          ) : loadingProperties ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted rounded-lg border border-border">
              <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full"></div>
              <span className="font-medium">Loading your web properties...</span>
            </div>
          ) : propertiesLoaded && availableProperties.length === 0 ? (
            <Alert className="bg-white">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No web properties found</AlertTitle>
              <AlertDescription>
                No web properties were found in your Google Analytics account. Please check your account or enter data manually.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Select 
                value={selectedDomain} 
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger id="property-select" className={`${errors.property ? "border-red-300" : ""} bg-white`}>
                  <SelectValue placeholder="Select a web property" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-80">
                  {availableProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            
              {errors.property && (
                <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p>{errors.property}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1 text-accent" />
                We'll analyze this web property's traffic data from Google Analytics
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
