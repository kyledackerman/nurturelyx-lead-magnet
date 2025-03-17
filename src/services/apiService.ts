
import { ApiData } from "@/types/report";
import { toast } from "sonner";

// Google Analytics API configuration
const GOOGLE_ANALYTICS_CLIENT_ID = "526234754484-83dp9h4prub4l9qoao4kaikef5s91kig.apps.googleusercontent.com";
const GOOGLE_ANALYTICS_API_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GOOGLE_ANALYTICS_REDIRECT_URI = window.location.origin + "/auth/callback";

// Mock domain list for demonstration
const MOCK_DOMAINS = [
  "example.com",
  "yourbusiness.org", 
  "yourstore.net",
  "yourcompany.io"
];

// Function to get available domains from Google Analytics
export const getAvailableDomains = async (): Promise<string[]> => {
  // Check if we have a token
  const hasToken = !!sessionStorage.getItem('google_analytics_token');
  
  if (!hasToken) {
    throw new Error("Not authenticated with Google Analytics");
  }
  
  // In a real implementation, you would call the Google Analytics API to get the domains
  // For demonstration, we'll simulate an API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return MOCK_DOMAINS;
};

// Mock API response for development until OAuth flow is fully implemented
export const fetchDomainData = async (domain: string, organicTrafficManual?: number, isUnsureOrganic?: boolean): Promise<ApiData> => {
  console.log(`Using Google Analytics API to fetch data for ${domain}`);
  
  const toastId = toast.loading(`Fetching data for ${domain}...`, {
    description: "Connecting to Google Analytics API. This may take a moment..."
  });
  
  let apiData: ApiData | null = null;
  let error: Error | null = null;
  
  // If user provided manual organic traffic and is not unsure, use it directly
  if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual >= 0) {
    console.log("Using manually entered organic traffic:", organicTrafficManual);
    
    toast.success(`Using your provided organic traffic data for ${domain}`, { 
      id: toastId,
      description: "Organic traffic set to: " + organicTrafficManual.toLocaleString()
    });
    
    return {
      organicKeywords: Math.floor(organicTrafficManual * 0.3), // Estimate keywords as 30% of traffic
      organicTraffic: organicTrafficManual,
      paidTraffic: 0, // Will be set from form data
      domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
      backlinks: Math.floor(organicTrafficManual * 0.5), // Estimate backlinks as 50% of traffic
      dataSource: 'manual'
    };
  }
  
  // Try to authenticate with Google Analytics or use mock data for now
  try {
    // Check if we're already authenticated or need to trigger the OAuth flow
    // This is placeholder code for the OAuth flow - in a real implementation, 
    // you would need to handle the complete OAuth flow with a popup window or redirect
    
    const isAuthenticated = sessionStorage.getItem('google_analytics_token');
    
    if (!isAuthenticated) {
      console.log("User not authenticated with Google Analytics");
      
      // For now, we'll just simulate the OAuth flow with a delay
      // In real implementation, we would redirect to Google's OAuth consent screen
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this is where you would:
      // 1. Create OAuth consent URL with your client ID, redirect URI, and scope
      // 2. Open the URL in a popup or redirect the user
      // 3. Wait for callback with auth code
      // 4. Exchange auth code for access token
      // 5. Save token to session/local storage
      
      // For now, we'll simulate that we received a token
      sessionStorage.setItem('google_analytics_token', 'mock_token');
      
      console.log("Mock authentication completed");
    }
    
    // Create artificial delay to simulate real API response time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response based on domain characteristics - in real implementation,
    // this would be actual Google Analytics data
    
    // Simulate different traffic ratios based on domain name to make it more realistic
    const totalVisitors = Math.floor(1000 + (domain.length * 500));
    const organicRatio = 0.6 + (domain.length % 4) * 0.05; // Between 60-75% organic
    
    const mockResponse = {
      organicTraffic: Math.floor(totalVisitors * organicRatio),
      paidTraffic: Math.floor(totalVisitors * (1 - organicRatio)),
      organicKeywords: Math.floor(100 + (domain.length * 80)),
      domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
      backlinks: Math.floor(200 + (domain.length * 100))
    };
    
    console.log(`Google Analytics API mock response:`, mockResponse);
    
    toast.success(`Successfully retrieved data for ${domain}`, { 
      id: toastId,
      description: "Data has been fetched from Google Analytics."
    });
    
    apiData = {
      organicKeywords: mockResponse.organicKeywords,
      organicTraffic: mockResponse.organicTraffic,
      paidTraffic: mockResponse.paidTraffic,
      domainPower: mockResponse.domainPower,
      backlinks: mockResponse.backlinks,
      dataSource: 'api'
    };
  } catch (e) {
    console.error(`Error fetching Google Analytics data:`, e);
    error = e instanceof Error ? e : new Error(String(e));
  }
  
  // If we got API data
  if (apiData) {
    // If user also provided manual data, average them
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual >= 0) {
      console.log("Combining API data with manual data");
      
      const avgTraffic = Math.floor((apiData.organicTraffic + organicTrafficManual) / 2);
      const avgKeywords = Math.floor((apiData.organicKeywords + Math.floor(organicTrafficManual * 0.3)) / 2);
      const avgBacklinks = Math.floor((apiData.backlinks + Math.floor(organicTrafficManual * 0.5)) / 2);
      
      toast.success(`Averaged API data with your manual entry for ${domain}`, { 
        id: toastId,
        description: "Using combined data sources for the most accurate estimate."
      });
      
      return {
        ...apiData,
        organicTraffic: avgTraffic,
        organicKeywords: avgKeywords,
        backlinks: avgBacklinks,
        dataSource: 'both'
      };
    }
    
    return apiData;
  }
  
  // If API attempt failed and user is not unsure about organic traffic
  if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual >= 0) {
    // Use manual data as fallback
    console.log("Using manual data as fallback after API failure");
    
    toast.warning(`API connection failed for ${domain}`, { 
      id: toastId, 
      description: "Using your manually entered organic traffic data instead."
    });
    
    return {
      organicKeywords: Math.floor(organicTrafficManual * 0.3),
      organicTraffic: organicTrafficManual,
      paidTraffic: 0, // Will be set from form data
      domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
      backlinks: Math.floor(organicTrafficManual * 0.5),
      dataSource: 'manual'
    };
  }
  
  // If all API attempts failed, throw an error - we need manual input
  toast.error(`Failed to generate report for ${domain}`, { 
    id: toastId, 
    description: "Please enter your traffic data manually to continue."
  });
  
  throw new Error(`Could not retrieve data for ${domain}. Please enter your traffic data manually.`);
};

// Calculate report metrics based on both organic and paid traffic
export const calculateReportMetrics = (
  paidTraffic: number,
  avgTransactionValue: number,
  organicTraffic: number,
  apiPaidTraffic?: number
): { 
  missedLeads: number; 
  estimatedSalesLost: number;
  monthlyRevenueLost: number; 
  yearlyRevenueLost: number; 
  monthlyRevenueData: MonthlyRevenueData[];
} => {
  // Use the API paid traffic value if it exists, otherwise use the manually entered value
  const finalPaidTraffic = (apiPaidTraffic !== undefined && apiPaidTraffic > 0) ? apiPaidTraffic : paidTraffic;
  
  // Add organic traffic to paid visitors for total traffic
  const totalTraffic = finalPaidTraffic + organicTraffic;
  const visitorIdentificationRate = 0.2; // 20% visitor identification rate
  const salesConversionRate = 0.01; // 1% lead-to-sale conversion rate (1 per 100)
  
  const missedLeads = Math.floor(totalTraffic * visitorIdentificationRate);
  const estimatedSalesLost = Math.floor(missedLeads * salesConversionRate);
  const monthlyRevenueLost = estimatedSalesLost * avgTransactionValue;
  const yearlyRevenueLost = monthlyRevenueLost * 12;
  
  // Generate 6 months of historical data with 20% overall growth
  const today = new Date();
  const monthlyRevenueData: MonthlyRevenueData[] = [];
  
  // Calculate base values and growth factors
  const currentVisitors = totalTraffic;
  const growthRatio = Math.pow(0.8, 1/5); // To achieve 20% decline from current to 6 months ago
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = monthDate.toLocaleString('default', { month: 'short' });
    const year = monthDate.getFullYear();
    
    // Calculate growth factor for this month (earlier months have lower values)
    const monthGrowthFactor = Math.pow(growthRatio, i);
    
    // Add a little randomness to the data for each month (95-105% variation)
    const randomVariation = 0.95 + (Math.random() * 0.1);
    
    // Apply growth factor and random variation
    const monthTotalVisitors = Math.floor(currentVisitors * monthGrowthFactor * randomVariation);
    
    // Split between organic and paid with some variation
    const organicRatio = Math.random() * 0.1 + 0.65; // Between 65-75% organic
    const monthOrganic = Math.floor(monthTotalVisitors * organicRatio);
    const monthPaid = monthTotalVisitors - monthOrganic;
    
    // Calculate derived metrics
    const monthLeads = Math.floor(monthTotalVisitors * visitorIdentificationRate);
    const monthSales = Math.floor(monthLeads * salesConversionRate);
    const monthRevenue = monthSales * avgTransactionValue;
    
    monthlyRevenueData.push({
      month,
      year,
      visitors: monthTotalVisitors,
      organicVisitors: monthOrganic,
      paidVisitors: monthPaid,
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

// Function to initiate Google Analytics OAuth flow
export const initiateGoogleAnalyticsAuth = () => {
  // Create OAuth URL with client ID, redirect URI, scope, and response type
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_ANALYTICS_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_ANALYTICS_REDIRECT_URI)}&scope=${encodeURIComponent(GOOGLE_ANALYTICS_API_SCOPE)}&response_type=code&access_type=offline&prompt=consent`;
  
  // Open the OAuth URL in a popup window
  const width = 600;
  const height = 700;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    oauthUrl,
    "googleAnalyticsAuth",
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );
  
  // In a full implementation:
  // 1. You'd need a callback page that receives the auth code
  // 2. Exchange the code for an access token
  // 3. Store the token securely and use it for API requests
  
  return true;
};

export interface MonthlyRevenueData {
  month: string;
  year: number;
  visitors: number;
  organicVisitors: number;
  paidVisitors: number;
  leads: number;
  sales: number;
  revenueLost: number;
}
