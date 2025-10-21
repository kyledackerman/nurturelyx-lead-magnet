import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { isUSADomain, getRejectReason } from '../_shared/domainValidation.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is ambassador
    const { data: isAmbassador } = await supabaseClient.rpc('is_ambassador', { user_uuid: user.id });
    if (!isAmbassador) {
      return new Response(JSON.stringify({ error: 'Ambassador access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { domain, industry_hint, estimated_traffic } = await req.json();

    if (!domain) {
      return new Response(JSON.stringify({ error: 'domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clean and validate domain
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();

    // Validate USA domain
    if (!isUSADomain(cleanDomain)) {
      const rejectReason = getRejectReason(cleanDomain);
      return new Response(JSON.stringify({ error: rejectReason }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get ambassador profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('ambassador_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Ambassador profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Ambassador account is not active' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if domain already exists
    const { data: existingReport, error: reportCheckError } = await supabaseClient
      .from('reports')
      .select('id, slug, prospect_activities!inner(assigned_to, purchased_by_ambassador)')
      .eq('domain', cleanDomain)
      .single();

    if (existingReport) {
      // Domain exists, check if assigned
      const prospect = existingReport.prospect_activities?.[0];
      
      if (prospect?.purchased_by_ambassador) {
        return new Response(
          JSON.stringify({
            error: 'This domain is already assigned to another ambassador',
            alreadyExists: true,
            canPurchase: false,
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            error: 'This domain exists but is unassigned. You can purchase it from the marketplace for $0.01.',
            alreadyExists: true,
            canPurchase: true,
            report_id: existingReport.id,
            purchase_price: 0.01,
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Domain doesn't exist - create new report with simplified data
    const slug = `${cleanDomain}-${Date.now()}`.replace(/[^a-z0-9-]/g, '-');
    
    const reportData = {
      organicTraffic: estimated_traffic || 10000,
      missedLeads: Math.floor((estimated_traffic || 10000) * 0.02),
      identificationRate: 2.0,
      monthlyRevenueLost: Math.floor((estimated_traffic || 10000) * 0.02) * 100,
      yearlyRevenueLost: Math.floor((estimated_traffic || 10000) * 0.02) * 1200,
      averageTransactionValue: 100,
      monthlyRevenueData: [],
    };

    const { data: newReport, error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        domain: cleanDomain,
        slug,
        report_data: reportData,
        user_id: user.id,
        is_public: false,
        industry: industry_hint || null,
        lead_source: 'ambassador_submitted',
      })
      .select()
      .single();

    if (reportError) {
      console.error('Failed to create report:', reportError);
      return new Response(JSON.stringify({ error: 'Failed to create report', details: reportError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create prospect activity - auto-assigned to ambassador
    const { data: prospect, error: prospectError } = await supabaseClient
      .from('prospect_activities')
      .insert({
        report_id: newReport.id,
        activity_type: 'note',
        status: 'new',
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        lead_source: 'ambassador_submitted',
        priority: reportData.missedLeads > 100 ? 'warm' : 'cold',
      })
      .select()
      .single();

    if (prospectError) {
      console.error('Failed to create prospect:', prospectError);
    }

    // Update ambassador profile
    const { error: profileUpdateError } = await supabaseClient
      .from('ambassador_profiles')
      .update({
        active_domains_count: profile.active_domains_count + 1,
        total_signups_lifetime: profile.total_signups_lifetime + 1,
      })
      .eq('user_id', user.id);

    if (profileUpdateError) {
      console.error('Failed to update profile:', profileUpdateError);
    }

    // Log to audit trail
    await supabaseClient.from('audit_logs').insert({
      table_name: 'reports',
      record_id: newReport.id,
      action_type: 'INSERT',
      field_name: 'domain',
      new_value: cleanDomain,
      business_context: `Ambassador submitted new domain: ${cleanDomain} (free assignment)`,
      changed_by: user.id,
    });

    console.log(`Ambassador ${user.id} submitted and was assigned domain ${cleanDomain}`);

    return new Response(
      JSON.stringify({
        success: true,
        report_id: newReport.id,
        prospect_activity_id: prospect?.id,
        domain: cleanDomain,
        assigned: true,
        message: 'Domain submitted and assigned successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in submit-ambassador-domain:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
