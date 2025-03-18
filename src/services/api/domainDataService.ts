
import { toast } from "sonner";
import { ApiData } from "@/types/report";
import { isValidDomain, cleanDomain } from "./spyfuConfig";
import { generateFallbackData } from "./fallbackDataService";

// Hardcoded Railway URL for maximum reliability
const RAILWAY_URL = "https://nurture-lead-vision-production.up.railway.app";

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
      // First, verify the proxy server is accessible
      console.log("Testing Railway connection...");
      
      // Ping the Railway server with a simple request
      const testResponse = await fetch(`${RAILWAY_URL}/`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store',
        mode: 'cors'
      });
      
      if (!testResponse.ok) {
        console.error("Proxy server test failed with status:", testResponse.status);
        throw new Error(`Proxy server responded with ${testResponse.status}`);
      }
      
      // Proxy is available, get real data for the domain
      console.log(`Fetching real data for ${cleanedDomain} via Railway`);
      const proxyUrl = `${RAILWAY_URL}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal,
        cache: 'no-store',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
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
    } catch (error: any) {
      console.warn("API data fetch failed:", error);
      
      // If there's manual traffic data available, use it
      if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
        console.log("Using manual traffic data as fallback");
        
        toast.warning(`Using your manually entered data`, { 
          id: toastId,
          description: "API connection failed. Using your traffic values."
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
      
      // Generate fallback data based on domain name
      const fallbackData = generateFallbackData(cleanedDomain);
      
      toast.warning(`Analysis using estimates for ${domain}`, { 
        id: toastId,
        description: "API connection failed. Using industry estimates instead."
      });
      
      return {
        ...fallbackData,
        dataSource: 'fallback' as const
      };
    }
  } catch (error: any) {
    console.error(`Error fetching domain data:`, error);
    
    // If user provided manual data, use it as fallback
    if (organicTrafficManual !== undefined && organicTrafficManual > 0) {
      toast.warning(`Using your manually entered data`, { 
        id: toastId,
        description: "API connection failed. Using your traffic values."
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
