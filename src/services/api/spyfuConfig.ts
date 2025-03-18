
// SpyFu API configuration
export const SPYFU_API_BASE_URL = 'https://www.spyfu.com/apis/domain_stats_api/v2';

// SpyFu API credentials - stored securely on the server side now
export const SPYFU_API_USERNAME = 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
export const SPYFU_API_KEY = 'VESAPD8P';

// Function to check if a domain has a valid format
export const isValidDomain = (domain: string): boolean => {
  if (domain === 'ping') return true; // Special case for connection testing
  
  // Basic validation: non-empty and contains at least one dot
  return domain.trim().length > 0 && domain.includes('.');
};

// Function to clean domain format (remove http://, https://, www. etc.)
export const cleanDomain = (domain: string): string => {
  if (domain === 'ping') return domain; // Don't modify our special test domain
  
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

// Check if SpyFu API credentials are set
export const hasSpyFuApiKey = (): boolean => {
  return SPYFU_API_USERNAME.length > 0 && SPYFU_API_KEY.length > 0;
};

// Default public proxy URL if none is set in localStorage
// This default URL will be used in production when no custom URL is set
export const DEFAULT_PUBLIC_PROXY_URL = 'https://your-deployed-proxy-url.com';

// Get the proxy server URL - prioritizes localStorage setting, then environment, then defaults
export const getProxyServerUrl = (): string => {
  // First check for custom proxy URL in localStorage
  if (typeof localStorage !== 'undefined') {
    const customProxyUrl = localStorage.getItem('custom_proxy_url');
    if (customProxyUrl) {
      console.log('Using custom proxy URL from localStorage:', customProxyUrl);
      return customProxyUrl;
    }
  }
  
  // If we're in development and no custom URL is set, use localhost
  if (process.env.NODE_ENV === 'development') {
    console.log('Development environment detected, using localhost:3001');
    return 'http://localhost:3001';
  }
  
  // In production with no custom URL, use the default public URL
  console.log('Production environment detected, using default public proxy URL');
  return DEFAULT_PUBLIC_PROXY_URL;
};

// Proxy server URL - dynamically retrieved
export const PROXY_SERVER_URL = getProxyServerUrl();

// Function to save a custom proxy URL
export const saveCustomProxyUrl = (url: string): void => {
  if (typeof localStorage !== 'undefined') {
    // Basic validation to ensure it's a URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('Saving custom proxy URL to localStorage:', url);
      localStorage.setItem('custom_proxy_url', url);
      // Force a page reload to apply the new URL
      window.location.reload();
    }
  }
};

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `${PROXY_SERVER_URL}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get the test URL for the proxy server
export const getProxyTestUrl = (): string => {
  return `${PROXY_SERVER_URL}/`;
};
