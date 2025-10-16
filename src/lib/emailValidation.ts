// Email validation utility for sales-focused contact enrichment

// ONLY reject legal/compliance and technical bounces for sales outreach
const AVOID_PREFIXES = [
  'legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca',
  'noreply', 'no-reply', 'devnull', 'bounce', 'unsubscribe'
];

const PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com',
  'mail.com', 'yandex.com', 'gmx.com', 'live.com',
  'msn.com', 'me.com', 'mac.com'
];

export interface EmailValidationResult {
  isValid: boolean;
  isPersonal: boolean;
  isGeneric: boolean;
  warning?: string;
  emailType: 'personal' | 'corporate-person' | 'generic' | 'invalid';
}

/**
 * Check if email is legal/privacy/compliance related
 */
export function isLegalEmail(email: string): boolean {
  const localPart = email.split('@')[0]?.toLowerCase() || '';
  const legalPrefixes = ['legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca'];
  
  return legalPrefixes.some(prefix => 
    localPart === prefix || 
    localPart.startsWith(`${prefix}.`) || 
    localPart.startsWith(`${prefix}-`) ||
    localPart.includes(prefix)
  );
}

/**
 * Validates email for sales/marketing focus
 * Accepts: Personal emails, work emails, sales/marketing/support/billing/admin contacts
 * Rejects: ONLY legal/compliance/privacy and technical bounces
 */
export function validateSalesEmail(email: string): EmailValidationResult {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      isPersonal: false,
      isGeneric: false,
      emailType: 'invalid',
      warning: 'Email is required'
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      isPersonal: false,
      isGeneric: false,
      emailType: 'invalid',
      warning: 'Invalid email format'
    };
  }

  // Extract parts
  const [localPart, domain] = trimmedEmail.split('@');
  
  // Check if personal email domain
  const isPersonal = PERSONAL_DOMAINS.includes(domain);
  
  // Check if avoided prefix (non-sales departments)
  const isGeneric = AVOID_PREFIXES.some(prefix => 
    localPart === prefix || localPart.startsWith(`${prefix}.`) || localPart.startsWith(`${prefix}-`)
  );

  // Determine email type and validation
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      isPersonal: false,
      isGeneric: false,
      emailType: 'invalid',
      warning: 'Invalid email format'
    };
  }

  if (isGeneric) {
    return {
      isValid: false,
      isPersonal,
      isGeneric: true,
      emailType: 'generic',
      warning: isLegalEmail(trimmedEmail)
        ? `Legal/compliance email detected (${localPart}@). We avoid legal@, privacy@, compliance@, attorney@ for sales outreach.`
        : `Technical bounce email detected (${localPart}@). Cannot send to noreply@, bounce@, unsubscribe@.`
    };
  }

  if (isPersonal) {
    return {
      isValid: true,
      isPersonal: true,
      isGeneric: false,
      emailType: 'personal',
    };
  }

  // Corporate person-specific email (not generic, not personal domain)
  return {
    isValid: true,
    isPersonal: false,
    isGeneric: false,
    emailType: 'corporate-person',
  };
}

/**
 * Get a user-friendly description of email type
 */
export function getEmailTypeLabel(result: EmailValidationResult): string {
  switch (result.emailType) {
    case 'personal':
      return 'Personal Email';
    case 'corporate-person':
      return 'Work Email';
    case 'generic':
      return 'Avoided Email';
    case 'invalid':
      return 'Invalid Email';
  }
}

/**
 * Get badge color for email type
 */
export function getEmailTypeBadgeVariant(result: EmailValidationResult): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (result.emailType) {
    case 'personal':
      return 'default'; // Green - good for sales
    case 'corporate-person':
      return 'secondary'; // Blue - good for sales
    case 'generic':
      return 'destructive'; // Red - avoid for sales
    case 'invalid':
      return 'outline'; // Gray - invalid
  }
}
