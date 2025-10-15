import { Helmet } from "react-helmet-async";

interface ServiceSchemaProps {
  name: string;
  description: string;
  serviceType?: string;
  areaServed?: string | string[];
  provider?: {
    name: string;
    url?: string;
  };
  offers?: {
    price?: string;
    priceCurrency?: string;
    description?: string;
    url?: string;
  };
}

export const ServiceSchema = ({
  name,
  description,
  serviceType = "Professional Service",
  areaServed = "United States",
  provider = { name: "NurturelyX", url: "https://x1.nurturely.io" },
  offers,
}: ServiceSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "serviceType": serviceType,
    "provider": {
      "@type": "Organization",
      "name": provider.name,
      "url": provider.url || "https://x1.nurturely.io",
    },
    "areaServed": Array.isArray(areaServed)
      ? areaServed.map(area => ({
          "@type": "Country",
          "name": area,
        }))
      : {
          "@type": "Country",
          "name": areaServed,
        },
    ...(offers && {
      "offers": {
        "@type": "Offer",
        "price": offers.price,
        "priceCurrency": offers.priceCurrency || "USD",
        "description": offers.description,
        "url": offers.url,
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
