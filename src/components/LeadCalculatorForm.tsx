
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData, industries } from "@/types/report";

interface LeadCalculatorFormProps {
  onCalculate: (data: FormData) => void;
  isCalculating: boolean;
}

const LeadCalculatorForm = ({ onCalculate, isCalculating }: LeadCalculatorFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    domain: "",
    monthlyVisitors: 1000,
    avgTransactionValue: 500,
    industry: "SaaS",
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
    
    if (!formData.monthlyVisitors || formData.monthlyVisitors <= 0) {
      newErrors.monthlyVisitors = "Please enter a valid number of monthly visitors";
    }
    
    if (!formData.avgTransactionValue || formData.avgTransactionValue <= 0) {
      newErrors.avgTransactionValue = "Please enter a valid transaction value";
    }
    
    if (!formData.industry) {
      newErrors.industry = "Please select an industry";
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
            {errors.domain && <p className="text-sm text-red-500">{errors.domain}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyVisitors">Estimated Monthly Paid Visitors</Label>
            <Input
              id="monthlyVisitors"
              type="number"
              min="1"
              placeholder="1000"
              value={formData.monthlyVisitors}
              onChange={(e) => handleChange("monthlyVisitors", parseInt(e.target.value) || 0)}
              className={errors.monthlyVisitors ? "border-red-500" : ""}
            />
            {errors.monthlyVisitors && <p className="text-sm text-red-500">{errors.monthlyVisitors}</p>}
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
            {errors.avgTransactionValue && <p className="text-sm text-red-500">{errors.avgTransactionValue}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleChange("industry", value)}
            >
              <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-bg"
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Calculate My Missing Leads"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadCalculatorForm;
