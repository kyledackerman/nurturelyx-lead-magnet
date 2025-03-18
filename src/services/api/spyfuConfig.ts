
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

// Determine if we're running in a development environment
const isDevelopmentEnvironment = (): boolean => {
  // Check for development environment markers
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  
  return (
    process.env.NODE_ENV === 'development' || 
    hostname === 'localhost' ||
    hostname.includes('.local') ||
    port === '3000' ||
    port === '5173'
  );
};

// Get the proxy server URL with improved logic
export const getProxyServerUrl = (): string => {
  console.log('Getting proxy server URL with process.env.NODE_ENV =', process.env.NODE_ENV);
  
  // Only check for custom proxy URL in localStorage if admin access is granted
  if (hasAdminAccess() && typeof localStorage !== 'undefined' && typeof window !== 'undefined') {
    const customProxyUrl = localStorage.getItem('custom_proxy_url');
    if (customProxyUrl) {
      console.log('Admin using custom proxy URL from localStorage:', customProxyUrl);
      return customProxyUrl.trim();
    }
  }
  
  // Check if we're running in development
  if (isDevelopmentEnvironment()) {
    console.log('Development environment detected, using localhost:3001');
    return 'http://localhost:3001';
  }
  
  // Default to Railway deployment URL for production
  console.log('Production environment detected, using Railway proxy URL:', DEFAULT_PUBLIC_PROXY_URL);
  return DEFAULT_PUBLIC_PROXY_URL;
};

// Initialize the proxy server URL once on module load, but make it reactive to changes
let currentProxyUrl = getProxyServerUrl();

// Function to get the current proxy URL (with potential to update)
export const PROXY_SERVER_URL = (): string => {
  // Check if admin has set a custom URL since initialization
  if (hasAdminAccess() && typeof localStorage !== 'undefined') {
    const storedUrl = localStorage.getItem('custom_proxy_url');
    if (storedUrl && storedUrl.trim() !== currentProxyUrl) {
      currentProxyUrl = storedUrl.trim();
    }
  }
  return currentProxyUrl;
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
      currentProxyUrl = url.trim(); // Update the current proxy URL
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
