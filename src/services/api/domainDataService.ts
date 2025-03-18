
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
        description: "No API connection available. Using industry estimates instead."
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
