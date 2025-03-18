import { useState, useEffect, useCallback } from "react";
import { useFormState } from "@/hooks/calculator/useFormState";
import { fetchDomainData } from "@/services/spyfuService";
import { useProxyConnection } from "@/hooks/calculator/useProxyConnection";
import { toast } from "sonner";
import { ApiData, FormData } from "@/types/report";
import { calculateReportMetrics } from "@/services/apiService";
import { useFormValidation } from "@/hooks/calculator/useFormValidation";

export function useLeadCalculatorForm(initialData?: FormData | null) {
  // Form state and management
  const {
    formData,
    showTrafficFields,
    setFormData,
    handleChange,
    setShowTrafficFields,
    resetForm,
  } = useFormState(initialData);

  // State for API data and report metrics
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [reportMetrics, setReportMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Connection and API state
  const {
    proxyConnected,
    isUsingRailway,
    connectionError,
    isCheckingConnection,
    diagnosticInfo,
    resetConnectionState,
    retryConnection
  } = useProxyConnection();

  // Form validation and submission state
  const {
    isValidDomain,
    isValidAvgTransactionValue,
    domainError,
    avgTransactionValueError,
    validateForm,
    isDomainValid,
    isAvgTransactionValueValid,
    setDomainError,
    setAvgTransactionValueError
  } = useFormValidation(formData, validateAndSubmit);

  // When there's an API error or connection error, prepare to show traffic fields
  const [shouldShowTrafficFields, setShouldShowTrafficFields] = useState<boolean>(false);
  const apiError = connectionError ? connectionError : null;

  // IMPORTANT: Never show traffic fields regardless of errors
  useEffect(() => {
    setShouldShowTrafficFields(false);
    setShowTrafficFields(false); // Pass false here since the function expects a boolean argument
  }, [connectionError, apiError, setShowTrafficFields]);

  // Function to validate the form and submit data
  const validateAndSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiData(null);
    setReportMetrics(null);

    try {
      const fetchedData = await fetchDomainData(
        formData.domain,
        formData.organicTrafficManual,
        formData.isUnsureOrganic
      );

      setApiData(fetchedData);

      const calculatedMetrics = calculateReportMetrics(
        formData.monthlyVisitors,
        formData.avgTransactionValue,
        fetchedData.organicTraffic,
        fetchedData.paidTraffic
      );

      setReportMetrics(calculatedMetrics);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to generate report. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm]);

  return {
    formData,
    showTrafficFields,
    apiData,
    reportMetrics,
    isLoading,
    handleChange,
    validateAndSubmit,
    resetForm,
    proxyConnected,
    isUsingRailway,
    connectionError,
    isCheckingConnection,
    diagnosticInfo,
    resetConnectionState,
    retryConnection,
    isValidDomain,
    isValidAvgTransactionValue,
    domainError,
    avgTransactionValueError,
    isDomainValid,
    isAvgTransactionValueValid,
    setDomainError,
    setAvgTransactionValueError,
    setShowTrafficFields
  };
}
