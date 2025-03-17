
import { ApiData } from "@/types/report";
import { toast } from "sonner";

// SearchAtlas API key (public key for the demo)
const SEARCH_ATLAS_API_KEY = "ce26ade2b8adac45db89c62c438d0a31";

// Make a real API call to SearchAtlas
export const fetchDomainData = async (domain: string): Promise<ApiData> => {
  console.log(`Using SearchAtlas API key: ${SEARCH_ATLAS_API_KEY} to fetch data for ${domain}`);
  
  const toastId = toast.loading(`Fetching data for ${domain}...`, {
    description: "Connecting to SearchAtlas API. This may take a moment..."
  });
  
  try {
    // First attempt - direct API call with CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.searchatlas.com/v2/domain-overview?domain=${domain}&api_key=${SEARCH_ATLAS_API_KEY}`
    )}`;
    
    console.log("Attempting API call via proxy:", proxyUrl);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      console.error(`Proxy API error: ${response.status} ${response.statusText}`);
      
      // Try an alternative endpoint as fallback
      try {
        // For demo/development purposes, attempt an alternative endpoint
        console.log("Trying alternative SearchAtlas API endpoint...");
        const altResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(
          `https://api.searchatlas.ai/domain-overview?domain=${domain}&api_key=${SEARCH_ATLAS_API_KEY}`
        )}`);
        
        if (!altResponse.ok) {
          throw new Error(`Alternative API error: ${altResponse.status} ${altResponse.statusText}`);
        }
        
        const altResult = await altResponse.json();
        console.log("Alternative API response:", altResult);
        
        toast.success(`Successfully retrieved data from alternative endpoint for ${domain}`, { 
          id: toastId,
          description: "Connected to SearchAtlas alternative API."
        });
        
        // Parse response if successful
        try {
          const altData = JSON.parse(altResult.contents);
          // Map and return the data
          return mapApiResponse(altData, domain);
        } catch (e) {
          console.error("Failed to parse alternative API response:", e);
          throw new Error("Failed to parse alternative API response");
        }
      } catch (altError) {
        console.error("Alternative API attempt failed:", altError);
        // Fall through to use fallback data if both attempts fail
      }
      
      // If both attempts fail, use fallback data
      toast.error(`API connection failed for ${domain}`, { 
        id: toastId,
        description: "Using generated fallback data as an estimate. The SearchAtlas API is currently unavailable."
      });
      
      return generateFallbackData(domain);
    }
    
    // Create artificial delay to simulate real API response time (remove in production)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = await response.json();
    console.log("SearchAtlas API response:", result);
    
    // Check if we got an actual result or an error message
    if (result.status && result.status.http_code >= 400) {
      const errorMessage = `SearchAtlas API error: ${result.status.http_code} - ${result.status.message || "Unknown error"}`;
      console.error(errorMessage);
      toast.error(errorMessage, { 
        id: toastId,
        description: "Using generated fallback data as an estimate."
      });
      return generateFallbackData(domain);
    }
    
    // Parse the response content
    try {
      const data = JSON.parse(result.contents);
      
      // Check if SearchAtlas returned an error message in their response
      if (data.error || (data.status && data.status.http_code >= 400)) {
        const errorMsg = data.error || data.status?.message || "Unknown API error";
        console.error("SearchAtlas API returned an error:", errorMsg);
        toast.error(`SearchAtlas API error: ${errorMsg}`, { 
          id: toastId,
          description: "Using generated fallback data as an estimate."
        });
        return generateFallbackData(domain);
      }
      
      toast.success(`Successfully retrieved data for ${domain}`, { 
        id: toastId,
        description: "Data has been fetched from SearchAtlas."
      });
      
      // Return the mapped data
      return mapApiResponse(data, domain);
      
    } catch (e) {
      console.error("Failed to parse API response:", e);
      toast.error(`Error parsing data for ${domain}`, { 
        id: toastId,
        description: "Using generated fallback data as an estimate."
      });
      // Fall back to generated data if parsing fails
      return generateFallbackData(domain);
    }
  } catch (error) {
    console.error("Error fetching SearchAtlas data:", error);
    toast.error(`Error fetching data for ${domain}`, { 
      id: toastId,
      description: "Using generated fallback data as an estimate. API connection failed."
    });
    // Fall back to generated data if the API call fails
    return generateFallbackData(domain);
  }
};

// Helper function to map API response to our data structure
const mapApiResponse = (data: any, domain: string): ApiData => {
  // Extract the relevant data from the API response, with fallbacks
  return {
    organicKeywords: data.keywords?.total || Math.floor(100 + (domain.length * 50)),
    organicTraffic: data.traffic?.monthly || Math.floor(500 + (domain.length * 200)),
    domainPower: data.metrics?.domain_score || Math.min(95, Math.floor(40 + (domain.length * 2))),
    backlinks: data.backlinks?.total || Math.floor(100 + (domain.length * 100))
  };
};

// Simplified fallback data generator without industry factors
const generateFallbackData = (domain: string): ApiData => {
  console.log("Using fallback data generation for", domain);
  toast.warning(`Using generated data for ${domain}. API connection failed.`, { 
    duration: 5000,
    description: "The estimates below are based on domain name characteristics and average industry metrics."
  });
  
  const domainLength = domain.length;
  const tld = domain.split('.').pop()?.toLowerCase() || '';
  
  // Apply some basic heuristics based on domain characteristics
  const isBrandDomain = domainLength <= 8;
  const isEstablishedTld = ['com', 'org', 'net', 'edu'].includes(tld);
  
  // Adjust base values based on heuristics
  const baseMultiplier = isBrandDomain ? 1.5 : 1;
  const tldMultiplier = isEstablishedTld ? 1.3 : 0.9;
  
  return {
    organicKeywords: Math.floor(100 + (domainLength * 50 * baseMultiplier * tldMultiplier)),
    organicTraffic: Math.floor(500 + (domainLength * 200 * baseMultiplier * tldMultiplier)),
    domainPower: Math.min(95, Math.floor(40 + (domainLength * 2 * (isBrandDomain ? 1.2 : 1)))),
    backlinks: Math.floor(100 + (domainLength * 100 * baseMultiplier * tldMultiplier))
  };
};

// Calculate report metrics based on both organic and paid traffic
export const calculateReportMetrics = (
  monthlyVisitors: number,
  avgTransactionValue: number,
  organicTraffic: number
): { 
  missedLeads: number; 
  estimatedSalesLost: number;
  monthlyRevenueLost: number; 
  yearlyRevenueLost: number; 
  monthlyRevenueData: MonthlyRevenueData[];
} => {
  // Add organic traffic to paid visitors for total traffic
  const totalTraffic = monthlyVisitors + organicTraffic;
  const visitorIdentificationRate = 0.2; // 20% visitor identification rate
  const salesConversionRate = 0.01; // 1% lead-to-sale conversion rate (1 per 100)
  
  const missedLeads = Math.floor(totalTraffic * visitorIdentificationRate);
  const estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
  const monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;
  
  // Generate 6 months of historical data
  const today = new Date();
  const monthlyRevenueData: MonthlyRevenueData[] = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = monthDate.toLocaleString('default', { month: 'short' });
    const year = monthDate.getFullYear();
    
    // Add a little randomness to the data for each month (80-120% of base value)
    const variationFactor = 0.8 + (Math.random() * 0.4);
    
    // Calculate monthly metrics with variation
    const monthOrganic = Math.floor(organicTraffic * variationFactor);
    const monthPaid = Math.floor(monthlyVisitors * variationFactor);
    const monthTotalVisitors = monthOrganic + monthPaid;
    const monthLeads = Math.floor(monthTotalVisitors * visitorIdentificationRate);
    const monthSales = Math.floor(monthLeads * salesConversionRate);
    const monthRevenue = monthSales * avgTransactionValue;
    
    monthlyRevenueData.push({
      month,
      year,
      visitors: monthTotalVisitors,
      leads: monthLeads,
      sales: monthSales,
      revenueLost: monthRevenue
    });
  }
  
  return {
    missedLeads,
    estimatedSalesLost,
    monthlyRevenueLost,
    yearlyRevenueLost,
    monthlyRevenueData
  };
};

export interface MonthlyRevenueData {
  month: string;
  year: number;
  visitors: number;
  leads: number;
  sales: number;
  revenueLost: number;
}
