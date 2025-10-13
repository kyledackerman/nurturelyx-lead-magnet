import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 50;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== RESTART IMPORT JOB INVOKED ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jobId } = await req.json();
    
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Restarting job: ${jobId}`);

    // Fetch the job
    const { data: job, error: fetchError } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      console.error('Job not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Cannot restart a completed job' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Job current state: ${job.status}, processed: ${job.processed_rows}/${job.total_rows}`);

    // Calculate current batch based on processed rows
    const currentBatch = Math.ceil(job.processed_rows / BATCH_SIZE);
    
    // Update the job to queued status and append restart log entry
    const restartLogEntry = {
      timestamp: new Date().toISOString(),
      row: 'system',
      domain: 'system',
      error: `Manual restart requested - resuming from row ${job.processed_rows + 1}`
    };

    const updatedErrorLog = Array.isArray(job.error_log) 
      ? [...job.error_log, restartLogEntry]
      : [restartLogEntry];

    const { error: updateError } = await supabase
      .from('import_jobs')
      .update({
        status: 'queued',
        last_updated_at: new Date().toISOString(),
        current_batch: currentBatch,
        error_log: updatedErrorLog
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update job:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update job status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Job updated to queued, batch ${currentBatch}. Invoking process-import-batch...`);

    // Invoke process-import-batch asynchronously (fire-and-forget)
    // We don't await the result because the function is long-running and will timeout
    supabase.functions.invoke('process-import-batch', {
      body: { jobId }
    }).then(result => {
      console.log('Batch processor invoked, result:', result.data ? 'success' : result.error);
    }).catch(err => {
      console.log('Batch processor invocation completed with timeout (expected for long-running jobs):', err.message);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Job restarted successfully, resuming from row ${job.processed_rows + 1}`,
        resumeRow: job.processed_rows + 1
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Restart job error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
