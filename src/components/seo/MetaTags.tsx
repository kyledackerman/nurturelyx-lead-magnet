import { Helmet } from "react-helmet-async";

interface MetaTagsProps {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;
  preconnect?: string[];
  dnsPrefetch?: string[];
}

export const MetaTags = ({
  title,
  description,
  canonical,
  keywords,
  ogType = "website",
  ogImage = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
  ogTitle,
  ogDescription,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  author = "NurturelyX",
  publishedTime,
  modifiedTime,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  preconnect = [],
  dnsPrefetch = [],
}: MetaTagsProps) => {
  return (
    <Helmet>
      {/* Resource hints for performance */}
      {preconnect.map((url) => (
        <link key={`preconnect-${url}`} rel="preconnect" href={url} />
      ))}
      {dnsPrefetch.map((url) => (
        <link key={`dns-prefetch-${url}`} rel="dns-prefetch" href={url} />
      ))}
      
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="NurturelyX" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific OG tags */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      <meta name="twitter:site" content="@nurturelyx" />
      <meta name="twitter:creator" content="@nurturelyx" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#0EA5E9" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    </Helmet>
  );
};
