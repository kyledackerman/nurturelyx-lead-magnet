
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

// PRIMARY RAILWAY PROXY URL - this is the only URL we should use
export const DEFAULT_PUBLIC_PROXY_URL = 'https://nurture-lead-vision-production.up.railway.app';

// Get the proxy server URL - ALWAYS return the Railway URL
export const getProxyServerUrl = (): string => {
  // Always use the Railway URL for reliability
  console.log('Using Railway proxy URL:', DEFAULT_PUBLIC_PROXY_URL);
  return DEFAULT_PUBLIC_PROXY_URL;
};

// Function to get the current proxy URL
export const PROXY_SERVER_URL = getProxyServerUrl;

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  const baseUrl = DEFAULT_PUBLIC_PROXY_URL;
  
  // Our custom proxy endpoint
  return `${baseUrl}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get a test URL for the proxy
export const getProxyTestUrl = (): string => {
  return `${DEFAULT_PUBLIC_PROXY_URL}/`;
};

// These functions no longer do anything - we always use the Railway URL
export const saveCustomProxyUrl = (url: string): void => {
  // No-op: Always use Railway URL
  console.log('Custom proxy URLs are disabled for reliability');
};

export const toggleLocalProxy = (useLocal: boolean): void => {
  // No-op: Always use Railway URL
  console.log('Local proxy usage is disabled for reliability');
};

// Function to check if SpyFu API key is available
export const hasSpyFuApiKey = (): boolean => {
  // We always have the API key available since it's hardcoded
  return Boolean(SPYFU_API_KEY);
};
