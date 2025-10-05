
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";
import { cleanDomain } from "@/services/api/spyfuConfig";

// Default empty form state
export const DEFAULT_FORM_STATE: FormData = {
  domain: "",
  monthlyVisitors: 0,
  organicTrafficManual: 0,
  isUnsureOrganic: true,
  isUnsurePaid: true,
  avgTransactionValue: 0,
};

export function useFormState(initialData?: FormData | null, apiError?: string | null) {
  const [formData, setFormData] = useState<FormData>(initialData || DEFAULT_FORM_STATE);
  // Always keep traffic fields hidden
  const [showTrafficFields, setShowTrafficFields] = useState<boolean>(false);

  // Reset to initial data when provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Never show traffic fields, regardless of API errors
  useEffect(() => {
    setShowTrafficFields(false);
  }, [apiError]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    // Clean domain to strip http(s), www, paths
    const finalValue = field === "domain" && typeof value === "string" 
      ? cleanDomain(value) 
      : value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  // Complete reset function that resets everything to default
  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setShowTrafficFields(false);
  };

  return {
    formData,
    showTrafficFields: false, // Always return false
    setFormData,
    handleChange,
    setShowTrafficFields, // This is the React state setter function that accepts a boolean
    resetForm
  };
}
