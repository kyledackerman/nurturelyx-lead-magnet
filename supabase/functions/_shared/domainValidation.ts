// Domain validation utility for blocking international domains
// Only allows USA domains (.com, .net, .org, .io, .co, .us)
// Rejects international country-code TLDs and gov/edu/mil

// Comprehensive list of international TLDs to block
const BLOCKED_TLDS = [
  // UK
  '.uk', '.co.uk', '.org.uk', '.ac.uk', '.gov.uk', '.sch.uk',
  
  // Australia
  '.au', '.com.au', '.net.au', '.org.au', '.gov.au', '.edu.au',
  
  // Canada
  '.ca',
  
  // European Union
  '.eu',
  
  // Western Europe
  '.de', '.fr', '.nl', '.be', '.es', '.it', '.ch', '.at', 
  '.se', '.no', '.dk', '.fi', '.ie', '.pt', '.gr', '.pl', '.cz', '.ro',
  
  // Eastern Europe
  '.ru', '.ua', '.by', '.lt', '.lv', '.ee', '.bg', '.hr', '.rs', '.si',
  
  // Asia
  '.jp', '.cn', '.in', '.sg', '.hk', '.kr', '.tw', '.my', '.th', '.id', '.ph', '.vn',
  
  // Middle East
  '.ae', '.sa', '.il', '.tr',
  
  // Latin America
  '.mx', '.br', '.ar', '.cl', '.co', '.pe', '.ve',
  
  // Africa
  '.za', '.ng', '.eg', '.ke',
  
  // Oceania
  '.nz',
  
  // Educational/Government (not viable for B2B)
  '.edu', '.gov', '.mil', '.ac',
];

// Allowed USA-focused TLDs
const ALLOWED_TLDS = [
  '.com',    // International but commonly used by US businesses
  '.net',    // International but commonly used by US businesses
  '.org',    // International but commonly used by US nonprofits
  '.io',     // International but commonly used by US startups
  '.co',     // International but commonly used by US businesses
  '.us',     // Official US TLD
];

/**
 * Checks if a domain is USA-based (allowed for processing)
 * @param domain - The domain to check (e.g., "example.com" or "https://www.example.co.uk")
 * @returns true if domain is allowed, false if it should be rejected
 */
export function isUSADomain(domain: string): boolean {
  // Clean the domain first (remove protocol, www, paths)
  const cleanedDomain = domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '')
    .trim();
  
  // Check if domain ends with any blocked TLD
  for (const tld of BLOCKED_TLDS) {
    if (cleanedDomain.endsWith(tld)) {
      return false;
    }
  }
  
  // If domain doesn't match any blocked TLD, check if it's an allowed TLD
  // This handles edge cases where domain might have unusual TLD
  const hasAllowedTld = ALLOWED_TLDS.some(tld => cleanedDomain.endsWith(tld));
  
  // If it has an allowed TLD, accept it
  // If it doesn't match any allowed TLD, be safe and reject it
  return hasAllowedTld;
}

/**
 * Gets a human-readable rejection reason for a non-USA domain
 * @param domain - The domain that was rejected
 * @returns A descriptive error message
 */
export function getRejectReason(domain: string): string {
  const cleanedDomain = domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '')
    .trim();
  
  // Find which TLD caused the rejection
  for (const tld of BLOCKED_TLDS) {
    if (cleanedDomain.endsWith(tld)) {
      // Special messages for different categories
      if (['.edu', '.gov', '.mil', '.ac'].includes(tld)) {
        return `Cannot process ${tld} domains (government/educational institutions)`;
      }
      
      const countryMap: Record<string, string> = {
        '.uk': 'United Kingdom',
        '.co.uk': 'United Kingdom',
        '.au': 'Australia',
        '.com.au': 'Australia',
        '.ca': 'Canada',
        '.de': 'Germany',
        '.fr': 'France',
        '.jp': 'Japan',
        '.cn': 'China',
        '.in': 'India',
      };
      
      const country = countryMap[tld] || 'international';
      return `Cannot process ${tld} domains (${country} - only USA domains accepted)`;
    }
  }
  
  return 'Domain TLD not recognized as USA-based (only .com, .net, .org, .io, .co, .us accepted)';
}

/**
 * Extracts the TLD from a domain for logging purposes
 * @param domain - The domain to extract TLD from
 * @returns The TLD (e.g., ".co.uk", ".com")
 */
export function extractTLD(domain: string): string {
  const cleanedDomain = domain
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '')
    .trim();
  
  // Check for multi-level TLDs first (.co.uk, .com.au, etc.)
  const parts = cleanedDomain.split('.');
  if (parts.length >= 3) {
    const twoLevelTld = '.' + parts.slice(-2).join('.');
    if (BLOCKED_TLDS.includes(twoLevelTld)) {
      return twoLevelTld;
    }
  }
  
  // Single-level TLD
  if (parts.length >= 2) {
    return '.' + parts[parts.length - 1];
  }
  
  return '.unknown';
}
