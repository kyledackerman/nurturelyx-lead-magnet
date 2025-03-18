
// SpyFu API configuration - hardcoded fallback credentials
export const SPYFU_API_USERNAME = 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
export const SPYFU_API_KEY = 'VESAPD8P';

// PRIMARY RAILWAY PROXY URL - direct hardcoded string for maximum reliability
export const DEFAULT_PUBLIC_PROXY_URL = 'https://nurture-lead-vision-production.up.railway.app';
export const DIRECT_RAILWAY_URL = 'https://nurture-lead-vision-production.up.railway.app';

// Function to check if a domain has a valid format
export const isValidDomain = (domain: string): boolean => {
  if (domain === 'ping') return true; // Special case for connection testing
  
  // Basic domain validation - must have at least one dot and some characters on each side
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
  return domain.trim().length > 0 && domainRegex.test(domain);
};

// Function to clean domain format (remove http://, https://, www. etc.)
export const cleanDomain = (domain: string): string => {
  if (domain === 'ping') return domain;
  
  // More thorough cleaning
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '') // Remove paths
    .trim()
    .toLowerCase();
};

// Function to get the SpyFu URL for the given domain
export const getSpyFuUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `https://www.spyfu.com/overview/domain?query=${encodeURIComponent(cleanedDomain)}`;
};

// Direct access to Railway URL - no functions, just direct string
export const PROXY_SERVER_URL = (): string => DIRECT_RAILWAY_URL;

// Function to get the proxy URL for SpyFu API requests - direct hardcoded URL
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `${DIRECT_RAILWAY_URL}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get a test URL for the proxy - direct root endpoint
export const getProxyTestUrl = (): string => {
  return DIRECT_RAILWAY_URL;
};

// We only use the Railway URL
export const saveCustomProxyUrl = (url: string): void => {
  console.log('Custom proxy URLs are disabled - always using Railway URL');
};

export const toggleLocalProxy = (useLocal: boolean): void => {
  console.log('Local proxy usage is disabled - always using Railway URL');
};

// Function to check if SpyFu API key is available
export const hasSpyFuApiKey = (): boolean => {
  // We have hardcoded API keys
  return true;
};
