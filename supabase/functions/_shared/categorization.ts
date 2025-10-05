// Shared categorization logic for reports

export const INDUSTRY_KEYWORDS = {
  'hvac': ['hvac', 'heating', 'cooling', 'air-conditioning', 'furnace', 'ac-repair'],
  'plumbing': ['plumbing', 'plumber', 'pipe', 'drain', 'sewer', 'water-heater'],
  'roofing': ['roofing', 'roof', 'gutter', 'shingle'],
  'electrical': ['electric', 'electrical', 'electrician', 'wiring'],
  'automotive': ['auto', 'car', 'vehicle', 'automotive', 'mechanic', 'repair-shop'],
  'legal': ['law', 'legal', 'attorney', 'lawyer', 'firm'],
  'medical': ['medical', 'health', 'doctor', 'clinic', 'dental', 'dentist'],
  'real-estate': ['real-estate', 'realtor', 'realty', 'property', 'homes'],
  'restaurant': ['restaurant', 'cafe', 'diner', 'food', 'pizza', 'burger'],
  'retail': ['shop', 'store', 'retail', 'boutique'],
};

export function detectIndustry(domain: string): string {
  const lowerDomain = domain.toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDomain.includes(keyword))) {
      return industry;
    }
  }
  return 'other';
}

export function calculateTrafficTier(organicTraffic: number): string {
  if (organicTraffic >= 10000) return 'enterprise';
  if (organicTraffic >= 5000) return 'high';
  if (organicTraffic >= 1000) return 'medium';
  return 'low';
}

export function calculateCompanySize(organicTraffic: number, yearlyRevenueLost: number): string {
  if (organicTraffic >= 10000 || yearlyRevenueLost >= 100000) return 'large';
  if (organicTraffic >= 1000 || yearlyRevenueLost >= 25000) return 'medium';
  return 'small';
}

// Clean domain: strip http(s), www, paths, query params, and convert to lowercase
export function cleanDomain(domain: string): string {
  return domain
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '') // Remove paths and query params
    .trim()
    .toLowerCase();
}

export function extractCompanyName(domain: string): string {
  const cleaned = cleanDomain(domain)
    .replace(/\.(com|net|org|io|co|us|ca|uk).*$/, '');
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function generateSEOTitle(companyName: string, industry: string, yearlyRevenueLost: number): string {
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(yearlyRevenueLost);
  
  return `${companyName} is Losing ${formattedRevenue}/Year in Anonymous Traffic | Free Report`;
}

export function generateSEODescription(companyName: string, industry: string, traffic: number, revenueLost: number): string {
  return `Discover how ${companyName} could recover ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(revenueLost)} in lost revenue from ${traffic.toLocaleString()} monthly visitors. Free detailed analysis.`;
}
