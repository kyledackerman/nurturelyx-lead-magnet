
import { toast } from "sonner";
import { ApiData } from "@/types/report";
import { SPYFU_API_BASE_URL, SPYFU_API_USERNAME, SPYFU_API_KEY, isValidDomain, cleanDomain } from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";

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
    
    // Attempt to get current date for exact date endpoint
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    // Create auth header using Basic Authentication
    const authHeader = `Basic ${btoa(`${SPYFU_API_USERNAME}:${SPYFU_API_KEY}`)}`;
    
    try {
      // Set a longer timeout for the API request (20 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      // UPDATED: Use getDomainStatsForExactDate endpoint instead 
      // This endpoint is more reliable as shown in the documentation
      const apiUrl = `${SPYFU_API_BASE_URL}/getDomainStatsForExactDate?month=${currentMonth}&year=${currentYear}&domain=${encodeURIComponent(cleanedDomain)}&countryCode=US`;
      console.log(`Making API request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
        cache: 'no-cache',
        credentials: 'omit' // Don't send cookies
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`SpyFu API error: Status ${response.status}, ${response.statusText}`);
        throw new Error(`SpyFu API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("SpyFu API response:", data);
      
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
      console.error("SpyFu API request failed:", apiError);
      
      // If SpyFu API call fails, try a direct fallback
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
