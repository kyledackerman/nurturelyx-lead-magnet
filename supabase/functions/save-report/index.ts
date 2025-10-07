import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {
  detectIndustry,
  calculateTrafficTier,
  calculateCompanySize,
  extractCompanyName,
  generateSEOTitle,
  generateSEODescription,
  cleanDomain,
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

    // Clean domain to prevent duplicates (strip http/https, www, paths)
    const sanitizedDomain = cleanDomain(reportData.domain);

    // Generate unique slug
    const { data: slugData, error: slugError } = await supabase.rpc(
      'generate_report_slug', 
      { domain_name: sanitizedDomain }
    );

    if (slugError) {
      console.error('Error generating slug:', slugError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate report slug' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auto-categorize the report using sanitized domain
    const organicTraffic = reportData.organicTraffic || 0;
    const yearlyRevenueLost = reportData.yearlyRevenueLost || 0;
    
    const industry = detectIndustry(sanitizedDomain);
    const trafficTier = calculateTrafficTier(organicTraffic);
    const companySize = calculateCompanySize(organicTraffic, yearlyRevenueLost);
    const companyName = extractCompanyName(sanitizedDomain);
    const seoTitle = generateSEOTitle(companyName, industry, yearlyRevenueLost);
    const seoDescription = generateSEODescription(companyName, industry, organicTraffic, yearlyRevenueLost);

    console.log(`Auto-categorized: ${sanitizedDomain} → ${industry} (${companySize}, ${trafficTier})`);

    // Save report to database with categorization using sanitized domain
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        domain: sanitizedDomain,
        report_data: { ...reportData, domain: sanitizedDomain },
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

    // Auto-assign prospect to CRM if report shows lead potential
    if (userId) {
      try {
        // Check if user is an admin
        const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_uuid: userId });
        
        console.log(`Admin check for user ${userId}: isAdmin=${isAdmin}, error=${adminCheckError?.message || 'none'}`);
        
        if (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError);
        } else if (isAdmin) {
          // Check if report shows lead generation potential
          const missedLeads = Number(reportData.missedLeads) || 0;
          
          console.log(`Checking lead potential: ${missedLeads} missed leads for ${sanitizedDomain}`);
          
          if (missedLeads > 0) {
            // Check for existing prospect activity to prevent duplicates
            const { data: existingActivity } = await supabase
              .from('prospect_activities')
              .select('id')
              .eq('report_id', data.id)
              .maybeSingle();
            
            if (!existingActivity) {
              // Calculate priority based on lead volume
              let priority = 'cold';
              if (missedLeads >= 1000) {
                priority = 'hot';
              } else if (missedLeads >= 500) {
                priority = 'warm';
              }
              
              const monthlyRevenue = reportData.monthlyRevenueLost || 0;
              
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
                  notes: `Auto-assigned: ~${missedLeads.toLocaleString()} potential leads/month detected${monthlyRevenue > 0 ? ` ($${monthlyRevenue.toLocaleString()}/month opportunity)` : ''}`
                });
              
              if (activityError) {
                console.error('Error creating prospect activity:', activityError);
                // Non-blocking: continue even if assignment fails
              } else {
                console.log(`✅ Auto-assigned prospect for ${sanitizedDomain}: ${missedLeads} leads/month (${priority} priority)`);
              }
            } else {
              console.log(`Skipping auto-assignment: prospect activity already exists for report ${data.id}`);
            }
          } else {
            console.log(`Skipping auto-assignment: no lead potential (${missedLeads} missed leads)`);
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