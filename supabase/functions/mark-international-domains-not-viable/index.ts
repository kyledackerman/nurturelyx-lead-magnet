import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { isUSADomain, getRejectReason, extractTLD } from "../_shared/domainValidation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userResult, error: userError } = await supabase.auth.getUser(jwt);
    const user = userResult?.user;

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_uuid: user.id });

    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🌍 Starting international domain cleanup...');

    // Get all reports with international domains
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, domain');

    if (reportsError) {
      throw new Error(`Failed to fetch reports: ${reportsError.message}`);
    }

    let processedCount = 0;
    let markedNotViableCount = 0;
    const internationalDomains: Array<{domain: string, tld: string, reason: string}> = [];

    // Check each domain
    for (const report of reports || []) {
      processedCount++;
      
      if (!isUSADomain(report.domain)) {
        const tld = extractTLD(report.domain);
        const reason = getRejectReason(report.domain);
        
        console.log(`⊘ Marking ${report.domain} as not_viable (${tld})`);
        internationalDomains.push({ domain: report.domain, tld, reason });
        
        // Find prospect activities for this report
        const { data: prospects } = await supabase
          .from('prospect_activities')
          .select('id, status')
          .eq('report_id', report.id);
        
        // Update prospect activities to not_viable (only if not already closed)
        if (prospects && prospects.length > 0) {
          for (const prospect of prospects) {
            // Don't override closed_won or already not_viable
            if (prospect.status !== 'closed_won' && prospect.status !== 'not_viable') {
              await supabase
                .from('prospect_activities')
                .update({
                  status: 'not_viable',
                  lost_reason: 'international_domain',
                  lost_notes: reason
                })
                .eq('id', prospect.id);
              
              // Log to audit trail
              await supabase
                .from('audit_logs')
                .insert({
                  table_name: 'prospect_activities',
                  record_id: prospect.id,
                  action_type: 'UPDATE',
                  field_name: 'status',
                  old_value: prospect.status,
                  new_value: 'not_viable',
                  business_context: `Automatic cleanup: International domain rejected (${tld}) - ${reason}`,
                  changed_by: user.id
                });
              
              markedNotViableCount++;
            }
          }
        }
      }
      
      // Log progress every 100 domains
      if (processedCount % 100 === 0) {
        console.log(`Progress: ${processedCount} domains processed, ${markedNotViableCount} marked not viable`);
      }
    }

    console.log('✅ Cleanup complete!');
    console.log(`Total processed: ${processedCount}`);
    console.log(`Marked not viable: ${markedNotViableCount}`);
    console.log(`International domains found: ${internationalDomains.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalProcessed: processedCount,
          markedNotViable: markedNotViableCount,
          internationalDomainsFound: internationalDomains.length
        },
        internationalDomains: internationalDomains.slice(0, 100) // Return first 100 for review
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mark-international-domains-not-viable:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
