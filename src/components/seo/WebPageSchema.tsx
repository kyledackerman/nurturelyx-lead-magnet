import { Helmet } from "react-helmet-async";

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  keywords?: string[];
}

export const WebPageSchema = ({
  name,
  description,
  url,
  breadcrumbs,
  datePublished,
  dateModified,
  image = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
  keywords,
}: WebPageSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url,
    "image": {
      "@type": "ImageObject",
      "url": image,
    },
    "publisher": {
      "@type": "Organization",
      "name": "NurturelyX",
      "logo": {
        "@type": "ImageObject",
        "url": "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
      },
    },
    "isPartOf": {
      "@type": "WebSite",
      "url": "https://x1.nurturely.io",
      "name": "NurturelyX",
    },
    ...(datePublished && { "datePublished": datePublished }),
    ...(dateModified && { "dateModified": dateModified }),
    ...(keywords && { "keywords": keywords.join(", ") }),
    ...(breadcrumbs && {
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `https://x1.nurturely.io${crumb.url}`,
        })),
      },
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
