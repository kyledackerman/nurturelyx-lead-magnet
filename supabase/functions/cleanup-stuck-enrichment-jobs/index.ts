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

    console.log("🧹 Starting cleanup of stuck enrichment jobs...");

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // PHASE 1: Find stuck jobs (running for > 30 minutes)
    const { data: stuckJobs, error: fetchError } = await supabase
      .from('enrichment_jobs')
      .select('id, started_at, total_count, processed_count')
      .eq('status', 'running')
      .lt('started_at', thirtyMinutesAgo);

    if (fetchError) {
      console.error("❌ Error fetching stuck jobs:", fetchError);
      throw fetchError;
    }

    if (!stuckJobs || stuckJobs.length === 0) {
      console.log("✅ No stuck jobs found");
      return new Response(
        JSON.stringify({ 
          message: "No stuck jobs found",
          cleaned: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🔍 Found ${stuckJobs.length} stuck job(s)`);

    let cleaned = 0;

    // PHASE 2: Clean up each stuck job
    for (const job of stuckJobs) {
      const jobAge = Math.round((Date.now() - new Date(job.started_at).getTime()) / 60000);
      console.log(`🧹 Cleaning job ${job.id} (running for ${jobAge} minutes)`);

      // Mark job as failed
      const { error: jobError } = await supabase
        .from('enrichment_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          processed_count: job.total_count
        })
        .eq('id', job.id);

      if (jobError) {
        console.error(`❌ Failed to update job ${job.id}:`, jobError);
        continue;
      }

      // Get all job items for this job
      const { data: jobItems } = await supabase
        .from('enrichment_job_items')
        .select('prospect_id')
        .eq('job_id', job.id);

      if (jobItems && jobItems.length > 0) {
        const prospectIds = jobItems.map(item => item.prospect_id);

        // Release all prospect locks for this job
        const { error: lockError } = await supabase
          .from('prospect_activities')
          .update({
            enrichment_locked_at: null,
            enrichment_locked_by: null
          })
          .in('id', prospectIds)
          .not('enrichment_locked_at', 'is', null);

        if (lockError) {
          console.error(`❌ Failed to release locks for job ${job.id}:`, lockError);
        } else {
          console.log(`✅ Released locks for ${prospectIds.length} prospects`);
        }

        // Mark pending/processing job items as failed
        const { error: itemsError } = await supabase
          .from('enrichment_job_items')
          .update({
            status: 'failed',
            error_message: `Job timed out after ${jobAge} minutes`,
            completed_at: new Date().toISOString()
          })
          .eq('job_id', job.id)
          .in('status', ['pending', 'processing']);

        if (itemsError) {
          console.error(`❌ Failed to update job items for ${job.id}:`, itemsError);
        }
      }

      // Log to audit trail
      await supabase.from('audit_logs').insert({
        table_name: 'enrichment_jobs',
        record_id: job.id,
        action_type: 'UPDATE',
        field_name: 'status',
        old_value: 'running',
        new_value: 'failed',
        business_context: `Auto-cleanup: Job stuck for ${jobAge} minutes - marked as failed`
      });

      cleaned++;
      console.log(`✅ Cleaned job ${job.id}`);
    }

    console.log(`✅ Cleanup complete: ${cleaned} job(s) cleaned`);

    return new Response(
      JSON.stringify({
        message: `Successfully cleaned ${cleaned} stuck job(s)`,
        cleaned,
        jobs: stuckJobs.map(j => ({
          id: j.id,
          started_at: j.started_at,
          processed: j.processed_count,
          total: j.total_count
        }))
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error in cleanup-stuck-enrichment-jobs:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
