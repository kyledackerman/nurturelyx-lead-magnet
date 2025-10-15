import { Helmet } from "react-helmet-async";

interface ListItem {
  name: string;
  url: string;
  description?: string;
  image?: string;
}

interface ItemListSchemaProps {
  items: ListItem[];
  listName?: string;
  description?: string;
}

export const ItemListSchema = ({
  items,
  listName = "Items List",
  description,
}: ItemListSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    ...(description && { "description": description }),
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": `https://x1.nurturely.io${item.url}`,
      ...(item.description && { "description": item.description }),
      ...(item.image && {
        "image": {
          "@type": "ImageObject",
          "url": item.image,
        },
      }),
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
