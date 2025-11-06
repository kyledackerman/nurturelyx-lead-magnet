export interface SalesCallInputs {
  callsPerPeriod: number;
  period: 'day' | 'week' | 'month';
  avgCallDuration: number; // minutes
  hourlyRate: number;
  conversionRate: number; // percentage
  avgDealValue: number;
  numberOfReps: number;
}

export interface SalesCallMetrics {
  monthlyCallsPerRep: number;
  totalMonthlyCalls: number;
  hoursPerMonth: number;
  costOfTime: number;
  conversions: number;
  revenue: number;
  netProfit: number;
  roi: number;
  costPerConversion: number;
  revenuePerHour: number;
  breakEvenCalls: number;
  annualProjection: {
    calls: number;
    revenue: number;
    profit: number;
  };
}
