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

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 300 requests per 15 minutes per IP (generous for read operations)
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 300, 15 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '900'
          } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { reportId, slug } = body;

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
    // Reuse clientIP from rate limiting (already declared above)
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || null;
    const sessionId = req.headers.get('x-session-id') || `${Date.now()}-${Math.random()}`;

    // Record view analytics in background
    (async () => {
      try {
        await supabase
          .from('report_views')
          .insert({
            report_id: report.id,
            page_path: `/report/${report.slug}`,
            page_type: 'report',
            ip_address_hash: hashIP(clientIP),
            user_agent: userAgent,
            referrer: referrer,
            session_id: sessionId
          });
        console.log('View recorded');
      } catch (err) {
        console.error('Failed to record view:', err);
      }
    })();

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