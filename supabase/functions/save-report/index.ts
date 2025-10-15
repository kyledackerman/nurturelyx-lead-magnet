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

    // Check if a report already exists for this domain
    const { data: existingReport, error: lookupError } = await supabase
      .from('reports')
      .select('id, slug, report_data, created_at')
      .eq('domain', sanitizedDomain)
      .maybeSingle();

    if (lookupError) {
      console.error('Error checking for existing report:', lookupError);
      // Continue to create new report if lookup fails
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

    // Use existing report or create new one
    let reportId: string;
    let reportSlug: string;

    if (existingReport) {
      console.log(`Reusing existing report for ${sanitizedDomain} (ID: ${existingReport.id})`);
      
      // Update existing report with new data
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update({
          report_data: { ...reportData, domain: sanitizedDomain },
          industry: industry,
          company_size: companySize,
          monthly_traffic_tier: trafficTier,
          seo_title: seoTitle,
          seo_description: seoDescription,
          extracted_company_name: companyName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReport.id)
        .select('id, slug')
        .single();

      if (updateError) {
        console.error('Error updating existing report:', updateError);
        return new Response(
          JSON.stringify({ error: 'Unable to update report. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      reportId = updatedReport.id;
      reportSlug = updatedReport.slug;
    } else {
      console.log(`Creating new report for ${sanitizedDomain}`);
      
      // Generate unique slug only for new reports
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

      // Create new report
      const { data: newReport, error: insertError } = await supabase
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
          lead_source: userId ? 'admin_generated' : 'self_service',
        })
        .select('id, slug')
        .single();

      if (insertError) {
        console.error('Error creating report:', insertError);
        return new Response(
          JSON.stringify({ error: 'Unable to save report. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      reportId = newReport.id;
      reportSlug = newReport.slug;
    }

    // Auto-assign prospect to CRM if report shows lead potential
    try {
      // Check if user is an admin by querying user_roles directly
      let isAdmin = false;
      if (userId) {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .in('role', ['admin', 'super_admin'])
          .maybeSingle();
        
        console.log(`Admin check for user ${userId}: hasAdminRole=${!!userRoles}, error=${rolesError?.message || 'none'}`);
        
        if (rolesError) {
          console.error('Error checking admin status:', rolesError);
        } else {
          isAdmin = !!userRoles;
        }
      }
      
      // Check if report shows lead generation potential
      const missedLeads = Number(reportData.missedLeads) || 0;
      
      console.log(`Checking lead potential: ${missedLeads} missed leads for ${sanitizedDomain} (isAdmin: ${isAdmin}, userId: ${userId})`);
      
      // Create prospect for all reports with lead potential (admin or non-admin)
      if (missedLeads > 0) {
        // Check for existing prospect activity to prevent duplicates
        const { data: existingActivity } = await supabase
          .from('prospect_activities')
          .select('id')
          .eq('report_id', reportId)
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
          
          // Determine lead source: admins creating reports = cold_outbound, everyone else = warm_inbound
          const leadSource = (isAdmin && userId) ? 'cold_outbound' : 'warm_inbound';
          
          // Create prospect activity with auto-assignment
          const { error: activityError } = await supabase
            .from('prospect_activities')
            .insert({
              report_id: reportId,
              activity_type: (isAdmin && userId) ? 'assignment' : 'inbound_self_service',
              assigned_to: userId || null,
              assigned_by: userId || null,
              assigned_at: userId ? new Date().toISOString() : null,
              status: 'new',
              priority: priority,
              lead_source: leadSource,
              notes: (isAdmin && userId)
                ? `Auto-assigned: ~${missedLeads.toLocaleString()} potential leads/month detected${monthlyRevenue > 0 ? ` ($${monthlyRevenue.toLocaleString()}/month opportunity)` : ''}`
                : `🔥 WARM INBOUND: ${userId ? 'Registered user' : 'Visitor'} ran their own report. Saw ${missedLeads} missed leads and $${monthlyRevenue}/mo revenue loss. HIGH INTENT.`
            });
          
          if (activityError) {
            console.error('Error creating prospect activity:', activityError);
            
            // Log to audit trail for visibility
            try {
              await supabase.rpc('log_business_context', {
                p_table_name: 'reports',
                p_record_id: reportId,
                p_context: `Failed to auto-create prospect_activity: ${activityError.message}. Report with ${missedLeads} missed leads was created but not added to CRM.`,
                p_ip_address: null,
                p_user_agent: null,
                p_session_id: null
              });
            } catch (auditError) {
              console.error('Failed to log prospect creation failure:', auditError);
            }
            // Non-blocking: continue even if assignment fails
          } else {
            console.log(`✅ Created prospect for ${sanitizedDomain}: ${missedLeads} leads/month (${priority} priority, source: ${leadSource})`);
          }
        } else {
          console.log(`Skipping prospect creation: prospect activity already exists for report ${reportId}`);
        }
      } else {
        console.log(`Skipping prospect creation: no lead potential (${missedLeads} missed leads)`);
      }
    } catch (assignmentError) {
      console.error('Error in auto-assignment:', assignmentError);
      // Non-blocking: continue even if assignment fails
    }

    const publicUrl = `https://x1.nurturely.io/report/${reportSlug}`;

    return new Response(
      JSON.stringify({ 
        reportId: reportId, 
        slug: reportSlug,
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