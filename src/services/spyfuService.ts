
// Re-export everything from our modular service files
export { getSpyFuUrl, hasSpyFuApiKey, cleanDomain, isValidDomain } from './api/spyfuConfig';
export { generateFallbackData } from './api/fallbackDataService';
export { fetchDomainData } from './api/domainDataService';

// Re-export calculateReportMetrics from apiService
export { calculateReportMetrics } from './apiService';
