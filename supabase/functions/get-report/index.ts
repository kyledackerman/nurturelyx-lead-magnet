import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for IP addresses (for privacy)
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const reportId = url.searchParams.get('id');
    const slug = url.searchParams.get('slug');

    if (!reportId && !slug) {
      return new Response(
        JSON.stringify({ error: 'Report ID or slug is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch report from database
    let query = supabase
      .from('reports')
      .select('*')
      .eq('is_public', true);

    if (reportId) {
      query = query.eq('id', reportId);
    } else {
      query = query.eq('slug', slug);
    }

    const { data: report, error } = await query.single();

    if (error || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record view analytics (in background, don't wait)
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || null;
    const sessionId = req.headers.get('x-session-id') || `${Date.now()}-${Math.random()}`;

    // Don't await this - let it run in background
    supabase
      .from('report_views')
      .insert({
        report_id: report.id,
        ip_address_hash: hashIP(clientIP),
        user_agent: userAgent,
        referrer: referrer,
        session_id: sessionId
      })
      .then(() => console.log('View recorded'))
      .catch(err => console.error('Failed to record view:', err));

    return new Response(
      JSON.stringify({ 
        reportData: report.report_data,
        reportId: report.id,
        slug: report.slug,
        createdAt: report.created_at,
        domain: report.domain
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});