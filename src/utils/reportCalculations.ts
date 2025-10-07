import { ReportData, MonthlyRevenueData } from "@/types/report";

/**
 * Find the month with the highest missed leads
 */
export function findPeakLeadLossMonth(monthlyRevenueData: MonthlyRevenueData[] | undefined | null) {
  if (!monthlyRevenueData || !Array.isArray(monthlyRevenueData) || monthlyRevenueData.length === 0) {
    return null;
  }
  
  try {
    const peak = monthlyRevenueData.reduce((max, current) => {
      const currentLeads = current?.missedLeads || 0;
      const maxLeads = max?.missedLeads || 0;
      return currentLeads > maxLeads ? current : max;
    });
    
    if (!peak || !peak.month) {
      return null;
    }
    
    return {
      month: peak.month,
      year: peak.year,
      value: peak.missedLeads || 0
    };
  } catch (error) {
    console.error('Error finding peak lead loss month:', error);
    return null;
  }
}

/**
 * Find the month with the highest revenue lost
 */
export function findPeakRevenueMonth(monthlyRevenueData: MonthlyRevenueData[] | undefined | null) {
  if (!monthlyRevenueData || !Array.isArray(monthlyRevenueData) || monthlyRevenueData.length === 0) {
    return null;
  }
  
  try {
    const peak = monthlyRevenueData.reduce((max, current) => {
      const currentRevenue = current?.revenueLost || 0;
      const maxRevenue = max?.revenueLost || 0;
      return currentRevenue > maxRevenue ? current : max;
    });
    
    if (!peak || !peak.month) {
      return null;
    }
    
    return {
      month: peak.month,
      year: peak.year,
      value: peak.revenueLost || 0
    };
  } catch (error) {
    console.error('Error finding peak revenue month:', error);
    return null;
  }
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
