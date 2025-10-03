import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get count of public reports for sitemap index
    const { count, error } = await supabaseClient
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching report count:', error);
    }

    const baseUrl = 'https://x1.nurturely.io';
    const now = new Date().toISOString();

    // Generate sitemap index XML
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://x1.nurturely.io/sitemap-reports</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    console.log(`Generated sitemap index with ${count || 0} reports`);

    return new Response(sitemapIndex, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
