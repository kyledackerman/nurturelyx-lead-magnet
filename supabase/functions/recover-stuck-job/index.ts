import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Recovering stuck job ${jobId}...`);

    // Get the job details
    const { data: job, error: jobError } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all job items
    const { data: items, error: itemsError } = await supabase
      .from('enrichment_job_items')
      .select('*')
      .eq('job_id', jobId);

    if (itemsError) {
      throw new Error(`Failed to fetch job items: ${itemsError.message}`);
    }

    // Find prospects that need reprocessing (pending or failed, not already successful)
    const itemsToReprocess = items.filter(
      item => item.status === 'pending' || item.status === 'failed'
    );

    const alreadySuccessful = items.filter(item => item.status === 'success').length;

    console.log(`📊 Job ${jobId}: ${alreadySuccessful} already successful, ${itemsToReprocess.length} need reprocessing`);

    if (itemsToReprocess.length === 0) {
      // All items already processed successfully
      await supabase
        .from('enrichment_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({
          message: 'Job already completed, nothing to recover',
          alreadySuccessful,
          needsReprocessing: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Release locks on prospects that need reprocessing
    for (const item of itemsToReprocess) {
      if (item.prospect_id) {
        await supabase
          .from('prospect_activities')
          .update({
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            status: 'new', // Reset to new for retry
          })
          .eq('id', item.prospect_id);

        // Reset item status to pending
        await supabase
          .from('enrichment_job_items')
          .update({
            status: 'pending',
            started_at: null,
            completed_at: null,
            error_message: null,
          })
          .eq('id', item.id);
      }
    }

    // Update job status to running
    await supabase
      .from('enrichment_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`✅ Job ${jobId} recovered: ${itemsToReprocess.length} prospects reset for reprocessing`);

    // Trigger the bulk enrichment to resume
    const { error: resumeError } = await supabase.functions.invoke('bulk-enrich-prospects', {
      body: {
        jobId,
        resuming: true,
      },
    });

    if (resumeError) {
      console.error('⚠️ Failed to resume enrichment:', resumeError);
    }

    return new Response(
      JSON.stringify({
        message: `Job recovered successfully`,
        jobId,
        alreadySuccessful,
        needsReprocessing: itemsToReprocess.length,
        resumed: !resumeError,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in recover-stuck-job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
