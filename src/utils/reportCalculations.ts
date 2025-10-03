import { ReportData, MonthlyRevenueData } from "@/types/report";

/**
 * Recalculates all revenue-related metrics based on a new average transaction value
 */
export function recalculateReportMetrics(
  reportData: ReportData,
  newTransactionValue: number
): Partial<ReportData> {
  const oldTransactionValue = reportData.avgTransactionValue;
  
  // If the transaction value hasn't changed, return the original data
  if (oldTransactionValue === newTransactionValue) {
    return {};
  }

  // Calculate the ratio for adjusting revenue metrics
  const adjustmentRatio = newTransactionValue / oldTransactionValue;

  // Recalculate top-level metrics
  const estimatedSalesLost = reportData.estimatedSalesLost;
  const monthlyRevenueLost = estimatedSalesLost * newTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;

  // Recalculate monthly revenue data
  const updatedMonthlyRevenueData = reportData.monthlyRevenueData.map((monthData) => {
    // Recalculate revenue metrics for each month
    const lostRevenue = monthData.lostSales * newTransactionValue;
    
    return {
      ...monthData,
      revenueLost: lostRevenue,
      lostRevenue: lostRevenue, // Both fields represent the same value
    };
  });

  return {
    avgTransactionValue: newTransactionValue,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
    monthlyRevenueData: updatedMonthlyRevenueData,
  };
}
