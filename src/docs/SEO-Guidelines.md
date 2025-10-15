# SEO Implementation Guidelines

This document outlines the comprehensive SEO implementation across the NurturelyX platform. Follow these guidelines when creating new pages or updating existing ones.

## Core SEO Components

All SEO components are located in `src/components/seo/`:

### 1. MetaTags Component
Universal meta tag component that handles all essential meta tags:
- Title and description
- Canonical URL
- Keywords
- Open Graph tags (og:title, og:description, og:image, etc.)
- Twitter Card tags
- Robots directives
- Author information

**Usage:**
```tsx
<MetaTags
  title="Your Page Title | NurturelyX"
  description="Page description between 150-160 characters"
  canonical="https://x1.nurturely.io/your-page"
  keywords="keyword1, keyword2, keyword3"
  ogType="website"
  ogImage="https://x1.nurturely.io/image.png"
/>
```

### 2. Structured Data Schemas

#### OrganizationSchema
Site-wide organization information. Include on every page (typically in App.tsx or layout).

#### ServiceSchema
For pages describing services:
```tsx
<ServiceSchema
  name="Service Name"
  description="Service description"
  serviceType="Business Service"
  areaServed={["United States", "Canada"]}
/>
```

#### ProductSchema
For pricing or product pages:
```tsx
<ProductSchema
  name="Product Name"
  description="Product description"
  offers={[
    {
      price: "100",
      priceCurrency: "USD",
      name: "Plan Name",
      description: "Plan description"
    }
  ]}
/>
```

#### WebPageSchema
For all pages to provide general page context:
```tsx
<WebPageSchema
  name="Page Name"
  description="Page description"
  url="https://x1.nurturely.io/page"
  breadcrumbs={[{ name: "Page", url: "/page" }]}
  keywords={["keyword1", "keyword2"]}
/>
```

#### HowToSchema
For instructional/process pages:
```tsx
<HowToSchema
  name="How to Do Something"
  description="Process description"
  steps={[
    { name: "Step 1", text: "Step description" },
    { name: "Step 2", text: "Step description" }
  ]}
/>
```

#### ItemListSchema
For pages with lists (blog index, report lists, etc.):
```tsx
<ItemListSchema
  items={[
    { name: "Item 1", url: "/item-1", description: "Description" },
    { name: "Item 2", url: "/item-2", description: "Description" }
  ]}
  listName="List Name"
/>
```

#### FAQSchema
For pages with FAQ sections:
```tsx
<FAQSchema
  questions={[
    { question: "Question?", answer: "Answer" },
    { question: "Question 2?", answer: "Answer 2" }
  ]}
/>
```

#### LocalBusinessSchema
For industry-specific pages targeting local markets:
```tsx
<LocalBusinessSchema
  name="Business Name"
  description="Business description"
  businessType="ProfessionalService"
  areaServed={["City1", "City2"]}
/>
```

#### ArticleSchema
For blog posts and articles:
```tsx
<ArticleSchema
  title="Article Title"
  description="Article description"
  publishedAt="2024-01-01"
  author="NurturelyX"
  url="https://x1.nurturely.io/blog/article"
  category="Lead Generation"
/>
```

#### BreadcrumbSchema
For pages deep in the site hierarchy:
```tsx
<BreadcrumbSchema
  items={[
    { name: "Home", url: "/" },
    { name: "Category", url: "/category" },
    { name: "Page", url: "/category/page" }
  ]}
/>
```

## Required Elements for Every Page

### 1. Meta Tags (CRITICAL)
```tsx
<MetaTags
  title="Unique Page Title | NurturelyX"
  description="Compelling 150-160 character description"
  canonical="https://x1.nurturely.io/page-url"
  keywords="relevant, keywords, here"
  ogType="website"
/>
```

### 2. At Least One Schema Type
Choose the most relevant schema(s) for your page:
- Homepage: ServiceSchema + WebPageSchema
- Product/Pricing: ProductSchema + WebPageSchema
- How-to pages: HowToSchema + ServiceSchema
- Blog posts: ArticleSchema + WebPageSchema
- List pages: ItemListSchema + WebPageSchema
- Industry pages: ServiceSchema + LocalBusinessSchema + WebPageSchema

### 3. Breadcrumbs
Visual breadcrumbs for navigation + BreadcrumbSchema for SEO:
```tsx
<Breadcrumb items={[
  { label: "Category", href: "/category" },
  { label: "Page", href: "/category/page" }
]} />
```

### 4. Semantic HTML
```tsx
<main role="main" itemScope itemType="https://schema.org/WebPage">
  <article>
    <h1>Single H1 per page</h1>
    <section>
      <h2>Logical heading hierarchy</h2>
      <h3>Subheadings</h3>
    </section>
  </article>
</main>
```

### 5. Proper Heading Hierarchy
- **One H1** per page (the main page title)
- **H2s** for major sections
- **H3s** for subsections
- Never skip levels (H1 → H3 without H2)

### 6. Image Optimization
```tsx
<img 
  src="image.png" 
  alt="Descriptive alt text with keywords"
  loading="lazy"
  width="800"
  height="600"
/>
```

## SEO Utility Functions

Located in `src/lib/seoUtils.ts` and `src/lib/metaUtils.ts`:

### seoUtils.ts
- `generateCanonicalUrl(path)` - Create full canonical URLs
- `truncateDescription(text, maxLength)` - Truncate descriptions
- `generateKeywords(keywords[])` - Format keywords
- `formatDateISO(date)` - Format dates for schemas
- `generateBreadcrumbs(pathname)` - Auto-generate breadcrumbs
- `calculateReadingTime(text)` - Calculate blog post reading time

### metaUtils.ts
- `generateTitle(pageTitle, includeSiteName)` - Consistent title formatting
- `generateDescription(description, maxLength)` - Optimize descriptions
- `pageMetadata` - Pre-built metadata templates for common pages
- `generateRobots(options)` - Create robots meta content

## Page Type Templates

### Homepage Template
```tsx
import { MetaTags } from "@/components/seo/MetaTags";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";

<MetaTags
  title="Main Keyword | NurturelyX"
  description="Compelling description with keywords"
  canonical="https://x1.nurturely.io/"
  keywords="primary, keywords, here"
/>
<ServiceSchema name="Service" description="Description" />
<WebPageSchema name="Page" description="Description" url="/" />
<OrganizationSchema />
```

### Blog Post Template
```tsx
import { MetaTags } from "@/components/seo/MetaTags";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";

<MetaTags
  title="Article Title | NurturelyX Blog"
  description="Article summary"
  canonical="https://x1.nurturely.io/blog/article-slug"
  ogType="article"
  publishedTime="2024-01-01"
/>
<ArticleSchema title="..." publishedAt="..." />
<BreadcrumbSchema items={[...]} />
<Breadcrumb items={[...]} />
```

### Industry Page Template
```tsx
import { MetaTags } from "@/components/seo/MetaTags";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";

<MetaTags title="Industry Solutions" ... />
<ServiceSchema name="Industry-Specific Service" ... />
<LocalBusinessSchema businessType="ProfessionalService" ... />
<FAQSchema questions={faqItems} />
<WebPageSchema ... />
```

## Featured Snippet Optimization

To optimize for featured snippets:

### Question Format
```tsx
<section>
  <h2>What is visitor identification?</h2>
  <p>Visitor identification is... [40-60 word direct answer]</p>
  <p>[Additional details and context]</p>
</section>
```

### List Format
```tsx
<h2>How to identify website visitors:</h2>
<ol>
  <li><strong>Install tracking pixel</strong> - Description</li>
  <li><strong>Collect visitor data</strong> - Description</li>
  <li><strong>Match identities</strong> - Description</li>
</ol>
```

### Table Format
```tsx
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
      <th>Benefit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Real-time tracking</td>
      <td>Instant visitor data</td>
      <td>Faster lead response</td>
    </tr>
  </tbody>
</table>
```

## Testing & Validation

After implementing SEO, always test with:

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test all schema types

2. **Schema Markup Validator**
   - https://validator.schema.org/
   - Validate JSON-LD schemas

3. **PageSpeed Insights**
   - Check SEO score
   - Verify meta tags are present

4. **Google Search Console**
   - Monitor indexing
   - Check for errors

## Common Mistakes to Avoid

❌ **Don't:**
- Use multiple H1 tags per page
- Skip heading levels (H1 → H3)
- Use generic descriptions like "Welcome to our site"
- Forget canonical URLs
- Use duplicate titles across pages
- Leave images without alt text
- Forget to add schemas
- Use inline styles instead of semantic HTML

✅ **Do:**
- Use one H1 per page with primary keyword
- Create unique, compelling titles for each page
- Write descriptive meta descriptions 150-160 chars
- Include all relevant schema types
- Add breadcrumbs to all deep pages
- Use semantic HTML5 elements
- Optimize images with descriptive alt text
- Keep keywords natural and relevant

## SEO Checklist for New Pages

- [ ] MetaTags component with all fields
- [ ] Canonical URL specified
- [ ] At least one relevant schema type
- [ ] Breadcrumbs (visual + schema)
- [ ] Single H1 tag with primary keyword
- [ ] Logical heading hierarchy (H2, H3, etc.)
- [ ] Semantic HTML structure
- [ ] Alt text on all images
- [ ] Internal links to related pages
- [ ] Mobile-responsive design
- [ ] Fast page load time
- [ ] Tested in Google Rich Results Test

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
