
import { MonthlyRevenueData } from "@/services/apiService";

export interface FormData {
  domain: string;
  monthlyVisitors: number;
  organicTrafficManual?: number;
  isUnsureOrganic?: boolean;
  isUnsurePaid?: boolean;
  avgTransactionValue: number;
}

export interface ApiData {
  organicKeywords: number;
  organicTraffic: number;
  domainPower: number;
  backlinks: number;
  dataSource: 'api' | 'manual' | 'both' | 'fallback';
}

export interface ReportData extends FormData, ApiData {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: MonthlyRevenueData[];
}
