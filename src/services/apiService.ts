
import { ApiData } from "@/types/report";
import { toast } from "sonner";

// Re-export the SpyFu URL function
export { getSpyFuUrl } from "./api/spyfuConfig";

// Calculate report metrics based on both organic and paid traffic
export const calculateReportMetrics = (
  paidTraffic: number,
  avgTransactionValue: number,
  organicTraffic: number,
  apiPaidTraffic: number
): {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
} => {
  // Use the API paid traffic value if it exists, otherwise use the manually entered value
  const finalPaidTraffic = apiPaidTraffic > 0 ? apiPaidTraffic : paidTraffic;

  // Add organic traffic to paid visitors for total traffic
  const totalTraffic = finalPaidTraffic + organicTraffic;
  const visitorIdentificationRate = 0.2; // 20% visitor identification rate
  const salesConversionRate = 0.01; // 1% lead-to-sale conversion rate (1 per 100)

  const missedLeads = Math.floor(totalTraffic * visitorIdentificationRate);
  const estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
  const monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;

  return {
    missedLeads,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
  };
};

import { reportService } from './reportService';

// Export report service functions
export { reportService };

// This function will be defined in domainDataService.ts and imported by users
export const fetchDomainData = async (
  domain: string,
  organicTrafficManual?: number,
  isUnsureOrganic?: boolean
): Promise<ApiData> => {
  // We'll redirect this function to the implementation in spyfuService
  throw new Error(
    "This function should not be called directly. Import from spyfuService instead."
  );
};
