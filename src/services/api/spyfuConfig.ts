
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

// Railway deployment URL - our primary proxy server
export const DEFAULT_PUBLIC_PROXY_URL = 'https://nurture-lead-vision-production.up.railway.app';

// Super simplified environment detection
const isDevelopmentEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.includes('.local');
};

// Get the proxy server URL - ALWAYS use Railway in production
export const getProxyServerUrl = (): string => {
  const isDev = isDevelopmentEnvironment();
  
  // Always use Railway in production
  if (!isDev) {
    return DEFAULT_PUBLIC_PROXY_URL;
  }
  
  // Check for custom proxy URL in localStorage (admin only)
  if (isDev && typeof localStorage !== 'undefined') {
    const customProxyUrl = localStorage.getItem('custom_proxy_url');
    if (customProxyUrl) {
      return customProxyUrl;
    }
  }
  
  // Use localhost in development
  return 'http://localhost:3001';
};

// Function to get the current proxy URL
export const PROXY_SERVER_URL = getProxyServerUrl;

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `${getProxyServerUrl()}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get a test URL for the proxy
export const getProxyTestUrl = (): string => {
  return `${getProxyServerUrl()}/`;
};

// Function to save a custom proxy URL (admin only)
export const saveCustomProxyUrl = (url: string): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('custom_proxy_url', url);
    // Force reload to apply the new proxy URL
    window.location.reload();
  }
};

// Function to check if SpyFu API key is available
export const hasSpyFuApiKey = (): boolean => {
  // We always have the API key available since it's hardcoded
  return SPYFU_API_KEY !== '';
};
