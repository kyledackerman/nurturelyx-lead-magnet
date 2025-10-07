import { ReportData, MonthlyRevenueData } from "@/types/report";

/**
 * Find the month with the highest missed leads
 */
export function findPeakLeadLossMonth(monthlyRevenueData: MonthlyRevenueData[]) {
  if (!monthlyRevenueData || monthlyRevenueData.length === 0) {
    return null;
  }
  
  const peak = monthlyRevenueData.reduce((max, current) => {
    return current.missedLeads > max.missedLeads ? current : max;
  });
  
  return {
    month: peak.month,
    year: peak.year,
    value: peak.missedLeads
  };
}

/**
 * Find the month with the highest revenue lost
 */
export function findPeakRevenueMonth(monthlyRevenueData: MonthlyRevenueData[]) {
  if (!monthlyRevenueData || monthlyRevenueData.length === 0) {
    return null;
  }
  
  const peak = monthlyRevenueData.reduce((max, current) => {
    return current.revenueLost > max.revenueLost ? current : max;
  });
  
  return {
    month: peak.month,
    year: peak.year,
    value: peak.revenueLost
  };
}

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
