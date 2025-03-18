
import { FormData } from "@/types/report";
import { useFormState } from "@/hooks/calculator/useFormState";
import { useFormValidation } from "@/hooks/calculator/useFormValidation";
import { useProxyConnection } from "@/hooks/calculator/useProxyConnection";
import { useEffect, useState } from "react";

export function useLeadCalculatorForm(initialData?: FormData | null, apiError?: string | null) {
  // Use our specialized hooks
  const {
    formData,
    showTrafficFields: formStateShowTrafficFields,
    handleChange,
    setShowTrafficFields,
    resetForm
  } = useFormState(initialData, apiError);

  // Explicitly track traffic field visibility in this component
  const [shouldShowTrafficFields, setShouldShowTrafficFields] = useState<boolean>(false);

  const {
    errors,
    canCalculate,
    validateForm,
    clearFieldError,
    setErrors,
    setCanCalculate
  } = useFormValidation(formData, shouldShowTrafficFields);

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
  
  // IMPORTANT: Only show traffic fields when there's a connection or API error
  // We use useEffect to avoid showing fields during initial render
  useEffect(() => {
    const hasError = Boolean(connectionError || apiError);
    
    if (hasError) {
      console.log("Error detected, showing traffic fields:", { connectionError, apiError });
      setShouldShowTrafficFields(true);
      setShowTrafficFields(true);
    } else {
      // Default to always hiding traffic fields unless there's an error
      setShouldShowTrafficFields(false);
      setShowTrafficFields(false);
    }
  }, [connectionError, apiError, setShowTrafficFields]);

  return {
    // Form state
    formData,
    showTrafficFields: shouldShowTrafficFields, // Use our explicit state, not from formState
    
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
    setShowTrafficFields: setShouldShowTrafficFields, // Use our explicit setter
    resetForm: resetFormCompletely
  };
}
