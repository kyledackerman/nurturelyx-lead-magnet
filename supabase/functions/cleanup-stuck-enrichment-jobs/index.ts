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

    console.log('🧹 Starting cleanup of stuck enrichment jobs...');

    // Find jobs stuck in 'running' status with no updates in 15+ minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: stuckJobs, error: fetchError } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('status', 'running')
      .lt('started_at', fifteenMinutesAgo);

    if (fetchError) {
      throw new Error(`Failed to fetch stuck jobs: ${fetchError.message}`);
    }

    if (!stuckJobs || stuckJobs.length === 0) {
      console.log('✅ No stuck jobs found');
      return new Response(
        JSON.stringify({ 
          message: 'No stuck jobs found',
          cleaned: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${stuckJobs.length} stuck jobs`);

    const cleanedJobs = [];

    for (const job of stuckJobs) {
      console.log(`\n🔧 Cleaning job ${job.id}...`);

      // Get actual progress from enrichment_job_items
      const { data: items, error: itemsError } = await supabase
        .from('enrichment_job_items')
        .select('status, contacts_found')
        .eq('job_id', job.id);

      if (itemsError) {
        console.error(`❌ Error fetching items for job ${job.id}:`, itemsError);
        continue;
      }

      const successCount = items.filter(i => i.status === 'success').length;
      const failedCount = items.filter(i => i.status === 'failed').length;
      const pendingCount = items.filter(i => i.status === 'pending').length;
      const processedCount = successCount + failedCount;
      const totalCount = items.length;

      const isCompleted = pendingCount === 0;
      const newStatus = isCompleted ? 'completed' : 'running';

      console.log(`📊 Job ${job.id} progress: ${processedCount}/${totalCount} (${successCount} success, ${failedCount} failed, ${pendingCount} pending)`);

      // Update the job with actual progress
      const { error: updateError } = await supabase
        .from('enrichment_jobs')
        .update({
          processed_count: processedCount,
          success_count: successCount,
          failed_count: failedCount,
          status: newStatus,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`❌ Error updating job ${job.id}:`, updateError);
        continue;
      }

      console.log(`✅ Updated job ${job.id} to status '${newStatus}'`);
      cleanedJobs.push({
        job_id: job.id,
        processed: processedCount,
        total: totalCount,
        status: newStatus,
      });
    }

    // Release stale locks (older than 10 minutes)
    console.log('\n🔓 Releasing stale locks...');
    const { data: locksReleased, error: lockError } = await supabase
      .from('prospect_activities')
      .update({
        enrichment_locked_at: null,
        enrichment_locked_by: null,
        status: supabase.raw(`
          CASE 
            WHEN status = 'enriching' THEN 'review'
            ELSE status
          END
        `),
      })
      .lt('enrichment_locked_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .select('id');

    if (lockError) {
      console.error('❌ Error releasing locks:', lockError);
    } else {
      console.log(`✅ Released ${locksReleased?.length || 0} stale locks`);
    }

    return new Response(
      JSON.stringify({
        message: `Cleaned ${cleanedJobs.length} stuck jobs`,
        cleaned: cleanedJobs.length,
        jobs: cleanedJobs,
        locksReleased: locksReleased?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
