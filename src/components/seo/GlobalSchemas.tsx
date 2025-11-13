import { OrganizationSchema } from "./OrganizationSchema";

/**
 * Global SEO schemas that should appear on every page
 * Include this component in all page layouts
 */
export const GlobalSchemas = () => {
  return (
    <>
      <OrganizationSchema />
    </>
  );
};
