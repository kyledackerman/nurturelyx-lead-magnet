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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin access
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { csvData, fileName } = await req.json();
    console.log(`Queueing import job for admin ${user.id}: ${fileName}`);

    // Parse CSV and validate
    const rows = csvData.split('\n').map((line: string) => line.trim()).filter(Boolean);
    const headers = rows[0].split(',').map((h: string) => h.trim().toLowerCase());
    
    // Validate headers
    const requiredHeaders = ['domain', 'avg_transaction_value'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required columns: ${missingHeaders.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dataRows = rows.slice(1);
    const totalRows = dataRows.length;
    const batchSize = 50;
    const totalBatches = Math.ceil(totalRows / batchSize);

    // Create job record
    const { data: job, error: jobError } = await supabaseClient
      .from('import_jobs')
      .insert({
        created_by: user.id,
        file_name: fileName,
        total_rows: totalRows,
        total_batches: totalBatches,
        csv_data: csvData,
        status: 'queued',
      })
      .select('id, total_rows, total_batches')
      .single();

    if (jobError) {
      console.error('Failed to create import job:', jobError);
      return new Response(
        JSON.stringify({ error: `Failed to queue job: ${jobError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Job ${job.id} queued with ${totalRows} rows (${totalBatches} batches)`);

    // Trigger background processing without blocking
    supabaseClient.functions
      .invoke('process-import-batch', {
        body: { jobId: job.id },
      })
      .catch((err) => console.error('Background processing failed:', err));

    // Return job details immediately
    return new Response(
      JSON.stringify({
        jobId: job.id,
        totalRows: job.total_rows,
        totalBatches: job.total_batches,
        status: 'queued',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Import failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
