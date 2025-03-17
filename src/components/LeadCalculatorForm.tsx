
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormData } from "@/types/report";
import { AlertCircle, Info, DollarSign } from "lucide-react";

interface LeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  isCalculating: boolean;
}

const LeadCalculatorForm = ({ onCalculate, isCalculating }: LeadCalculatorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    monthlyVisitors: 1000,
    avgTransactionValue: 500,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user fixes the field
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
    
    if (formData.monthlyVisitors < 0) {
      newErrors.monthlyVisitors = "Please enter a valid number of monthly visitors";
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Calculate Your Missing Lead Opportunity
        </CardTitle>
        <CardDescription className="text-center">
          Enter your website details to discover how many leads you're missing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="domain">Website Domain</Label>
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
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <Info className="h-3 w-3 mr-1 text-accent" />
              We'll fetch your organic traffic data from SearchAtlas API
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyVisitors">Estimated Monthly Paid Visitors</Label>
            <Input
              id="monthlyVisitors"
              type="number"
              min="0"
              placeholder="1000"
              value={formData.monthlyVisitors}
              onChange={(e) => handleChange("monthlyVisitors", parseInt(e.target.value) || 0)}
              className={errors.monthlyVisitors ? "border-red-500" : ""}
            />
            {errors.monthlyVisitors ? (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>{errors.monthlyVisitors}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Info className="h-3 w-3 mr-1 text-accent" />
                Enter 0 if you don't have paid traffic - we'll use organic data only
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avgTransactionValue">Average Transaction Value ($)</Label>
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
              <p className="text-xs text-gray-400">
                <span className="font-medium text-gray-300">What is Average Transaction Value?</span> This is how much money your business makes from a typical sale. If you sell products, it's the average order value. If you provide services, it's your average contract or project value.
              </p>
            </div>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded-lg border border-border mt-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-accent/10 p-1 rounded-full">
                <Info className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-1">How We Calculate Results</h3>
                <p className="text-xs text-gray-400">
                  We analyze both your organic traffic (from SearchAtlas API) and your paid traffic (entered above) to identify 20% of total visitors that could be converted into leads, with 1% of those leads becoming sales.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-bg"
            disabled={isCalculating}
          >
            {isCalculating ? "Connecting to API..." : "Calculate My Missing Leads"}
          </Button>
          
          <p className="text-xs text-center text-gray-400 mt-2">
            We identify 20% of both your organic and paid traffic
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCalculatorForm;
