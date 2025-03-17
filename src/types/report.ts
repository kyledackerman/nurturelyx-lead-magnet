
export interface FormData {
  domain: string;
  monthlyVisitors: number;
  organicTrafficManual?: number;
  isUnsureOrganic?: boolean;
  isUnsurePaid?: boolean;
  avgTransactionValue: number;
  // Add more fields as needed
}

export interface ApiData {
  organicTraffic: number;
  organicKeywords: number;
  domainPower: number;
  backlinks: number;
  paidTraffic?: number; // Added paid traffic from Google Analytics
  dataSource: 'api' | 'manual' | 'both' | 'fallback';
}

export interface ReportData extends FormData, ApiData {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: {
    month: string;
    year: number;
    visitors: number;
    organicVisitors: number;
    paidVisitors: number;
    leads: number;
    sales: number;
    revenueLost: number;
  }[];
}
