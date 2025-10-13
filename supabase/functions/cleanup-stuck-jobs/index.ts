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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { jobId } = await req.json();
    const TIMEOUT_MINUTES = 10;

    console.log(`Checking job ${jobId} for timeout...`);

    // Fetch the job
    const { data: job, error: jobError } = await supabaseClient
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if job is stuck (processing status but no update in TIMEOUT_MINUTES)
    const lastUpdate = new Date(job.last_updated_at);
    const now = new Date();
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    if (job.status === 'processing' && minutesSinceUpdate > TIMEOUT_MINUTES) {
      console.log(`Job ${jobId} is frozen (${minutesSinceUpdate.toFixed(1)} minutes since last update)`);

      // Update job to failed with timeout error
      const errorLog = Array.isArray(job.error_log) ? job.error_log : [];
      errorLog.push({
        row: 'system',
        domain: 'system',
        error: `Job timed out after ${minutesSinceUpdate.toFixed(1)} minutes of inactivity`
      });

      await supabaseClient
        .from('import_jobs')
        .update({
          status: 'failed',
          completed_at: now.toISOString(),
          error_log: errorLog,
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          action: 'marked_failed',
          message: `Job marked as failed due to ${minutesSinceUpdate.toFixed(1)} minutes of inactivity` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: 'no_action_needed',
        message: `Job is ${job.status} and last updated ${minutesSinceUpdate.toFixed(1)} minutes ago` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup-stuck-jobs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
