import { Helmet } from "react-helmet-async";

interface Offer {
  price: string;
  priceCurrency: string;
  name: string;
  description?: string;
  url?: string;
  availability?: string;
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  offers?: Offer[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export const ProductSchema = ({
  name,
  description,
  image = "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
  brand = "NurturelyX",
  offers,
  aggregateRating,
}: ProductSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "brand": {
      "@type": "Brand",
      "name": brand,
    },
    ...(offers && {
      "offers": offers.map(offer => ({
        "@type": "Offer",
        "price": offer.price,
        "priceCurrency": offer.priceCurrency,
        "name": offer.name,
        "description": offer.description,
        "url": offer.url || "https://x1.nurturely.io/pricing",
        "availability": offer.availability || "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "NurturelyX",
        },
      })),
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": aggregateRating.bestRating || 5,
        "worstRating": aggregateRating.worstRating || 1,
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
