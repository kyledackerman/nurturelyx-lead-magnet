import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { job_id } = await req.json();

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🛑 Gracefully stopping enrichment job: ${job_id}`);

    // Get all job items
    const { data: jobItems, error: itemsError } = await supabase
      .from('enrichment_job_items')
      .select('*, prospect_activities!inner(id, status, contact_count, icebreaker_text)')
      .eq('job_id', job_id);

    if (itemsError) throw itemsError;

    let enriched = 0;
    let noContacts = 0;
    let failed = 0;
    let stopped = 0;

    // Process each job item
    for (const item of jobItems || []) {
      const prospectActivity = item.prospect_activities;
      
      if (item.status === 'success') {
        // Already completed - count appropriately
        if (item.has_emails) {
          enriched++;
        } else if (item.contacts_found === 0) {
          noContacts++;
        } else {
          // Has contacts but no accepted emails
          failed++;
        }
      } else if (item.status === 'failed' || item.status === 'rate_limited') {
        failed++;
      } else if (item.status === 'pending' || item.status === 'processing') {
        // Still in progress - stop it
        stopped++;
        
        // Determine appropriate status for the prospect
        let newStatus = 'review';
        
        // Check current state of prospect
        if (prospectActivity.contact_count > 0 && prospectActivity.icebreaker_text) {
          newStatus = 'enriched';
        } else if (prospectActivity.contact_count > 0) {
          newStatus = 'enriching'; // Has contacts but missing emails/icebreaker
        }
        
        // Don't downgrade if already enriched
        if (prospectActivity.status === 'enriched') {
          newStatus = 'enriched';
        }
        
        // Update job item
        await supabase
          .from('enrichment_job_items')
          .update({ 
            status: 'stopped',
            completed_at: new Date().toISOString(),
            error_message: 'Stopped by user'
          })
          .eq('id', item.id);
        
        // Release lock and update prospect status
        await supabase
          .from('prospect_activities')
          .update({
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            status: newStatus
          })
          .eq('id', item.prospect_id);
        
        console.log(`⏸️ Stopped prospect ${item.domain} → ${newStatus}`);
      }
    }

    // Update job status to completed (stopped by user)
    await supabase
      .from('enrichment_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', job_id);

    // Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'enrichment_jobs',
      record_id: job_id,
      action_type: 'UPDATE',
      field_name: 'status',
      old_value: 'running',
      new_value: 'completed',
      business_context: `User stopped enrichment gracefully. Results: ${enriched} enriched, ${noContacts} no contacts, ${failed} failed, ${stopped} stopped mid-process`
    });

    const summary = {
      jobId: job_id,
      enriched,
      noContacts,
      failed,
      stopped,
      total: enriched + noContacts + failed + stopped
    };

    console.log(`✅ Job stopped gracefully:`, summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in graceful-stop-enrichment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
