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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { max_domains_to_process } = await req.json();

    if (!max_domains_to_process || max_domains_to_process < 1) {
      return new Response(
        JSON.stringify({ error: 'max_domains_to_process must be at least 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count total "review" prospects available
    const { count, error: countError } = await supabase
      .from('prospect_activities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'review');

    if (countError) {
      console.error('Error counting review prospects:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to count prospects' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalAvailable = count || 0;

    // Create the job record
    const { data: job, error: jobError } = await supabase
      .from('re_enrichment_jobs')
      .insert({
        created_by: user.id,
        total_count: totalAvailable,
        max_domains_to_process: Math.min(max_domains_to_process, totalAvailable),
        status: 'queued',
        current_offset: 0
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Failed to create job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Created re-enrichment job ${job.id} for ${job.max_domains_to_process} prospects (${totalAvailable} total available)`);

    return new Response(
      JSON.stringify({
        job_id: job.id,
        total_available: totalAvailable,
        max_to_process: job.max_domains_to_process,
        status: job.status
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-re-enrichment-job:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
