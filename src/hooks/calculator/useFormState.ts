
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";

// Default empty form state
export const DEFAULT_FORM_STATE: FormData = {
  domain: "",
  monthlyVisitors: 0,
  organicTrafficManual: 0,
  isUnsureOrganic: false,
  isUnsurePaid: false,
  avgTransactionValue: 0,
};

export function useFormState(initialData?: FormData | null, apiError?: string | null) {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_STATE);
  const [showTrafficFields, setShowTrafficFields] = useState<boolean>(false);

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Show traffic fields ONLY when API error is present, not on initial load
  useEffect(() => {
    if (apiError) {
      setShowTrafficFields(true);
    }
  }, [apiError]);

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setShowTrafficFields(false);
  };

  return {
    formData,
    showTrafficFields,
    setFormData,
    handleChange,
    setShowTrafficFields,
    resetForm
  };
}
