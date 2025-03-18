
// SpyFu API configuration
export const SPYFU_API_USERNAME = 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
export const SPYFU_API_KEY = 'VESAPD8P';

// Function to check if a domain has a valid format
export const isValidDomain = (domain: string): boolean => {
  if (domain === 'ping') return true; // Special case for connection testing
  return domain.trim().length > 0 && domain.includes('.');
};

// Function to clean domain format (remove http://, https://, www. etc.)
export const cleanDomain = (domain: string): string => {
  if (domain === 'ping') return domain;
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

// PUBLIC CORS PROXY SERVICES - use these as fallbacks
const CORS_PROXIES = [
  'https://nurture-lead-vision-production.up.railway.app', // Railway (primary)
  'https://corsproxy.io/', // CORS Proxy (fallback 1)
  'https://cors-anywhere.herokuapp.com/', // CORS Anywhere (fallback 2)
  'http://localhost:3001', // Local development
];

// Railway deployment URL - our primary proxy server
export const DEFAULT_PUBLIC_PROXY_URL = CORS_PROXIES[0];

// Super simplified environment detection
const isDevelopmentEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('.local') ||
         hostname.includes('lovableproject.com'); // Include Lovable preview domains
};

// Get the proxy server URL - try multiple fallbacks
export const getProxyServerUrl = (): string => {
  const isDev = isDevelopmentEnvironment();
  
  // Check for custom proxy URL in localStorage (admin only)
  if (typeof localStorage !== 'undefined') {
    const customProxyUrl = localStorage.getItem('custom_proxy_url');
    if (customProxyUrl) {
      console.log('Using custom proxy URL:', customProxyUrl);
      return customProxyUrl;
    }
  }
  
  // In development, try localhost first
  if (isDev) {
    // Allow override for use with local server
    if (typeof localStorage !== 'undefined' && localStorage.getItem('use_local_proxy') === 'true') {
      console.log('Using local proxy server');
      return CORS_PROXIES[3]; // localhost
    }
  }

  // Default to Railway proxy (or first available proxy)
  console.log('Using default proxy URL:', DEFAULT_PUBLIC_PROXY_URL);
  return DEFAULT_PUBLIC_PROXY_URL;
};

// Function to get the current proxy URL
export const PROXY_SERVER_URL = getProxyServerUrl;

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  const baseUrl = getProxyServerUrl();
  
  // For CORS proxy services, we need to encode the full SpyFu API URL
  if (baseUrl.includes('corsproxy.io')) {
    const spyfuApiUrl = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${cleanedDomain}&month=3&year=2023&countryCode=US&api_username=${SPYFU_API_USERNAME}&api_key=${SPYFU_API_KEY}`;
    return `${baseUrl}?${encodeURIComponent(spyfuApiUrl)}`;
  } else if (baseUrl.includes('cors-anywhere')) {
    return `${baseUrl}/https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${cleanedDomain}&month=3&year=2023&countryCode=US&api_username=${SPYFU_API_USERNAME}&api_key=${SPYFU_API_KEY}`;
  } else {
    // Our custom proxy endpoint
    return `${baseUrl}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
  }
};

// Function to get a test URL for the proxy
export const getProxyTestUrl = (): string => {
  const baseUrl = getProxyServerUrl();
  if (baseUrl.includes('corsproxy.io')) {
    return `${baseUrl}?${encodeURIComponent('https://httpbin.org/get')}`;
  } else if (baseUrl.includes('cors-anywhere')) {
    return `${baseUrl}/https://httpbin.org/get`;
  } else {
    return `${baseUrl}/`;
  }
};

// Function to save a custom proxy URL (admin only)
export const saveCustomProxyUrl = (url: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('custom_proxy_url', url);
    // Force reload to apply the new proxy URL
    window.location.reload();
  }
};

// Function to toggle local proxy usage
export const toggleLocalProxy = (useLocal: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('use_local_proxy', useLocal ? 'true' : 'false');
    // Force reload to apply the change
    window.location.reload();
  }
};

// Function to check if SpyFu API key is available
export const hasSpyFuApiKey = (): boolean => {
  // We always have the API key available since it's hardcoded
  return Boolean(SPYFU_API_KEY);
};
