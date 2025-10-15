/**
 * SEO utility functions for generating structured data and meta content
 */

/**
 * Generate a canonical URL from a relative path
 */
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = "https://x1.nurturely.io";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Truncate text to a specific length for meta descriptions
 */
export const truncateDescription = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + "...";
};

/**
 * Generate keywords from an array of strings
 */
export const generateKeywords = (keywords: string[]): string => {
  return keywords.join(", ");
};

/**
 * Format date to ISO 8601 format for structured data
 */
export const formatDateISO = (date: Date | string): string => {
  if (typeof date === "string") {
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

/**
 * Generate breadcrumb items from a path
 */
export const generateBreadcrumbs = (
  pathname: string
): Array<{ name: string; url: string }> => {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ name: string; url: string }> = [];

  paths.forEach((path, index) => {
    const url = `/${paths.slice(0, index + 1).join("/")}`;
    const name = path
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({ name, url });
  });

  return breadcrumbs;
};

/**
 * Generate Open Graph image URL
 */
export const generateOgImageUrl = (
  title?: string,
  description?: string
): string => {
  // Default OG image
  const defaultImage = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png";
  
  // You could implement dynamic OG image generation here
  // For now, return the default image
  return defaultImage;
};

/**
 * Calculate estimated reading time from text content
 */
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Extract plain text from HTML content
 */
export const extractPlainText = (html: string): string => {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

/**
 * Generate schema-safe description (remove special characters that might break JSON)
 */
export const sanitizeForSchema = (text: string): string => {
  return text
    .replace(/[\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();
};

/**
 * Check if URL is absolute
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return /^https?:\/\//i.test(url);
};

/**
 * Convert relative URL to absolute
 */
export const toAbsoluteUrl = (url: string): string => {
  if (isAbsoluteUrl(url)) return url;
  return generateCanonicalUrl(url);
};
