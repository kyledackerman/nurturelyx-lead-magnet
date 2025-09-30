
import { useState, useEffect } from "react";
import { FormData } from "@/types/report";
import { calculatorFormSchema, cleanAndValidateDomain } from "@/lib/validation";
import { z } from "zod";

export function useFormValidation(formData: FormData, showTrafficFields: boolean) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [canCalculate, setCanCalculate] = useState<boolean>(true);

  // Clear error for a specific field
  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate the form using Zod schema
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    try {
      // Clean and validate domain
      const cleanedDomain = cleanAndValidateDomain(formData.domain);
      
      // Validate using Zod schema
      calculatorFormSchema.parse({
        domain: cleanedDomain,
        monthlyVisitors: formData.monthlyVisitors,
        organicTrafficManual: formData.organicTrafficManual,
        avgTransactionValue: formData.avgTransactionValue,
        isUnsurePaid: formData.isUnsurePaid,
        isUnsureOrganic: formData.isUnsureOrganic,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
      } else {
        newErrors.domain = "An unexpected error occurred during validation";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update canCalculate based on validation status
  useEffect(() => {
    // Simplified validation - only require domain and transaction value
    const isValid = Boolean(
      formData.domain.trim() && 
      formData.avgTransactionValue > 0
    );
    
    console.log('Form validation state:', {
      domain: formData.domain.trim(),
      avgTransactionValue: formData.avgTransactionValue,
      isValid,
      errors: Object.keys(errors)
    });
    
    setCanCalculate(isValid);
  }, [formData, showTrafficFields, errors]);

  return {
    errors,
    canCalculate,
    validateForm,
    clearFieldError,
    setErrors,
    setCanCalculate
  };
}
