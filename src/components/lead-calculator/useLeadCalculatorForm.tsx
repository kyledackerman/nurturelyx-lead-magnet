
import { FormData } from "@/types/report";
import { useFormState } from "@/hooks/calculator/useFormState";
import { useFormValidation } from "@/hooks/calculator/useFormValidation";
import { useProxyConnection } from "@/hooks/calculator/useProxyConnection";

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

  // If we have connection issues, always show manual traffic fields
  const shouldShowTrafficFields = showTrafficFields || !proxyConnected || !!connectionError || !!apiError;
  
  // Update traffic fields visibility when connection status changes
  if (((!proxyConnected || !!connectionError) && !showTrafficFields) || 
      (proxyConnected && !connectionError && !apiError && showTrafficFields)) {
    setTimeout(() => {
      setShowTrafficFields(!proxyConnected || !!connectionError || !!apiError);
    }, 0);
  }

  return {
    // Form state
    formData,
    showTrafficFields: shouldShowTrafficFields, // Use computed value
    
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
