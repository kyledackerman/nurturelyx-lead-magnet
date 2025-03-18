
// SpyFu API configuration
export const SPYFU_API_BASE_URL = 'https://www.spyfu.com/apis/domain_stats_api/v2';

// SpyFu API credentials - verified 
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

// Proxy server URL - Set this to your local Express server
export const PROXY_SERVER_URL = 'http://localhost:3001';

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `${PROXY_SERVER_URL}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get the test URL for the proxy server
export const getProxyTestUrl = (): string => {
  return `${PROXY_SERVER_URL}/`;
};
