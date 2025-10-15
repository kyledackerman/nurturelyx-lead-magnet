/**
 * Meta tag generation utilities for consistent SEO implementation
 */

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generate title with site name
 */
export const generateTitle = (pageTitle: string, includeSiteName: boolean = true): string => {
  const siteName = "NurturelyX";
  if (!includeSiteName) return pageTitle;
  return `${pageTitle} | ${siteName}`;
};

/**
 * Generate meta description with optimal length
 */
export const generateDescription = (description: string, maxLength: number = 160): string => {
  if (description.length <= maxLength) return description;
  
  // Try to cut at a sentence or word boundary
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastPeriod > maxLength - 50) {
    return description.substring(0, lastPeriod + 1);
  }
  
  if (lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
};

/**
 * Common page metadata templates
 */
export const pageMetadata = {
  home: (): PageMetadata => ({
    title: generateTitle("Identify Anonymous Website Visitors | Lost Revenue Calculator", false),
    description: "Calculate how much revenue you're losing from anonymous website traffic. Identify visitors, capture leads, and convert them into customers with NurturelyX.",
    keywords: [
      "website visitor identification",
      "anonymous traffic tracking",
      "lead generation",
      "B2B lead generation",
      "visitor identification software",
      "lost revenue calculator",
      "website analytics",
      "identity resolution",
    ],
    canonical: "https://x1.nurturely.io/",
    type: "website",
  }),

  pricing: (): PageMetadata => ({
    title: generateTitle("Pricing - Transparent Identity Resolution Platform"),
    description: "Simple, transparent pricing for visitor identification. Pay only for identified leads. No hidden fees, no monthly minimums. Calculate your ROI today.",
    keywords: [
      "visitor identification pricing",
      "lead generation pricing",
      "identity resolution cost",
      "B2B lead pricing",
      "website visitor tracking cost",
    ],
    canonical: "https://x1.nurturely.io/pricing",
    type: "website",
  }),

  howItWorks: (): PageMetadata => ({
    title: generateTitle("How It Works - Visitor Identification Technology"),
    description: "Learn how NurturelyX identifies anonymous website visitors, captures their contact information, and converts them into qualified leads for your business.",
    keywords: [
      "how visitor identification works",
      "website tracking technology",
      "identity resolution process",
      "lead generation technology",
      "visitor tracking system",
    ],
    canonical: "https://x1.nurturely.io/how-it-works",
    type: "website",
  }),

  blog: (): PageMetadata => ({
    title: generateTitle("Blog - Lead Generation & Visitor Identification Insights"),
    description: "Expert insights on B2B lead generation, visitor identification, sales strategies, and marketing best practices. Learn how to convert anonymous traffic into customers.",
    keywords: [
      "lead generation blog",
      "B2B marketing blog",
      "visitor identification insights",
      "sales strategies",
      "marketing best practices",
    ],
    canonical: "https://x1.nurturely.io/blog",
    type: "website",
  }),

  learn: (): PageMetadata => ({
    title: generateTitle("Learn - Complete Guide to Visitor Identification"),
    description: "Comprehensive guides and resources on visitor identification, lead generation, and converting anonymous website traffic into qualified B2B leads.",
    keywords: [
      "visitor identification guide",
      "lead generation resources",
      "B2B lead generation guide",
      "website visitor tracking guide",
    ],
    canonical: "https://x1.nurturely.io/learn",
    type: "website",
  }),

  industry: (industryName: string): PageMetadata => ({
    title: generateTitle(`${industryName} Lead Generation & Visitor Identification`),
    description: `Identify anonymous website visitors in the ${industryName} industry. Turn lost traffic into qualified leads with industry-specific solutions.`,
    keywords: [
      `${industryName} lead generation`,
      `${industryName} visitor identification`,
      `${industryName} marketing`,
      `${industryName} sales leads`,
      `B2B ${industryName}`,
    ],
    canonical: `https://x1.nurturely.io/industries/${industryName.toLowerCase().replace(/\s+/g, "-")}`,
    type: "website",
  }),
};

/**
 * Generate robots meta content based on page type
 */
export const generateRobots = (options: {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
}): string => {
  const { index = true, follow = true, noarchive = false, nosnippet = false } = options;
  
  const directives = [
    index ? "index" : "noindex",
    follow ? "follow" : "nofollow",
    "max-image-preview:large",
    "max-snippet:-1",
    "max-video-preview:-1",
  ];
  
  if (noarchive) directives.push("noarchive");
  if (nosnippet) directives.push("nosnippet");
  
  return directives.join(", ");
};

/**
 * Validate and clean meta description
 */
export const cleanDescription = (description: string): string => {
  return description
    .replace(/[\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim();
};

/**
 * Generate JSON-LD safe text
 */
export const toJsonLdSafe = (text: string): string => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
};
