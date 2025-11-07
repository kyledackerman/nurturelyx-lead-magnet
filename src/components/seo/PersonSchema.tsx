import { Helmet } from "react-helmet-async";

interface PersonSchemaProps {
  name: string;
  jobTitle?: string;
  url?: string;
  image?: string;
  knowsAbout?: string[];
  sameAs?: string[];
  description?: string;
}

export const PersonSchema = ({
  name,
  jobTitle,
  url,
  image,
  knowsAbout,
  sameAs,
  description,
}: PersonSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    ...(jobTitle && { "jobTitle": jobTitle }),
    ...(url && { "url": url }),
    ...(image && { "image": image }),
    ...(description && { "description": description }),
    ...(knowsAbout && { "knowsAbout": knowsAbout }),
    ...(sameAs && { "sameAs": sameAs }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
