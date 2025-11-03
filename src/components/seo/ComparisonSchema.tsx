import { Helmet } from "react-helmet-async";

interface ComparisonItem {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface ComparisonSchemaProps {
  items: ComparisonItem[];
}

export const ComparisonSchema = ({ items }: ComparisonSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        "description": item.description,
        "review": {
          "@type": "Review",
          "author": {
            "@type": "Organization",
            "name": "NurturelyX"
          },
          "reviewBody": `Pros: ${item.pros.join(", ")}. Cons: ${item.cons.join(", ")}`,
        }
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
