
import { toast } from "sonner";
import { ApiData } from "@/types/report";
import { 
  isValidDomain, 
  cleanDomain, 
  getProxyUrl,
  SPYFU_API_KEY,
  DEFAULT_PUBLIC_PROXY_URL
} from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";

// Function to fetch domain data from SpyFu API via proxy
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
    console.log(`API Key available: ${Boolean(SPYFU_API_KEY)}`);
    console.log(`Using Railway proxy URL: ${DEFAULT_PUBLIC_PROXY_URL}`);
    
    try {
      // Get the proxy URL for the cleaned domain - ONLY use Railway URL
      const proxyUrl = getProxyUrl(cleanedDomain);
      console.log(`Making API request via proxy: ${proxyUrl}`);
      
      // Make the API request with a timeout and proper CORS settings
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send credentials
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Proxy API error: ${response.status} ${response.statusText}`);
        throw new Error(`Proxy API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Proxy API response data:", data);
      
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
        domainPower: domainStats.strength || 0,
        backlinks: Math.floor((domainStats.totalOrganicResults || 0) * 0.5),
        dataSource: 'api' as const
      };
      
      toast.success(`Successfully analyzed ${cleanedDomain}`, { 
        id: toastId
      });
      
      // If user also provided manual organic traffic and is not unsure, use it
      if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
        return {
          ...apiData,
          organicTraffic: organicTrafficManual,
          dataSource: 'both' as const
        };
      }
      
      return apiData;
    } catch (apiError) {
      console.error("SpyFu API request via proxy failed:", apiError);
      
      // If manual data provided, use it
      if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
        toast.warning(`Using manual traffic data for ${domain}`, { 
          id: toastId
        });
        
        return {
          organicKeywords: Math.floor(organicTrafficManual * 0.3),
          organicTraffic: organicTrafficManual,
          paidTraffic: 0,
          domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
          backlinks: Math.floor(organicTrafficManual * 0.5),
          dataSource: 'manual' as const
        };
      } else {
        // Try fallback data if API fails
        toast.error(`API connection error`, {
          id: toastId,
          description: `Please enter your traffic data manually below to continue.`
        });
        throw new Error(`Unable to retrieve data from SpyFu API. Please enter your traffic values manually.`);
      }
    }
  } catch (error) {
    console.error(`Error fetching domain data:`, error);
    
    // If user provided manual data, use it as fallback
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
      toast.warning(`Using your manually entered data`, { 
        id: toastId
      });
      
      return {
        organicKeywords: Math.floor(organicTrafficManual * 0.3),
        organicTraffic: organicTrafficManual,
        paidTraffic: 0,
        domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
        backlinks: Math.floor(organicTrafficManual * 0.5),
        dataSource: 'manual' as const
      };
    }
    
    // If all attempts failed, show a clear error message
    const errorMessage = error instanceof Error ? error.message : 
      `Please check your domain and try again, or enter your traffic manually to continue.`;
    
    toast.error(`Failed to analyze ${domain}`, { 
      id: toastId, 
      description: errorMessage
    });
    
    throw new Error(`Unable to retrieve data from SpyFu API. Please enter your traffic values manually.`);
  }
};
