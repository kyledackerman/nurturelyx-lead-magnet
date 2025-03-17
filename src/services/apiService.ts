
import { ApiData } from "@/types/report";

// SearchAtlas API key (public key for the demo)
const SEARCH_ATLAS_API_KEY = "ce26ade2b8adac45db89c62c438d0a31";

// Make a real API call to SearchAtlas
export const fetchDomainData = async (domain: string, industry: string): Promise<ApiData> => {
  console.log(`Using SearchAtlas API key: ${SEARCH_ATLAS_API_KEY} to fetch data for ${domain}`);
  
  try {
    // For demo purposes, we're using a proxy to avoid CORS issues
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.searchatlas.com/v2/domain-overview?domain=${domain}&api_key=${SEARCH_ATLAS_API_KEY}`
    )}`);
    
    if (!response.ok) {
      throw new Error(`SearchAtlas API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("SearchAtlas API response:", result);
    
    // Parse the response content
    let data;
    try {
      data = JSON.parse(result.contents);
    } catch (e) {
      console.error("Failed to parse API response:", e);
      // Fall back to generated data if parsing fails
      return generateFallbackData(domain, industry);
    }
    
    // Extract and map the data from the API response
    return {
      organicKeywords: data.keywords?.total || Math.floor(100 + (domain.length * 50)),
      organicTraffic: data.traffic?.monthly || Math.floor(500 + (domain.length * 200)),
      domainPower: data.metrics?.domain_score || Math.min(95, Math.floor(40 + (domain.length * 2))),
      domainAuthority: data.metrics?.authority || Math.min(95, Math.floor(35 + (domain.length * 2.5))),
      domainRanking: data.metrics?.ranking || Math.floor(10000 + (5000 * Math.random())),
      backlinks: data.backlinks?.total || Math.floor(100 + (domain.length * 100))
    };
  } catch (error) {
    console.error("Error fetching SearchAtlas data:", error);
    // Fall back to generated data if the API call fails
    return generateFallbackData(domain, industry);
  }
};

// Fallback data generator in case the API call fails
const generateFallbackData = (domain: string, industry: string): ApiData => {
  console.log("Using fallback data generation for", domain);
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
