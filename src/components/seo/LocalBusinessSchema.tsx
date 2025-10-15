import { Helmet } from "react-helmet-async";

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  businessType?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
  areaServed?: string[];
}

export const LocalBusinessSchema = ({
  name,
  description,
  businessType = "ProfessionalService",
  address,
  geo,
  telephone,
  email = "kyle@nurturely.io",
  priceRange,
  openingHours,
  areaServed,
}: LocalBusinessSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": businessType,
    "name": name,
    "description": description,
    "image": "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
    "url": "https://x1.nurturely.io",
    ...(address && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address.streetAddress,
        "addressLocality": address.addressLocality,
        "addressRegion": address.addressRegion,
        "postalCode": address.postalCode,
        "addressCountry": address.addressCountry || "US",
      },
    }),
    ...(geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": geo.latitude,
        "longitude": geo.longitude,
      },
    }),
    ...(telephone && { "telephone": telephone }),
    "email": email,
    ...(priceRange && { "priceRange": priceRange }),
    ...(openingHours && { "openingHoursSpecification": openingHours }),
    ...(areaServed && {
      "areaServed": areaServed.map(area => ({
        "@type": "City",
        "name": area,
      })),
    }),
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales",
      "email": email,
      ...(telephone && { "telephone": telephone }),
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
