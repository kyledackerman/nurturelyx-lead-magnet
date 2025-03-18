
import { FormData } from "@/types/report";
import { useFormState } from "@/hooks/calculator/useFormState";
import { useFormValidation } from "@/hooks/calculator/useFormValidation";
import { useProxyConnection } from "@/hooks/calculator/useProxyConnection";
import { useEffect, useState } from "react";

export function useLeadCalculatorForm(initialData?: FormData | null, apiError?: string | null) {
  // Use our specialized hooks
  const {
    formData,
    handleChange,
    setShowTrafficFields,
    resetForm
  } = useFormState(initialData, apiError);

  // Always set traffic fields to false
  const [shouldShowTrafficFields, setShouldShowTrafficFields] = useState<boolean>(false);

  const {
    errors,
    canCalculate,
    validateForm,
    clearFieldError,
    setErrors,
    setCanCalculate
  } = useFormValidation(formData, false); // Always pass false here

  const {
    proxyConnected,
    isUsingRailway,
    connectionError,
    isCheckingConnection,
    diagnosticInfo,
    resetConnectionState,
    retryConnection
  } = useProxyConnection();

  // Enhanced handleChange that also clears related errors
  const handleFormChange = (field: keyof FormData, value: string | number | boolean) => {
    handleChange(field, value);
    clearFieldError(field);
  };

  // Enhanced reset that resets all component states
  const resetFormCompletely = () => {
    resetForm();
    setErrors({});
    resetConnectionState();
    setShouldShowTrafficFields(false);
  };
  
  // IMPORTANT: Never show traffic fields regardless of errors
  useEffect(() => {
    setShouldShowTrafficFields(false);
    setShowTrafficFields(false); // Pass false here since the function expects a boolean argument
  }, [connectionError, apiError, setShowTrafficFields]);

  return {
    // Form state
    formData,
    showTrafficFields: false, // Always return false
    
    // Form validation
    errors,
    canCalculate,
    
    // Connection status
    proxyConnected,
    isUsingRailway,
    isCheckingConnection,
    connectionError,
    diagnosticInfo,
    retryConnection,
    
    // Methods
    handleChange: handleFormChange,
    validateForm,
    setCanCalculate,
    setShowTrafficFields: () => {}, // Empty function
    resetForm: resetFormCompletely
  };
}
