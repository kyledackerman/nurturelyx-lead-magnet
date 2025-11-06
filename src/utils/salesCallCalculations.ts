import { SalesCallInputs, SalesCallMetrics } from "@/types/salesCall";

export function calculateSalesCallROI(inputs: SalesCallInputs): SalesCallMetrics {
  // Convert to monthly calls
  let monthlyCallsPerRep: number;
  switch (inputs.period) {
    case 'day':
      monthlyCallsPerRep = inputs.callsPerPeriod * 22; // ~22 working days per month
      break;
    case 'week':
      monthlyCallsPerRep = inputs.callsPerPeriod * 4.33; // ~4.33 weeks per month
      break;
    case 'month':
      monthlyCallsPerRep = inputs.callsPerPeriod;
      break;
  }

  const totalMonthlyCalls = monthlyCallsPerRep * inputs.numberOfReps;
  const hoursPerMonth = (totalMonthlyCalls * inputs.avgCallDuration) / 60;
  const costOfTime = hoursPerMonth * inputs.hourlyRate;
  const conversions = totalMonthlyCalls * (inputs.conversionRate / 100);
  const revenue = conversions * inputs.avgDealValue;
  const netProfit = revenue - costOfTime;
  const roi = costOfTime > 0 ? ((revenue - costOfTime) / costOfTime) * 100 : 0;
  const costPerConversion = conversions > 0 ? costOfTime / conversions : 0;
  const revenuePerHour = hoursPerMonth > 0 ? revenue / hoursPerMonth : 0;
  const breakEvenCalls = inputs.avgDealValue > 0 
    ? (inputs.hourlyRate * (inputs.avgCallDuration / 60)) / (inputs.avgDealValue * (inputs.conversionRate / 100))
    : 0;

  return {
    monthlyCallsPerRep,
    totalMonthlyCalls,
    hoursPerMonth,
    costOfTime,
    conversions,
    revenue,
    netProfit,
    roi,
    costPerConversion,
    revenuePerHour,
    breakEvenCalls,
    annualProjection: {
      calls: totalMonthlyCalls * 12,
      revenue: revenue * 12,
      profit: netProfit * 12
    }
  };
}
