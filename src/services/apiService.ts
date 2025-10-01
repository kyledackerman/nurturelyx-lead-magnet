
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

  let missedLeads = Math.floor(totalTraffic * visitorIdentificationRate);
  let estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
  let monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;
  let yearlyRevenueLost = monthlyRevenueLost * 12;

  // Generate 6 months of historical data with 20% overall growth
  const today = new Date();
  const monthlyRevenueData: MonthlyRevenueData[] = [];

  // Calculate base values and growth factors
  const currentVisitors = totalTraffic;
  const growthRatio = Math.pow(0.8, 1 / 5); // To achieve 20% decline from current to 6 months ago

  if (isAPiData && monthlyApiData && monthlyApiData.length > 0) {
    const rows = monthlyApiData;
    const reference = [...rows]
      .reverse()
      .find((r) => (r.visitors ?? ((r.organicVisitors ?? 0) + (r.paidVisitors ?? 0))) > 0) ?? rows[rows.length - 1];

    const refVisitors = reference
      ? (reference.visitors ?? ((reference.organicVisitors ?? 0) + (reference.paidVisitors ?? 0)))
      : 0;

    // Override headline metrics from reference month
    missedLeads = Math.floor(refVisitors * visitorIdentificationRate);
    estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
    monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;
    yearlyRevenueLost = monthlyRevenueLost * 12;

    // Rebuild monthly series directly from API rows
    monthlyRevenueData.length = 0; // clear
    rows.forEach((row) => {
      const totalVisitors = row.visitors ?? ((row.organicVisitors ?? 0) + (row.paidVisitors ?? 0));
      const leads = Math.floor(totalVisitors * visitorIdentificationRate);
      const sales = Math.floor(leads * salesConversionRate);
      const revenue = sales * avgTransactionValue;

      const organic = row.organicVisitors ?? Math.floor(totalVisitors * 0.7);
      const paid = row.paidVisitors ?? Math.max(0, totalVisitors - organic);

      monthlyRevenueData.push({
        month: row.month,
        year: row.year,
        visitors: totalVisitors,
        organicVisitors: organic,
        paidVisitors: paid,
        leads,
        missedLeads: leads,
        sales,
        lostSales: sales,
        revenueLost: revenue,
        lostRevenue: revenue,
      });
    });

    console.log(
      `Using API monthly series: ${rows.length} months; headline from ${reference?.month}/${reference?.year} visitors=${refVisitors}`
    );
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
        missedLeads: monthLeads, // Adding the missing property
        sales: monthSales,
        lostSales: monthSales, // Adding the missing property
        revenueLost: monthRevenue,
        lostRevenue: monthRevenue // Adding the missing property
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
