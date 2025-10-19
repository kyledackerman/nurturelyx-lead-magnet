import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    console.log('Starting cleanup of stuck use case generation jobs...');

    // Find jobs with status='running' that haven't been updated in 10+ minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: stuckJobs, error: fetchError } = await supabaseClient
      .from('use_case_generation_jobs')
      .select('*')
      .eq('status', 'running')
      .lt('started_at', tenMinutesAgo);

    if (fetchError) {
      console.error('Error fetching stuck jobs:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch stuck jobs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!stuckJobs || stuckJobs.length === 0) {
      console.log('No stuck jobs found');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No stuck jobs found',
          cleanedJobs: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${stuckJobs.length} stuck jobs, marking as paused...`);

    // Mark each stuck job as 'paused'
    for (const job of stuckJobs) {
      const { error: updateError } = await supabaseClient
        .from('use_case_generation_jobs')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`Error updating job ${job.id}:`, updateError);
      } else {
        console.log(`Marked job ${job.id} as paused (was inactive for 10+ minutes)`);

        // Log to audit trail
        await supabaseClient
          .from('audit_logs')
          .insert({
            table_name: 'use_case_generation_jobs',
            record_id: job.id,
            action_type: 'UPDATE',
            field_name: 'status',
            old_value: 'running',
            new_value: 'paused',
            business_context: `Auto-paused stuck job: inactive for 10+ minutes. Processed ${job.processed_count}/${job.total_count} reports.`
          });
      }
    }

    console.log('Cleanup complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${stuckJobs.length} stuck job(s)`,
        cleanedJobs: stuckJobs.length,
        jobs: stuckJobs.map(j => ({
          id: j.id,
          processed_count: j.processed_count,
          total_count: j.total_count,
          started_at: j.started_at
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-stuck-use-case-jobs:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
