import { Helmet } from "react-helmet-async";

interface Review {
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: number;
}

interface AggregateRatingSchemaProps {
  itemName: string;
  itemType?: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
  reviews?: Review[];
}

export const AggregateRatingSchema = ({
  itemName,
  itemType = "Organization",
  ratingValue,
  reviewCount,
  bestRating = 5,
  worstRating = 1,
  reviews,
}: AggregateRatingSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": itemType,
    "name": itemName,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount,
      "bestRating": bestRating,
      "worstRating": worstRating,
    },
    ...(reviews && {
      "review": reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author,
        },
        "datePublished": review.datePublished,
        "reviewBody": review.reviewBody,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.reviewRating,
          "bestRating": bestRating,
          "worstRating": worstRating,
        },
      })),
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
