import { Helmet } from "react-helmet-async";

interface ArticleSchemaProps {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  authorUrl?: string;
  authorJobTitle?: string;
  url: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  category: string;
  wordCount?: number;
  timeRequired?: string;
  abstract?: string;
  seriesName?: string;
  seriesUrl?: string;
}

export const ArticleSchema = ({ 
  title, 
  description, 
  publishedAt, 
  updatedAt,
  author,
  authorUrl,
  authorJobTitle,
  url,
  imageUrl,
  imageWidth = 1200,
  imageHeight = 630,
  category,
  wordCount,
  timeRequired,
  abstract,
  seriesName,
  seriesUrl,
}: ArticleSchemaProps) => {
  const defaultImage = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png";
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": imageUrl || defaultImage,
      "width": imageWidth,
      "height": imageHeight,
      "caption": title,
    },
    "datePublished": publishedAt,
    "dateModified": updatedAt || publishedAt,
    "author": {
      "@type": "Person",
      "name": author,
      ...(authorUrl && { "url": authorUrl }),
      ...(authorJobTitle && { "jobTitle": authorJobTitle }),
    },
    "publisher": {
      "@type": "Organization",
      "name": "NurturelyX",
      "logo": {
        "@type": "ImageObject",
        "url": defaultImage,
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": category,
    ...(wordCount && { "wordCount": wordCount }),
    ...(timeRequired && { "timeRequired": timeRequired }),
    ...(abstract && { "abstract": abstract }),
    "url": url
  };

  // Add series information if available
  if (seriesName && seriesUrl) {
    schema.isPartOf = {
      "@type": "CreativeWorkSeries",
      "name": seriesName,
      "url": seriesUrl,
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
