
import { toast } from "sonner";
import { ApiData } from "@/types/report";
import { 
  isValidDomain, 
  cleanDomain, 
  getProxyUrl,
  getProxyTestUrl
} from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";

// Function to fetch domain data from SpyFu API via proxy
export const fetchDomainData = async (
  domain: string, 
  organicTrafficManual?: number, 
  isUnsureOrganic?: boolean
): Promise<ApiData> => {
  const toastId = toast.loading(`Analyzing ${domain}...`, {
    description: "Getting SEO and traffic data. This may take a moment..."
  });
  
  try {
    // Clean domain format
    const cleanedDomain = cleanDomain(domain);
    
    if (!isValidDomain(cleanedDomain)) {
      throw new Error("Please enter a valid domain (e.g., example.com)");
    }
    
    console.log(`Analyzing domain: ${cleanedDomain}`);
    
    // If user provided manual traffic and isn't unsure, use it without API call
    if (organicTrafficManual !== undefined && !isUnsureOrganic && organicTrafficManual > 0) {
      toast.success(`Using your manually entered data for ${domain}`, { 
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
    
    // Try to get real data from the SpyFu API
    try {
      // First, check if proxy is available
      console.log("Testing proxy connection...");
      
      try {
        const testResponse = await fetch(getProxyTestUrl(), {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'omit',
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (!testResponse.ok) {
          console.error("Proxy connection test failed with status:", testResponse.status);
          throw new Error("Proxy connection test failed");
        }
      } catch (testError) {
        console.error("Proxy connection test error:", testError);
        throw new Error("Failed to connect to proxy server");
      }
      
      // Proxy is available, get real data for the domain
      console.log(`Fetching real data for ${cleanedDomain}`);
      const proxyUrl = getProxyUrl(cleanedDomain);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit',
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error("API response error:", response.status, response.statusText);
        throw new Error(`API returned status ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing API response:", jsonError);
        throw new Error("Invalid response from API server");
      }
      
      // Check if data contains error
      if (data.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }
      
      // Extract the relevant metrics from the API response
      const apiData: ApiData = {
        organicTraffic: data.organicTrafficEstimate || 0,
        paidTraffic: data.ppcTrafficEstimate || 0,
        organicKeywords: data.organicKeywords || 0,
        domainPower: data.domainStrength || 0,
        backlinks: data.backlinks || 0,
        dataSource: 'api' as const
      };
      
      toast.success(`Analysis complete for ${domain}`, { 
        id: toastId,
        description: "Using real SpyFu data for your report."
      });
      
      return apiData;
    } catch (error) {
      console.warn("API data fetch failed, using fallback data:", error);
      // Continue to fallback data
    }
    
    // Generate fallback data based on domain name
    const fallbackData = generateFallbackData(cleanedDomain);
    
    // Show a message that we're using estimated data
    toast.success(`Analysis complete for ${domain}`, { 
      id: toastId,
      description: "Using industry estimates for traffic data."
    });
    
    return {
      ...fallbackData,
      dataSource: 'fallback' as const
    };
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
    
    // If domain is provided, generate fallback data
    if (domain && domain.trim() !== '') {
      const cleanedDomain = cleanDomain(domain);
      const fallbackData = generateFallbackData(cleanedDomain);
      
      toast.warning(`Using estimated data for ${domain}`, { 
        id: toastId,
        description: "API connection unavailable. Using industry estimates instead."
      });
      
      return {
        ...fallbackData,
        dataSource: 'fallback' as const
      };
    }
    
    // If all attempts failed, show a clear error message
    const errorMessage = error instanceof Error ? error.message : 
      `Please check your domain and try again, or enter your traffic manually to continue.`;
    
    toast.error(`Failed to analyze ${domain}`, { 
      id: toastId, 
      description: errorMessage
    });
    
    throw new Error(`Please enter your traffic values manually to continue.`);
  }
};
