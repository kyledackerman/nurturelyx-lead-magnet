
import { MonthlyRevenueData } from "@/services/apiService";

export interface FormData {
  domain: string;
  monthlyVisitors: number;
  avgTransactionValue: number;
  industry: string;
}

export interface ApiData {
  organicKeywords: number;
  organicTraffic: number;
  domainPower: number;
  backlinks: number;
}

export interface ReportData extends FormData, ApiData {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: MonthlyRevenueData[];
}

export const industries = [
  "E-commerce",
  "SaaS",
  "Finance",
  "Healthcare",
  "Real Estate",
  "Education",
  "Technology",
  "Travel",
  "Manufacturing",
  "Professional Services",
  "Retail",
  "Media & Entertainment"
];
