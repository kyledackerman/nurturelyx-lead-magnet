import { z } from "zod";
import DOMPurify from "dompurify";

// Domain validation schema
export const domainSchema = z
  .string()
  .trim()
  .min(1, "Domain is required")
  .max(255, "Domain must be less than 255 characters")
  .refine(
    (domain) => {
      // Allow "ping" for connection testing
      if (domain === "ping") return true;
      
      // Basic domain validation - must have at least one dot and valid characters
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
      return domainRegex.test(domain);
    },
    { message: "Please enter a valid domain name" }
  );

// Calculator form validation schema
export const calculatorFormSchema = z.object({
  domain: domainSchema,
  monthlyVisitors: z.number().min(0, "Monthly visitors must be 0 or greater").optional(),
  organicTrafficManual: z.number().min(0, "Organic traffic must be 0 or greater").optional(),
  avgTransactionValue: z.number().min(0.01, "Transaction value must be greater than zero"),
  isUnsurePaid: z.boolean(),
  isUnsureOrganic: z.boolean(),
}).refine(
  (data) => {
    // If user is sure about paid traffic, require monthlyVisitors
    if (!data.isUnsurePaid && (!data.monthlyVisitors || data.monthlyVisitors <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide monthly paid visitors or check 'Not sure'",
    path: ["monthlyVisitors"],
  }
).refine(
  (data) => {
    // If user is sure about organic traffic, require organicTrafficManual
    if (!data.isUnsureOrganic && (!data.organicTrafficManual || data.organicTrafficManual <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide organic traffic or check 'Not sure'",
    path: ["organicTrafficManual"],
  }
);

// Auth form validation schemas
export const authEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .email("Please enter a valid email address")
  .toLowerCase();

export const authPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  );

export const signUpSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const signInSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required"),
});

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim();
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

// Domain cleaning with sanitization
export const cleanAndValidateDomain = (domain: string): string => {
  const sanitized = sanitizeInput(domain);
  
  if (sanitized === "ping") return sanitized;

  // Clean domain format
  return sanitized
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "") // Remove paths
    .trim()
    .toLowerCase();
};
