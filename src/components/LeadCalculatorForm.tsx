
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData } from "@/types/report";
import { AlertCircle, Info, DollarSign, RefreshCw, BarChart, CheckCircle, ChevronDown, XCircle } from "lucide-react";
import { initiateGoogleAnalyticsAuth, getAvailableDomains } from "@/services/apiService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  onReset?: () => void;
  isCalculating: boolean;
  initialData?: FormData | null;
  apiError?: string | null;
}

const LeadCalculatorForm = ({ onCalculate, onReset, isCalculating, initialData, apiError }: LeadCalculatorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    monthlyVisitors: 1000,
    organicTrafficManual: 0,
    isUnsureOrganic: false,
    isUnsurePaid: false,
    avgTransactionValue: 0, // Defaulted to 0
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isGAConnected, setIsGAConnected] = useState<boolean>(false);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [domainSelected, setDomainSelected] = useState<boolean>(false);
  const [loadingDomains, setLoadingDomains] = useState<boolean>(false);
  const [domainsLoaded, setDomainsLoaded] = useState<boolean>(false);
  const [connectionFailed, setConnectionFailed] = useState<boolean>(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [canCalculate, setCanCalculate] = useState<boolean>(false);

  useEffect(() => {
    // Validate form to enable/disable calculate button
    const hasRequiredFields = formData.avgTransactionValue >= 0 && 
      ((apiError || connectionFailed) || // API error or connection failed - manual mode
       (isGAConnected && selectedDomain)); // Connected with domain selected
    
    setCanCalculate(hasRequiredFields);
  }, [formData, apiError, connectionFailed, isGAConnected, selectedDomain]);

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
    
    if (initialData) {
      setFormData(initialData);
      
      // If there's a domain in initialData, select it
      if (initialData.domain) {
        setSelectedDomain(initialData.domain);
        setDomainSelected(true);
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
  }, [initialData, apiError, isGAConnected, domainsLoaded, loadingDomains]);

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

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!apiError) {
      // Only check Google Analytics connection if there's no API error
      if (!isGAConnected) {
        newErrors.googleAnalytics = "Please connect to Google Analytics first";
      } else if (!selectedDomain && !connectionFailed) {
        newErrors.domain = "Please select a domain";
      }
    }
    
    if (apiError && formData.isUnsurePaid === false && (formData.monthlyVisitors === undefined || formData.monthlyVisitors < 0)) {
      newErrors.monthlyVisitors = "Please enter a valid number of monthly paid visitors";
    }
    
    if (apiError && formData.isUnsureOrganic === false && (formData.organicTrafficManual === undefined || formData.organicTrafficManual < 0)) {
      newErrors.organicTrafficManual = "Please enter a valid number of monthly organic visitors";
    }
    
    if (formData.avgTransactionValue < 0) {
      newErrors.avgTransactionValue = "Please enter a valid transaction value";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update domain in form data
      const updatedFormData = {
        ...formData,
        domain: selectedDomain || formData.domain || "example.com" // Fallback to example.com if no domain
      };
      onCalculate(updatedFormData);
      toast.success("Calculating your report", {
        description: "Processing your data to generate insights."
      });
    } else {
      // Show toast for validation errors
      toast.error("Please fix the errors before continuing", {
        description: "Some required information is missing or invalid."
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
    // The callback is handled in the AuthCallback component
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setDomainSelected(true);
    
    // Update form data with selected domain
    setFormData(prev => ({
      ...prev,
      domain
    }));
    
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

  // Only show manual traffic fields if Google Analytics connection failed or there's an API error
  const showManualTrafficFields = !!apiError || connectionFailed;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-center">
              Calculate Your Missing Lead Opportunity
            </CardTitle>
            <CardDescription className="text-center">
              Connect to Google Analytics and discover how many leads you're missing
            </CardDescription>
          </div>
          {onReset && (
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
              type="button"
            >
              <RefreshCw size={16} />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Connection Status Banner - Always shown at the top */}
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            {isGAConnected && !apiError && !selectedDomain && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="domain-select" className="text-lg">Select Website Domain</Label>
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
                  </>
                )}
                
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1 text-accent" />
                  We'll analyze this domain's traffic data from Google Analytics
                </p>
              </div>
            )}
            
            {errors.googleAnalytics && !apiError && (
              <div className="flex items-center justify-center text-sm text-red-600 mt-2 bg-white p-2 rounded">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>{errors.googleAnalytics}</p>
              </div>
            )}
          </div>
          
          {/* Show manual fields if API error, connection failed, or user clicked "Enter Manually" */}
          {showManualTrafficFields && (
            <>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="organicTrafficManual" className="text-lg">Monthly Organic Visitors</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox 
                      id="isUnsureOrganic" 
                      checked={formData.isUnsureOrganic}
                      onCheckedChange={(checked) => {
                        // Fix: Ensure we're passing a boolean to the state setter
                        handleChange("isUnsureOrganic", checked === true);
                      }}
                    />
                    <label htmlFor="isUnsureOrganic" className="text-sm text-gray-400 cursor-pointer">
                      I'm not sure (we'll try to fetch this data for you)
                    </label>
                  </div>
                </div>
                
                <Input
                  id="organicTrafficManual"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.isUnsureOrganic ? "" : formData.organicTrafficManual}
                  onChange={(e) => handleChange("organicTrafficManual", parseInt(e.target.value) || 0)}
                  className={errors.organicTrafficManual ? "border-red-300" : ""}
                  disabled={formData.isUnsureOrganic}
                />
                {errors.organicTrafficManual ? (
                  <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <p>{errors.organicTrafficManual}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 text-accent" />
                    This is your estimated monthly organic search traffic
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label htmlFor="monthlyVisitors" className="text-lg">Monthly Paid Visitors</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox 
                      id="isUnsurePaid" 
                      checked={formData.isUnsurePaid}
                      onCheckedChange={(checked) => {
                        // Fix: Ensure we're passing a boolean to the state setter
                        handleChange("isUnsurePaid", checked === true);
                      }}
                    />
                    <label htmlFor="isUnsurePaid" className="text-sm text-gray-400 cursor-pointer">
                      I'm not sure (enter 0 if you don't run paid campaigns)
                    </label>
                  </div>
                </div>
                
                <Input
                  id="monthlyVisitors"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={formData.isUnsurePaid ? "" : formData.monthlyVisitors}
                  onChange={(e) => handleChange("monthlyVisitors", parseInt(e.target.value) || 0)}
                  className={errors.monthlyVisitors ? "border-red-300" : ""}
                  disabled={formData.isUnsurePaid}
                />
                {errors.monthlyVisitors ? (
                  <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <p>{errors.monthlyVisitors}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-1 flex items-center">
                    <Info className="h-3 w-3 mr-1 text-accent" />
                    This is your estimated monthly paid traffic from all sources
                  </p>
                )}
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="avgTransactionValue" className="text-lg">Average Transaction Value ($)</Label>
            <Input
              id="avgTransactionValue"
              type="number"
              min="0"
              placeholder="0"
              value={formData.avgTransactionValue}
              onChange={(e) => handleChange("avgTransactionValue", parseInt(e.target.value) || 0)}
              className={errors.avgTransactionValue ? "border-red-300" : ""}
            />
            {errors.avgTransactionValue && (
              <div className="flex items-center text-sm text-red-600 mt-1 bg-white p-1 rounded">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>{errors.avgTransactionValue}</p>
              </div>
            )}
            <div className="flex items-start gap-2 mt-2 bg-secondary/50 p-3 rounded-lg border border-border">
              <DollarSign className="h-16 w-16 text-accent mt-0.5" /> {/* Increased icon size to 5x */}
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">What is Average Transaction Value?</span> This is how much money your business makes from a typical sale. If you sell products, it's the average order value. If you provide services, it's your average contract or project value.
              </p>
            </div>
          </div>
          
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
                <Info className="h-16 w-16 text-accent" /> {/* Increased icon size to 5x */}
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">How We Calculate Results</h3>
                <p className="text-sm text-gray-400">
                  We analyze both your organic traffic and your paid traffic (from Google Analytics or your input) to identify 20% of total visitors that could be converted into leads, with 1% of those leads becoming sales.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            {onReset && (
              <Button 
                type="button" 
                variant="outline"
                className="flex items-center gap-2 w-1/4 border-accent text-accent hover:bg-accent/10"
                onClick={onReset}
              >
                <RefreshCw size={16} />
                Restart
              </Button>
            )}
            
            <Button 
              type="submit" 
              className={`${onReset ? 'w-3/4' : 'w-full'} gradient-bg text-xl py-6`}
              disabled={isCalculating || !canCalculate}
            >
              {isCalculating ? "Processing..." : "Calculate My Missing Leads"}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-2">
            We identify 20% of your combined organic and paid traffic
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCalculatorForm;
