
import { ApiData } from "@/types/report";

// In a real implementation, this would make an actual API call to SearchAtlas
export const fetchDomainData = async (domain: string, industry: string): Promise<ApiData> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock data based on domain length and industry
  // This is just for demo purposes - in a real app, this would be real API data
  const domainLength = domain.length;
  const industryFactor = getIndustryFactor(industry);
  
  return {
    organicKeywords: Math.floor(100 + (domainLength * 50 * industryFactor)),
    organicTraffic: Math.floor(500 + (domainLength * 200 * industryFactor)),
    domainPower: Math.min(95, Math.floor(40 + (domainLength * 2))),
    domainAuthority: Math.min(95, Math.floor(35 + (domainLength * 2.5))),
    domainRanking: Math.floor(10000 + (5000 * Math.random())),
    backlinks: Math.floor(100 + (domainLength * 100 * industryFactor))
  };
};

// Helper to generate different data based on industry
const getIndustryFactor = (industry: string): number => {
  const factors: Record<string, number> = {
    "E-commerce": 1.5,
    "SaaS": 2.0,
    "Finance": 1.8,
    "Healthcare": 1.3,
    "Real Estate": 1.2,
    "Education": 1.4,
    "Technology": 1.9,
    "Travel": 1.6,
    "Manufacturing": 1.1,
    "Professional Services": 1.3,
    "Retail": 1.4,
    "Media & Entertainment": 1.7
  };
  
  return factors[industry] || 1.0;
};

// Calculate report metrics
export const calculateReportMetrics = (
  monthlyVisitors: number,
  avgTransactionValue: number
): { missedLeads: number; monthlyRevenueLost: number; yearlyRevenueLost: number } => {
  const conversionRate = 0.2; // 20% capture rate
  const missedLeads = Math.floor(monthlyVisitors * conversionRate);
  const monthlyRevenueLost = missedLeads * avgTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;
  
  return {
    missedLeads,
    monthlyRevenueLost,
    yearlyRevenueLost
  };
};
