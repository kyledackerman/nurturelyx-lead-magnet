import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Auto-enrichment started...');

    // Step 1: Query prospects that need enrichment (status='enriching', contact_count=0, retry_count<3)
    const { data: prospectsToEnrich, error: queryError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        enrichment_locked_at,
        enrichment_locked_by,
        enrichment_retry_count,
        reports!inner(domain, slug, extracted_company_name)
      `)
      .eq('status', 'enriching')
      .eq('contact_count', 0)
      .lt('enrichment_retry_count', 3)
      .order('updated_at', { ascending: true })
      .limit(15);

    if (queryError) {
      console.error('Error querying prospects:', queryError);
      throw queryError;
    }

    if (!prospectsToEnrich || prospectsToEnrich.length === 0) {
      console.log('✅ No prospects need enrichment');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No prospects need enrichment',
          processed: 0,
          queued: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${prospectsToEnrich.length} prospects to enrich`);

    // Step 2: Acquire locks and enrich prospects
    let queued = 0;
    let skipped = 0;
    const enrichmentPromises: Promise<any>[] = [];

    for (const prospect of prospectsToEnrich) {
      const domain = prospect.reports.domain;
      
      // Skip if already locked (another process is handling it)
      if (prospect.enrichment_locked_at && prospect.enrichment_locked_by) {
        const lockAge = Date.now() - new Date(prospect.enrichment_locked_at).getTime();
        if (lockAge < 10 * 60 * 1000) { // Less than 10 minutes old
          console.log(`⏭️  Skipping ${domain} (locked by ${prospect.enrichment_locked_by})`);
          skipped++;
          continue;
        }
      }

      // Try to acquire lock
      const { data: lockAcquired, error: lockError } = await supabase.rpc(
        'acquire_enrichment_lock',
        { 
          p_prospect_id: prospect.id,
          p_source: 'auto-enrichment'
        }
      );

      if (lockError || !lockAcquired) {
        console.log(`⏭️  Could not acquire lock for ${domain}`);
        skipped++;
        continue;
      }

      console.log(`🔒 Acquired lock for ${domain}, queuing enrichment...`);
      queued++;

      // Call enrich-single-prospect function asynchronously
      const enrichPromise = supabase.functions.invoke('enrich-single-prospect', {
        body: { prospect_id: prospect.id }
      }).then(result => {
        if (result.error) {
          console.error(`❌ Error enriching ${domain}:`, result.error);
        } else {
          console.log(`✅ Completed enrichment for ${domain}`);
        }
        return result;
      });

      enrichmentPromises.push(enrichPromise);
    }

    console.log(`📊 Summary: ${queued} queued, ${skipped} skipped`);

    // Return immediately without waiting for enrichments to complete
    // (enrichments run in background)
    return new Response(
      JSON.stringify({
        success: true,
        message: `Started enrichment for ${queued} prospects`,
        processed: prospectsToEnrich.length,
        queued,
        skipped
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Auto-enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
