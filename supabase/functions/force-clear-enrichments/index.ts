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

    console.log('🔥 FORCE CLEARING ALL ENRICHMENTS...');

    // 1. Set ALL running enrichment jobs to failed
    const { data: failedJobs, error: jobsError } = await supabase
      .from('enrichment_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
      })
      .eq('status', 'running')
      .select('id');

    if (jobsError) {
      console.error('❌ Error failing jobs:', jobsError);
    } else {
      console.log(`✅ Set ${failedJobs?.length || 0} running jobs to failed`);
    }

    // 2. Release ALL locks on prospect_activities (but preserve their statuses)
    const { data: unlockedProspects, error: unlockError } = await supabase
      .from('prospect_activities')
      .update({
        enrichment_locked_at: null,
        enrichment_locked_by: null,
      })
      .not('enrichment_locked_at', 'is', null)
      .select('id');

    if (unlockError) {
      console.error('❌ Error unlocking prospects:', unlockError);
    } else {
      console.log(`✅ Released locks on ${unlockedProspects?.length || 0} prospects`);
    }

    // 3. Log the safe emergency stop
    await supabase.from('audit_logs').insert({
      table_name: 'enrichment_jobs',
      record_id: '00000000-0000-0000-0000-000000000000',
      action_type: 'EMERGENCY_STOP',
      business_context: `Safe emergency stop: ${failedJobs?.length || 0} jobs failed, ${unlockedProspects?.length || 0} locks released (statuses preserved)`,
      changed_by: null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emergency stop complete (safe - statuses preserved)',
        jobsFailed: failedJobs?.length || 0,
        locksReleased: unlockedProspects?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Emergency cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
