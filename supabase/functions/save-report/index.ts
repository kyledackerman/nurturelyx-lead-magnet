import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {
  detectIndustry,
  calculateTrafficTier,
  calculateCompanySize,
  extractCompanyName,
  generateSEOTitle,
  generateSEODescription,
} from '../_shared/categorization.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: 50 requests per 15 minutes per IP
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 50, 15 * 60 * 1000)) {
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { reportData, userId = null } = body;

    // Input validation
    if (!reportData || typeof reportData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!reportData.domain || typeof reportData.domain !== 'string' || reportData.domain.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Valid domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique slug
    const { data: slugData, error: slugError } = await supabase.rpc(
      'generate_report_slug', 
      { domain_name: reportData.domain }
    );

    if (slugError) {
      console.error('Error generating slug:', slugError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report slug' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-categorize the report
    const organicTraffic = reportData.organicTraffic || 0;
    const yearlyRevenueLost = reportData.yearlyRevenueLost || 0;
    
    const industry = detectIndustry(reportData.domain);
    const trafficTier = calculateTrafficTier(organicTraffic);
    const companySize = calculateCompanySize(organicTraffic, yearlyRevenueLost);
    const companyName = extractCompanyName(reportData.domain);
    const seoTitle = generateSEOTitle(companyName, industry, yearlyRevenueLost);
    const seoDescription = generateSEODescription(companyName, industry, organicTraffic, yearlyRevenueLost);

    console.log(`Auto-categorized: ${reportData.domain} → ${industry} (${companySize}, ${trafficTier})`);

    // Save report to database with categorization
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        domain: reportData.domain,
        report_data: reportData,
        slug: slugData,
        is_public: true,
        industry: industry,
        company_size: companySize,
        monthly_traffic_tier: trafficTier,
        seo_title: seoTitle,
        seo_description: seoDescription,
        extracted_company_name: companyName,
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error('Error saving report:', error);
      return new Response(
        JSON.stringify({ error: 'Unable to save report. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-assign prospect to admin who generated the report
    if (userId) {
      try {
        // Check if user is an admin
        const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_uuid: userId });
        
        if (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
        } else if (isAdmin) {
          // Check if report has revenue potential
          const monthlyRevenue = reportData.monthlyRevenueLost || 0;
          const yearlyRevenue = reportData.yearlyRevenueLost || 0;
          
          if (monthlyRevenue > 0 || yearlyRevenue > 0) {
            // Calculate priority based on monthly revenue
            let priority = 'cold';
            if (monthlyRevenue >= 10000) {
              priority = 'hot';
            } else if (monthlyRevenue >= 5000) {
              priority = 'warm';
            }
            
            // Create prospect activity with auto-assignment
            const { error: activityError } = await supabase
              .from('prospect_activities')
              .insert({
                report_id: data.id,
                activity_type: 'assignment',
                assigned_to: userId,
                assigned_by: userId,
                assigned_at: new Date().toISOString(),
                status: 'new',
                priority: priority,
                notes: `Auto-assigned: Report generated with $${monthlyRevenue.toLocaleString()}/month revenue opportunity`
              });
            
            if (activityError) {
              console.error('Error creating prospect activity:', activityError);
              // Non-blocking: continue even if assignment fails
            } else {
              console.log(`Auto-assigned prospect for ${reportData.domain} to admin ${userId} with ${priority} priority`);
            }
          }
        }
      } catch (assignmentError) {
        console.error('Error in auto-assignment:', assignmentError);
        // Non-blocking: continue even if assignment fails
      }
    }

    const publicUrl = `https://x1.nurturely.io/report/${data.slug}`;

    return new Response(
      JSON.stringify({ 
        reportId: data.id, 
        slug: data.slug,
        publicUrl,
        success: true 
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