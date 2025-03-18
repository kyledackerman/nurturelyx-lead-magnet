
import { FormData } from "@/types/report";
import { useFormState } from "@/hooks/calculator/useFormState";
import { useFormValidation } from "@/hooks/calculator/useFormValidation";
import { useProxyConnection } from "@/hooks/calculator/useProxyConnection";
import { useEffect } from "react";

export function useLeadCalculatorForm(initialData?: FormData | null, apiError?: string | null) {
  // Use our specialized hooks
  const {
    formData,
    showTrafficFields,
    handleChange,
    setShowTrafficFields,
    resetForm
  } = useFormState(initialData, apiError);

  const {
    errors,
    canCalculate,
    validateForm,
    clearFieldError,
    setErrors,
    setCanCalculate
  } = useFormValidation(formData, showTrafficFields);

  const {
    proxyConnected,
    isUsingRailway,
    connectionError,
    isCheckingConnection,
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
  };

  // ALWAYS show traffic fields if there are connection issues or API errors
  const shouldShowTrafficFields = showTrafficFields || !proxyConnected || !!connectionError || !!apiError;
  
  // Use useEffect to handle traffic fields visibility based on connection status
  useEffect(() => {
    const connectionIssue = !proxyConnected || !!connectionError || !!apiError;
    
    if ((connectionIssue && !showTrafficFields) || 
        (!connectionIssue && showTrafficFields && !formData.isUnsureOrganic)) {
      setShowTrafficFields(connectionIssue);
    }
  }, [proxyConnected, connectionError, apiError, showTrafficFields, setShowTrafficFields, formData.isUnsureOrganic]);

  return {
    // Form state
    formData,
    showTrafficFields: shouldShowTrafficFields, // Always use computed value
    
    // Form validation
    errors,
    canCalculate,
    
    // Connection status
    proxyConnected,
    isUsingRailway,
    isCheckingConnection,
    connectionError,
    retryConnection,
    
    // Methods
    handleChange: handleFormChange,
    validateForm,
    setCanCalculate,
    setShowTrafficFields,
    resetForm: resetFormCompletely
  };
}
