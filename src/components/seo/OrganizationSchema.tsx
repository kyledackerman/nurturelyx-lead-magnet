import { Helmet } from "react-helmet-async";

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NurturelyX",
    "url": "https://x1.nurturely.io",
    "logo": "https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png",
    "description": "Identify anonymous website visitors and turn them into qualified B2B leads. Recover lost revenue with visitor identification technology.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales",
      "email": "kyle@nurturely.io"
    },
    "sameAs": [
      "https://www.linkedin.com/company/nurturelyx"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
