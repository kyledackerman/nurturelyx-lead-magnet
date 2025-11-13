import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { prospect_id, batch_size = 1, offset = 0 } = await req.json();

    let prospectsToProcess: any[] = [];

    // Single prospect mode
    if (prospect_id) {
      const { data, error } = await supabaseClient
        .from('prospect_activities')
        .select(`
          id,
          report_id,
          status,
          enrichment_retry_count,
          reports!inner(domain, extracted_company_name)
        `)
        .eq('id', prospect_id)
        .eq('status', 'review')
        .lt('enrichment_retry_count', 3)
        .single();

      if (error) throw error;
      if (data) prospectsToProcess = [data];
    } 
    // Batch mode
    else {
      const { data, error } = await supabaseClient
        .from('prospect_activities')
        .select(`
          id,
          report_id,
          status,
          enrichment_retry_count,
          reports!inner(domain, extracted_company_name)
        `)
        .eq('status', 'review')
        .lt('enrichment_retry_count', 3)
        .order('created_at', { ascending: true })
        .range(offset, offset + batch_size - 1);

      if (error) throw error;
      prospectsToProcess = data || [];
    }

    if (prospectsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ 
          enriched: 0, 
          failed: 0, 
          marked_not_viable: 0,
          message: 'No prospects to process'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let enriched = 0;
    let failed = 0;
    let marked_not_viable = 0;
    const results: any[] = [];

    // Process each prospect one-by-one
    for (const prospect of prospectsToProcess) {
      const domain = prospect.reports?.domain || 'unknown';
      console.log(`Processing ${domain} (prospect_id: ${prospect.id})`);

      try {
        // Update last enrichment attempt
        await supabaseClient
          .from('prospect_activities')
          .update({ last_enrichment_attempt: new Date().toISOString() })
          .eq('id', prospect.id);

        // Call the proven enrich-single-prospect function
        const { data: enrichData, error: enrichError } = await supabaseClient.functions.invoke(
          'enrich-single-prospect',
          { body: { prospect_id: prospect.id } }
        );

        if (enrichError) {
          // Check for quota/rate limit errors
          if (enrichError.message?.includes('429') || enrichError.message?.includes('rate limit')) {
            console.error(`Rate limit hit for ${domain}`);
            results.push({ domain, status: 'rate_limit', error: enrichError.message });
            return new Response(
              JSON.stringify({ 
                error: 'RATE_LIMIT_EXCEEDED',
                code: 429,
                message: 'Rate limit exceeded. Please wait before continuing.',
                enriched,
                failed,
                marked_not_viable,
                results
              }),
              { 
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          if (enrichError.message?.includes('402') || enrichError.message?.includes('credits')) {
            console.error(`Credits exhausted for ${domain}`);
            results.push({ domain, status: 'no_credits', error: enrichError.message });
            return new Response(
              JSON.stringify({ 
                error: 'CREDITS_EXHAUSTED',
                code: 402,
                message: 'AI credits exhausted. Please add credits to your workspace.',
                enriched,
                failed,
                marked_not_viable,
                results
              }),
              { 
                status: 402,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          // Regular enrichment failure - increment retry count
          console.error(`Enrichment failed for ${domain}:`, enrichError);
          await supabaseClient
            .from('prospect_activities')
            .update({ 
              enrichment_retry_count: prospect.enrichment_retry_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', prospect.id);

          failed++;
          results.push({ domain, status: 'failed', error: enrichError.message });
          continue;
        }

        // Check final status
        const { data: updatedProspect } = await supabaseClient
          .from('prospect_activities')
          .select('status')
          .eq('id', prospect.id)
          .single();

        if (updatedProspect?.status === 'not_viable') {
          marked_not_viable++;
          results.push({ domain, status: 'not_viable' });
        } else if (updatedProspect?.status === 'enriched') {
          enriched++;
          results.push({ domain, status: 'enriched' });
        } else {
          // Still in enriching or review
          results.push({ domain, status: updatedProspect?.status || 'unknown' });
        }

        console.log(`✓ Processed ${domain}: ${updatedProspect?.status}`);

        // Delay between prospects to avoid rate limits
        if (prospectsToProcess.indexOf(prospect) < prospectsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (error) {
        console.error(`Exception processing ${domain}:`, error);
        failed++;
        results.push({ 
          domain, 
          status: 'exception', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        enriched,
        failed,
        marked_not_viable,
        processed: prospectsToProcess.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Re-enrich function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        enriched: 0,
        failed: 0,
        marked_not_viable: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
