
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
    resetConnectionState
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

  return {
    // Form state
    formData,
    showTrafficFields,
    
    // Form validation
    errors,
    canCalculate,
    
    // Connection status
    proxyConnected,
    isUsingRailway,
    
    // Methods
    handleChange: handleFormChange,
    validateForm,
    setCanCalculate,
    setShowTrafficFields,
    resetForm: resetFormCompletely
  };
}
