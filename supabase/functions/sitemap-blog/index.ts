import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

// Blog posts data - manually maintained list
// This mirrors the structure from src/data/blogPosts.ts
const blogPosts = [
  { slug: "identity-graphs-ai-personalization-2025", publishedAt: "2025-02-15" },
  { slug: "signal-loss-cookieless-identity-resolution-2025", publishedAt: "2025-02-20" },
  { slug: "omnichannel-identity-unified-lead-nurturing", publishedAt: "2025-02-25" },
  { slug: "website-ghost-traffic-hidden-leads-identity-resolution", publishedAt: "2025-02-28" },
  { slug: "identity-resolution-attribution-ai-marketing-campaigns", publishedAt: "2025-03-01" },
  { slug: "what-is-identity-resolution", publishedAt: "2024-01-15" },
  { slug: "identify-anonymous-website-visitors", publishedAt: "2024-02-01" },
  { slug: "visitor-identification-software-guide", publishedAt: "2024-02-15" },
  { slug: "website-visitor-tracking-analytics", publishedAt: "2024-03-01" },
  { slug: "b2b-lead-generation-strategies", publishedAt: "2024-03-15" },
  { slug: "marketing-attribution-models", publishedAt: "2024-04-01" },
  { slug: "conversion-rate-optimization-tips", publishedAt: "2024-04-15" },
  { slug: "sales-pipeline-optimization", publishedAt: "2024-05-01" },
  { slug: "customer-data-platform-guide", publishedAt: "2024-05-15" },
  { slug: "privacy-compliant-tracking", publishedAt: "2024-06-01" },
  { slug: "first-party-data-strategies", publishedAt: "2024-06-15" },
  { slug: "account-based-marketing-tactics", publishedAt: "2024-07-01" },
  { slug: "predictive-lead-scoring", publishedAt: "2024-07-15" },
  { slug: "intent-data-prospecting", publishedAt: "2024-08-01" },
  { slug: "revenue-attribution-analysis", publishedAt: "2024-08-15" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://x1.nurturely.io';

    // Generate URLs for each blog post
    const urlEntries = blogPosts.map(post => {
      return `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.publishedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('\n');

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    console.log(`Generated blog sitemap with ${blogPosts.length} posts`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
