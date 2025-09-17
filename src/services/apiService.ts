
import { ApiData, MonthlyRevenueData } from "@/types/report";
import { toast } from "sonner";

// Re-export the SpyFu URL function
export { getSpyFuUrl } from "./api/spyfuConfig";

// Calculate report metrics based on both organic and paid traffic
export const calculateReportMetrics = (
  paidTraffic: number,
  avgTransactionValue: number,
  organicTraffic: number,
  apiPaidTraffic: number,
  monthlyApiData?: MonthlyRevenueData[],
  isAPiData?: boolean
): {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: MonthlyRevenueData[];
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

  // Generate 6 months of historical data with 20% overall growth
  const today = new Date();
  const monthlyRevenueData: MonthlyRevenueData[] = [];

  // Calculate base values and growth factors
  const currentVisitors = totalTraffic;
  const growthRatio = Math.pow(0.8, 1 / 5); // To achieve 20% decline from current to 6 months ago

  if (isAPiData && monthlyApiData.length > 0) {
    monthlyApiData.map((row, index) => {
      // Use actual visitor count from API data instead of applying growth factors
      const monthTotalVisitors = row.visitors;

      // Calculate derived metrics based on actual visitor data
      const monthLeads = Math.floor(
        monthTotalVisitors * visitorIdentificationRate
      );
      const monthSales = Math.floor(monthLeads * salesConversionRate);
      const monthRevenue = monthSales * avgTransactionValue;

      monthlyRevenueData.push({
        month: row.month,
        year: row.year,
        visitors: row.visitors,
        organicVisitors: row.organicVisitors,
        paidVisitors: row.paidVisitors,
        leads: monthLeads,
        missedLeads: monthLeads,
        sales: monthSales,
        lostSales: monthSales,
        revenueLost: monthRevenue,
        lostRevenue: monthRevenue
      });
    });
  } else {
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = monthDate.toLocaleString("default", { month: "short" });
      const year = monthDate.getFullYear();

      // Calculate growth factor for this month (earlier months have lower values)
      const monthGrowthFactor = Math.pow(growthRatio, i);

      // Add a little randomness to the data for each month (95-105% variation)
      const randomVariation = 0.95 + Math.random() * 0.1;

      // Apply growth factor and random variation
      const monthTotalVisitors = Math.floor(
        currentVisitors * monthGrowthFactor * randomVariation
      );

      // Split between organic and paid with some variation
      const organicRatio = Math.random() * 0.1 + 0.65; // Between 65-75% organic
      const monthOrganic = Math.floor(monthTotalVisitors * organicRatio);
      const monthPaid = monthTotalVisitors - monthOrganic;

      // Calculate derived metrics
      const monthLeads = Math.floor(
        monthTotalVisitors * visitorIdentificationRate
      );
      const monthSales = Math.floor(monthLeads * salesConversionRate);
      const monthRevenue = monthSales * avgTransactionValue;

      monthlyRevenueData.push({
        month,
        year,
        visitors: monthTotalVisitors,
        organicVisitors: monthOrganic,
        paidVisitors: monthPaid,
        leads: monthLeads,
        missedLeads: monthLeads,
        sales: monthSales,
        lostSales: monthSales,
        revenueLost: monthRevenue,
        lostRevenue: monthRevenue
      });
    }
  }

  return {
    missedLeads,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
    monthlyRevenueData,
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
