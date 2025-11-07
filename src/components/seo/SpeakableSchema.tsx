import { Helmet } from "react-helmet-async";

interface SpeakableSchemaProps {
  cssSelectors?: string[];
  xpaths?: string[];
}

export const SpeakableSchema = ({
  cssSelectors = [".prose h2", ".prose h3", ".key-takeaways"],
  xpaths,
}: SpeakableSchemaProps) => {
  const speakable: any = {
    "@type": "SpeakableSpecification",
  };

  if (cssSelectors && cssSelectors.length > 0) {
    speakable.cssSelector = cssSelectors;
  }

  if (xpaths && xpaths.length > 0) {
    speakable.xpath = xpaths;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "speakable": speakable,
        })}
      </script>
    </Helmet>
  );
};
