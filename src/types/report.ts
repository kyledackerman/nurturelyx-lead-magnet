
export interface FormData {
  domain: string;
  monthlyVisitors?: number;
  organicTrafficManual?: number;
  isUnsureOrganic?: boolean;
  isUnsurePaid?: boolean;
  avgTransactionValue: number;
  // Add more fields as needed
}

export interface ReportData extends FormData, ApiData {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
  monthlyRevenueData: MonthlyRevenueData[];
  reportId?: string; // Add reportId for public sharing
  slug?: string; // Add slug for public sharing URLs
  industry?: string; // Industry categorization
  totalMissedLeads?: number; // For compatibility with report grid
  extracted_company_name?: string; // Extracted company name
  conversionRate?: number; // Lead-to-sale conversion rate (default 1%)
  personalized_use_cases?: string; // AI-generated use cases
}

export interface NewApiDataT {
  domain: string;
  dataSource: "api";
  monthlyRevenueData: {
    month: string;
    searchMonth: number;
    searchYear: number;
    averageOrganicRank: number;
    monthlyPaidClicks: number;
    averageAdRank: number;
    totalOrganicResults: number;
    monthlyBudget: number;
    monthlyOrganicValue: number;
    totalAdsPurchased: number;
    monthlyOrganicClicks: number;
    strength: number;
    totalInverseRank: number;
  }[];
}

export interface ApiData {
  organicTraffic: number;
  organicKeywords: number;
  domainPower: number;
  backlinks: number;
  paidTraffic: number; // Added paid traffic from Google Analytics
  dataSource: "api" | "manual" | "both" | "fallback";
  monthlyRevenueData: MonthlyRevenueData[];
}

export interface MonthlyRevenueData {
  month: string;
  year: number;
  visitors: number;
  organicVisitors: number;
  paidVisitors: number;
  leads: number;
  missedLeads: number;
  sales: number;
  lostSales: number;
  revenueLost: number;
  lostRevenue: number;
}

// Define public report data interface
export interface PublicReport {
  reportId: string;
  createdAt: string;
  data: ReportData;
  viewCount: number;
}
