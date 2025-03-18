
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

// Railway deployment URL - our primary proxy server
export const DEFAULT_PUBLIC_PROXY_URL = 'https://nurture-lead-vision-production.up.railway.app';

// Check if current user has admin access
const hasAdminAccess = (): boolean => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('admin_access') === 'true';
  }
  return false;
};

// Simplified environment detection - only localhost is considered development
const isDevelopmentEnvironment = (): boolean => {
  // Always consider it production if not in a browser
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Only these specific hostnames are considered development environments
  const isLocalhost = hostname === 'localhost' || 
                      hostname === '127.0.0.1' || 
                      hostname.includes('.local');
                      
  console.log(`Current hostname: ${hostname}, isDevelopment: ${isLocalhost}`);
  return isLocalhost;
};

// Get the proxy server URL - ALWAYS use Railway in production
export const getProxyServerUrl = (): string => {
  // First, check if we're in development mode with simplified, reliable detection
  const isDev = isDevelopmentEnvironment();
  
  // Log the environment detection for debugging
  console.log(`Environment detected: ${isDev ? 'Development' : 'Production'}`);
  
  // FOR PRODUCTION: Always use Railway URL - no exceptions!
  if (!isDev) {
    console.log(`Using Railway proxy URL: ${DEFAULT_PUBLIC_PROXY_URL}`);
    return DEFAULT_PUBLIC_PROXY_URL;
  }
  
  // FOR DEVELOPMENT ONLY: Check for admin custom URL
  if (isDev && hasAdminAccess() && typeof localStorage !== 'undefined') {
    const customProxyUrl = localStorage.getItem('custom_proxy_url');
    if (customProxyUrl && customProxyUrl.trim()) {
      console.log('Admin using custom proxy URL in development:', customProxyUrl);
      return customProxyUrl.trim();
    }
  }
  
  // Default for development is localhost
  console.log('Using localhost:3001 for development');
  return 'http://localhost:3001';
};

// Function to get the current proxy URL
export const PROXY_SERVER_URL = (): string => {
  return getProxyServerUrl();
};

// Function to save a custom proxy URL - admin access required
export const saveCustomProxyUrl = (url: string): void => {
  if (!hasAdminAccess()) {
    console.error('Attempt to set custom proxy URL without admin access');
    return;
  }
  
  if (typeof localStorage !== 'undefined') {
    // Basic validation to ensure it's a URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('Admin saving custom proxy URL to localStorage:', url);
      localStorage.setItem('custom_proxy_url', url.trim());
      // Force a page reload to apply the new URL
      window.location.reload();
    }
  }
};

// Function to get the proxy URL for SpyFu API requests
export const getProxyUrl = (domain: string): string => {
  const cleanedDomain = cleanDomain(domain);
  return `${PROXY_SERVER_URL()}/proxy/spyfu?domain=${encodeURIComponent(cleanedDomain)}`;
};

// Function to get the test URL for the proxy server
export const getProxyTestUrl = (): string => {
  return `${PROXY_SERVER_URL()}/`;
};
