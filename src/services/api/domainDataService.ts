
import { toast } from "sonner";
import { ApiData } from "@/types/report";
import { 
  SPYFU_API_USERNAME, 
  SPYFU_API_KEY, 
  isValidDomain, 
  cleanDomain, 
  getProxyUrl 
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
    
    try {
      // Set a longer timeout for the API request (60 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      // Get the proxy URL for the cleaned domain
      const proxyUrl = getProxyUrl(cleanedDomain);
      
      console.log(`Making API request via proxy: ${proxyUrl}`);
      
      // Make the API request to our proxy server
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Log full response details for debugging
      console.log(`Proxy API response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Log more detailed error information
        console.error(`Proxy API error: Status ${response.status}, ${response.statusText}`);
        
        // Try to read the error response if possible
        try {
          const errorText = await response.text();
          console.error(`Error response body: ${errorText}`);
        } catch (e) {
          console.error("Could not read error response body");
        }
        
        throw new Error(`Proxy API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Proxy API response data:", data);
      
      // Extract the relevant stats from the API response
      if (!data.results || data.results.length === 0) {
        console.error("No data found in SpyFu API response");
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
    } catch (apiError) {
      console.error("SpyFu API request via proxy failed:", apiError);
      
      let errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      
      // Specific error handling for connection issues
      if (errorMessage.includes('network') || errorMessage.includes('abort') || errorMessage.includes('Failed to fetch')) {
        console.error("This appears to be a network connectivity issue with the proxy");
        
        // More helpful error message for network issues
        errorMessage = `The proxy server connection failed. Make sure your Express.js proxy server is running at http://localhost:3001 and try again.`;
        
        toast.error(`Proxy Server Connection Issue`, {
          id: toastId,
          description: `Unable to connect to the proxy server. Please make sure it's running or enter your traffic data manually to continue.`
        });
      }
      
      // If proxy API call fails, try a direct fallback
      toast.warning(`SpyFu API connection issue for ${domain}`, { 
        id: toastId, 
        description: `Using estimated data instead. Enter your traffic manually for better accuracy.`,
      });
      
      // If manual data provided, use it
      if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
        return {
          organicKeywords: Math.floor(organicTrafficManual * 0.3),
          organicTraffic: organicTrafficManual,
          paidTraffic: 0, // Will be set from form data
          domainPower: Math.min(95, Math.floor(40 + (domain.length * 2))),
          backlinks: Math.floor(organicTrafficManual * 0.5),
          dataSource: 'manual' as const
        };
      } else {
        // Generate fallback data when API and manual data unavailable
        return generateFallbackData(domain, organicTrafficManual);
      }
    }
  } catch (error) {
    console.error(`Error fetching domain data:`, error);
    
    // If user provided manual data, use it as fallback
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
      toast.warning(`SpyFu API unavailable for ${domain}`, { 
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
    
    // If all attempts failed, show a clear error message
    const errorMessage = error instanceof Error ? error.message : 
      `Please check your domain and try again, or enter your traffic manually to continue.`;
    
    toast.error(`Failed to analyze ${domain}`, { 
      id: toastId, 
      description: errorMessage
    });
    
    throw new Error(`Unable to retrieve data from SpyFu API. Please enter your traffic values manually to continue.`);
  }
};
