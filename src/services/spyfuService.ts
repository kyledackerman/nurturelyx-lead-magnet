
import { toast } from "sonner";
import { ApiData } from "@/types/report";

// SpyFu API configuration
const SPYFU_API_BASE_URL = 'https://www.spyfu.com/apis/domain_stats_api/v2';

// SpyFu API credentials (provided by the application owner)
const SPYFU_API_USERNAME = 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
const SPYFU_API_KEY = 'VESAPD8P';

// Function to check if a domain has a valid format
const isValidDomain = (domain: string): boolean => {
  // Basic validation: non-empty and contains at least one dot
  return domain.trim().length > 0 && domain.includes('.');
};

// Function to clean domain format (remove http://, https://, www. etc.)
const cleanDomain = (domain: string): string => {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .trim();
};

// Function to get the SpyFu URL for the given domain
export const getSpyFuUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `https://www.spyfu.com/overview/domain?query=${encodeURIComponent(cleanedDomain)}`;
};

// Check if SpyFu API credentials are set - always returns true now since we have hard-coded values
export const hasSpyFuApiKey = (): boolean => {
  return true;
};

// Function to fetch domain data from SpyFu API
export const fetchDomainData = async (
  domain: string, 
  organicTrafficManual?: number, 
  isUnsureOrganic?: boolean
): Promise<ApiData> => {
  const toastId = toast.loading(`Analyzing ${domain}...`, {
    description: "Getting SEO and traffic data from SpyFu. This may take a moment..."
  });
  
  try {
    // Clean domain format
    const cleanedDomain = cleanDomain(domain);
    
    if (!isValidDomain(cleanedDomain)) {
      throw new Error("Please enter a valid domain (e.g., example.com)");
    }
    
    console.log(`Analyzing domain: ${cleanedDomain}`);
    
    // Create auth header using Basic Authentication
    const authHeader = `Basic ${btoa(`${SPYFU_API_USERNAME}:${SPYFU_API_KEY}`)}`;
    
    // Make the request to SpyFu API for the latest domain stats
    const response = await fetch(
      `${SPYFU_API_BASE_URL}/getLatestDomainStats?domain=${encodeURIComponent(cleanedDomain)}&countryCode=US`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SpyFu API error:', errorData);
      throw new Error(`SpyFu API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the relevant stats from the API response
    if (!data.results || data.results.length === 0) {
      throw new Error(`No data found for domain: ${cleanedDomain}`);
    }
    
    const domainStats = data.results[0];
    
    // Map API response to our ApiData format
    const apiData: ApiData = {
      organicTraffic: Math.floor(domainStats.monthlyOrganicClicks || 0),
      paidTraffic: Math.floor(domainStats.monthlyPaidClicks || 0),
      organicKeywords: domainStats.totalOrganicResults || 0,
      domainPower: domainStats.strength || Math.min(95, Math.round((domainStats.totalOrganicResults || 0) / 5000)),
      backlinks: Math.floor((domainStats.totalOrganicResults || 0) * 0.5), // Estimate backlinks based on keywords count
      dataSource: 'api' as const
    };
    
    toast.success(`Successfully analyzed ${cleanedDomain}`, { 
      id: toastId,
      description: `SpyFu data retrieved successfully.`,
    });
    
    // If user also provided manual organic traffic and is not unsure, average them for better accuracy
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
      const avgTraffic = Math.floor((apiData.organicTraffic + organicTrafficManual) / 2);
      const avgKeywords = Math.floor((apiData.organicKeywords + Math.floor(organicTrafficManual * 0.3)) / 2);
      const avgBacklinks = Math.floor((apiData.backlinks + Math.floor(organicTrafficManual * 0.5)) / 2);
      
      toast.success(`Averaged API data with your manual entry for ${cleanedDomain}`, { 
        description: `Using combined data sources for the most accurate estimate.`,
      });
      
      return {
        ...apiData,
        organicTraffic: avgTraffic,
        organicKeywords: avgKeywords,
        backlinks: avgBacklinks,
        dataSource: 'both' as const
      };
    }
    
    return apiData;
  } catch (error) {
    console.error(`Error fetching domain data:`, error);
    
    // Get SpyFu URL for the domain
    const spyfuUrl = getSpyFuUrl(domain);
    
    // If API call failed but user provided manual data, use it as fallback
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
      toast.warning(`SpyFu API call failed for ${domain}`, { 
        id: toastId, 
        description: `Using your manually entered data instead.`,
      });
      
      return {
        organicKeywords: Math.floor(organicTrafficManual * 0.3),
        organicTraffic: organicTrafficManual,
        paidTraffic: 0, // Will be set from form data
        domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
        backlinks: Math.floor(organicTrafficManual * 0.5),
        dataSource: 'manual' as const
      };
    }
    
    // If all attempts failed, provide a friendly error message
    const errorMessage = error instanceof Error ? error.message : 
      `Please check your domain and try again, or enter your traffic manually to continue.`;
    
    toast.error(`Failed to analyze ${domain}`, { 
      id: toastId, 
      description: errorMessage
    });
    
    throw new Error(`Unable to retrieve data from SpyFu API. Please enter your traffic values manually to continue.`);
  }
};

// Re-export calculateReportMetrics from apiService
export { calculateReportMetrics } from './apiService';
