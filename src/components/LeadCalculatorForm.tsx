
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormData } from "@/types/report";
import { AlertCircle, Info, DollarSign, RefreshCw, BarChart } from "lucide-react";
import { initiateGoogleAnalyticsAuth } from "@/services/apiService";

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
    avgTransactionValue: 500,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isGAConnected, setIsGAConnected] = useState<boolean>(false);

  useEffect(() => {
    // Check if we have a Google Analytics token in session storage
    const hasToken = !!sessionStorage.getItem('google_analytics_token');
    setIsGAConnected(hasToken);
    
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
    
    if (!formData.domain) {
      newErrors.domain = "Domain is required";
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = "Please enter a valid domain (e.g., example.com)";
    }
    
    if (apiError && formData.isUnsurePaid === false && (formData.monthlyVisitors === undefined || formData.monthlyVisitors < 0)) {
      newErrors.monthlyVisitors = "Please enter a valid number of monthly paid visitors";
    }
    
    if (apiError && formData.isUnsureOrganic === false && (formData.organicTrafficManual === undefined || formData.organicTrafficManual < 0)) {
      newErrors.organicTrafficManual = "Please enter a valid number of monthly organic visitors";
    }
    
    if (!formData.avgTransactionValue || formData.avgTransactionValue <= 0) {
      newErrors.avgTransactionValue = "Please enter a valid transaction value";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onCalculate(formData);
    }
  };
  
  const handleConnectGA = () => {
    initiateGoogleAnalyticsAuth();
    // In a real implementation, you would have a callback that sets isGAConnected to true
    // For now, we'll simulate a connection after 2 seconds
    setTimeout(() => {
      setIsGAConnected(true);
    }, 2000);
  };

  const showManualTrafficFields = !!apiError || !isGAConnected;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-center">
              Calculate Your Missing Lead Opportunity
            </CardTitle>
            <CardDescription className="text-center">
              Enter your website details to discover how many leads you're missing
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-lg">Website Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={formData.domain}
              onChange={(e) => handleChange("domain", e.target.value)}
              className={errors.domain ? "border-red-500" : ""}
            />
            {errors.domain && (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>{errors.domain}</p>
              </div>
            )}
            
            <div className="mt-3 flex flex-col">
              <Button 
                type="button" 
                variant={isGAConnected ? "outline" : "default"} 
                className={`flex items-center gap-2 mt-2 ${isGAConnected ? 'border-green-500 text-green-500' : 'gradient-bg'}`}
                onClick={handleConnectGA}
                disabled={isGAConnected}
              >
                <BarChart className="h-4 w-4" />
                {isGAConnected ? 'Connected to Google Analytics' : 'Connect to Google Analytics'}
              </Button>
              
              {isGAConnected ? (
                <p className="text-sm text-green-500 mt-2 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  We'll fetch your organic and paid traffic data from Google Analytics
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-2 flex items-center">
                  <Info className="h-3 w-3 mr-1 text-accent" />
                  Connect to Google Analytics for accurate organic and paid traffic data
                </p>
              )}
            </div>
          </div>
          
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
                  className={errors.organicTrafficManual ? "border-red-500" : ""}
                  disabled={formData.isUnsureOrganic}
                />
                {errors.organicTrafficManual ? (
                  <div className="flex items-center text-sm text-red-500 mt-1">
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
                  className={errors.monthlyVisitors ? "border-red-500" : ""}
                  disabled={formData.isUnsurePaid}
                />
                {errors.monthlyVisitors ? (
                  <div className="flex items-center text-sm text-red-500 mt-1">
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
              min="1"
              placeholder="500"
              value={formData.avgTransactionValue}
              onChange={(e) => handleChange("avgTransactionValue", parseInt(e.target.value) || 0)}
              className={errors.avgTransactionValue ? "border-red-500" : ""}
            />
            {errors.avgTransactionValue && (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>{errors.avgTransactionValue}</p>
              </div>
            )}
            <div className="flex items-start gap-2 mt-2 bg-secondary/50 p-3 rounded-lg border border-border">
              <DollarSign className="h-4 w-4 text-accent mt-0.5" />
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">What is Average Transaction Value?</span> This is how much money your business makes from a typical sale. If you sell products, it's the average order value. If you provide services, it's your average contract or project value.
              </p>
            </div>
          </div>
          
          {apiError && (
            <div className="bg-red-700/30 border-2 border-red-500 rounded-lg p-4 text-sm shadow-lg">
              <h3 className="font-semibold text-red-300 flex items-center mb-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                API Connection Error
              </h3>
              <p className="text-white">
                We couldn't connect to the Google Analytics API to fetch your traffic data. Please enter your traffic numbers manually to continue.
              </p>
              <p className="text-gray-300 mt-2 text-xs">{apiError}</p>
            </div>
          )}
          
          <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-accent/10 p-1 rounded-full">
                <Info className="h-4 w-4 text-accent" />
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
              disabled={isCalculating}
            >
              {isCalculating ? "Connecting to API..." : "Calculate My Missing Leads"}
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
