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

    // PHASE 3: Smarter prospect status restoration
    // Fetch original status before enrichment for pending items
    const pendingProspectIds = (jobItems || [])
      .filter(item => item.status === 'pending')
      .map(item => item.prospect_id);
    
    // Get original statuses from audit logs (most recent status BEFORE enrichment started)
    const { data: originalStatuses } = await supabase
      .from('audit_logs')
      .select('record_id, old_value')
      .eq('table_name', 'prospect_activities')
      .eq('field_name', 'status')
      .eq('new_value', 'enriching')
      .in('record_id', pendingProspectIds)
      .order('changed_at', { ascending: false });
    
    const originalStatusMap = new Map(
      (originalStatuses || []).map(log => [log.record_id, log.old_value || 'new'])
    );

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
      } else if (item.status === 'pending') {
        // PHASE 3: Never started processing - restore original status
        stopped++;
        const originalStatus = originalStatusMap.get(item.prospect_id) || 'new';
        
        // Update job item as stopped
        await supabase
          .from('enrichment_job_items')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: 'Stopped before processing started'
          })
          .eq('id', item.id);
        
        // Restore original status (don't increment retry count - never attempted)
        await supabase
          .from('prospect_activities')
          .update({
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            status: originalStatus
          })
          .eq('id', item.prospect_id);
        
        console.log(`⏸️ Stopped ${item.domain} (pending) → restored to '${originalStatus}'`);
        
      } else if (item.status === 'processing') {
        // PHASE 3: Started but not finished - be smart about status
        stopped++;
        
        let newStatus: string;
        let shouldIncrementRetry = true;
        
        // Check what data we collected so far
        if (prospectActivity.contact_count > 0 && prospectActivity.icebreaker_text) {
          // Has valid email + icebreaker = fully enriched
          newStatus = 'enriched';
          shouldIncrementRetry = false; // Don't penalize - it worked
        } else if (prospectActivity.contact_count > 0) {
          // Has contacts but no valid email = keep as enriching for retry
          newStatus = 'enriching';
          shouldIncrementRetry = false; // Can retry later
        } else {
          // No contacts found = terminal failure
          newStatus = 'review';
          shouldIncrementRetry = true; // Increment retry count
        }
        
        // Update job item
        await supabase
          .from('enrichment_job_items')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: 'Stopped during processing'
          })
          .eq('id', item.id);
        
        // Update prospect
        const updateData: any = {
          enrichment_locked_at: null,
          enrichment_locked_by: null,
          status: newStatus
        };
        
        if (shouldIncrementRetry) {
          updateData.enrichment_retry_count = (prospectActivity.enrichment_retry_count || 0) + 1;
        }
        
        await supabase
          .from('prospect_activities')
          .update(updateData)
          .eq('id', item.prospect_id);
        
        console.log(`⏸️ Stopped ${item.domain} (processing) → ${newStatus}${shouldIncrementRetry ? ' (retry++)' : ''}`);
      }
    }

    // PHASE 3: Update job status to completed with stopped_reason
    await supabase
      .from('enrichment_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stopped_reason: 'user_requested'
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
