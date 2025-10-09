import { cn } from "./utils";

// Phase 3.5: Extract duplicate badge functions and utilities

export function getPriorityBadgeClass(priority: string): string {
  const variants: Record<string, string> = {
    hot: "bg-orange-600 text-white border-orange-400",
    warm: "bg-accent text-black border-accent",
    cold: "bg-gray-600 text-white border-gray-400",
    not_viable: "bg-gray-700 text-gray-300 line-through border-gray-500",
  };
  
  return cn("outline", variants[priority] || "bg-gray-500 text-white border-gray-400");
}

export function getStatusBadgeClass(status: string): string {
  const variants: Record<string, string> = {
    new: "bg-brand-purple text-white border-brand-purple",
    enriching: "bg-purple-500 text-white border-purple-400",
    review: "bg-orange-500 text-white border-orange-400",
    enriched: "bg-green-500 text-white border-green-400",
    contacted: "bg-accent text-black border-accent",
    interested: "bg-yellow-500 text-white border-yellow-400",
    qualified: "bg-yellow-500 text-white border-yellow-400", // Legacy status
    proposal: "bg-blue-600 text-white border-blue-400",
    closed_won: "bg-green-600 text-white border-green-400",
    closed_lost: "bg-red-600 text-white border-red-400",
    not_viable: "bg-gray-700 text-gray-300 border-gray-500 line-through",
  };
  
  return cn("outline", variants[status] || "bg-gray-500 text-white border-gray-400");
}

export function formatStatusText(status: string): string {
  return status.replace(/_/g, " ");
}

export function formatCRMCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function getTrafficTier(traffic: number): string {
  if (traffic < 10000) return "low";
  if (traffic < 100000) return "medium";
  if (traffic < 500000) return "high";
  return "enterprise";
}

export function getTrafficTierValue(tier: string): number {
  const values: Record<string, number> = { 
    low: 1, 
    medium: 2, 
    high: 3, 
    enterprise: 4 
  };
  return values[tier] || 0;
}

export function getPriorityValue(priority: string): number {
  const values: Record<string, number> = { 
    not_viable: 0, 
    cold: 1, 
    warm: 2, 
    hot: 3 
  };
  return values[priority] || 0;
}

export function getStatusValue(status: string): number {
  const values: Record<string, number> = { 
    new: 1, 
    enriching: 2, 
    review: 3,
    enriched: 4, 
    contacted: 5, 
    proposal: 6, 
    closed_won: 7, 
    closed_lost: 8, 
    not_viable: 9 
  };
  return values[status] || 0;
}

export function getDisplayName(
  companyName: string | null | undefined,
  firstName: string,
  lastName: string | null,
  email: string | null
): string {
  // If we have a company name, check if the contact name is just the company name
  if (companyName) {
    const fullContactName = `${firstName} ${lastName || ''}`.trim();
    const normalizedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedContact = fullContactName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // If contact name contains the company name, it's likely a generic contact
    if (normalizedContact.includes(normalizedCompany) || normalizedCompany.includes(normalizedContact)) {
      return companyName;
    }
  }
  
  // Check if email suggests this is a generic contact
  if (email) {
    const emailPrefix = email.split('@')[0].toLowerCase();
    const genericPrefixes = ['info', 'contact', 'sales', 'support', 'hello', 'team', 'admin', 'help', 'marketing'];
    
    if (genericPrefixes.some(prefix => emailPrefix === prefix || emailPrefix.startsWith(prefix))) {
      // Generic email - use company name if available
      return companyName || `${firstName} ${lastName || ''}`.trim();
    }
  }
  
  // Looks like a real person - use their name
  return `${firstName} ${lastName || ''}`.trim();
}
