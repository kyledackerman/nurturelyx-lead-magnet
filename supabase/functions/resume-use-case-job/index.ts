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

    const { job_id, batch_size = 5, chain = true } = await req.json().catch(() => ({}));
    const maxBatchSize = 6; // Safety limit
    const effectiveBatchSize = Math.min(batch_size, maxBatchSize);

    console.log(`🚀 Resume use case job called: job_id=${job_id}, batch_size=${effectiveBatchSize}, chain=${chain}`);

    // Step 1: Find or create job
    let job;
    if (job_id) {
      const { data, error } = await supabaseClient
        .from('use_case_generation_jobs')
        .select('*')
        .eq('id', job_id)
        .single();
      
      if (error) {
        console.error('Error loading job:', error);
        return new Response(
          JSON.stringify({ error: `Failed to load job: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      job = data;
    } else {
      // Find latest paused or running job
      const { data: existingJobs } = await supabaseClient
        .from('use_case_generation_jobs')
        .select('*')
        .in('status', ['paused', 'running'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingJobs && existingJobs.length > 0) {
        job = existingJobs[0];
      } else {
        // Create new job
        const { count } = await supabaseClient
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .not('extracted_company_name', 'is', null)
          .not('industry', 'is', null)
          .is('personalized_use_cases', null);

        const { data: newJob, error: createError } = await supabaseClient
          .from('use_case_generation_jobs')
          .insert({
            total_count: count || 0,
            processed_count: 0,
            success_count: 0,
            failure_count: 0,
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating job:', createError);
          return new Response(
            JSON.stringify({ error: `Failed to create job: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        job = newJob;
        console.log(`✨ Created new job ${job.id} with ${job.total_count} reports`);
      }
    }

    console.log(`📊 Job ${job.id} status: ${job.status}, processed: ${job.processed_count}/${job.total_count}`);

    // Check if job is paused or completed
    if (job.status === 'paused') {
      console.log('⏸️ Job is paused, not processing');
      return new Response(
        JSON.stringify({
          job_id: job.id,
          status: 'paused',
          processed_count: job.processed_count,
          total_count: job.total_count,
          success_count: job.success_count,
          failure_count: job.failure_count,
          message: 'Job is paused'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status === 'completed') {
      console.log('✅ Job already completed');
      return new Response(
        JSON.stringify({
          job_id: job.id,
          status: 'completed',
          processed_count: job.processed_count,
          total_count: job.total_count,
          success_count: job.success_count,
          failure_count: job.failure_count,
          message: 'Job already completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get next batch of reports to process
    let query = supabaseClient
      .from('reports')
      .select('id, domain, extracted_company_name, industry')
      .not('extracted_company_name', 'is', null)
      .not('industry', 'is', null)
      .is('personalized_use_cases', null)
      .order('created_at', { ascending: false });

    if (job.last_processed_report_id) {
      // Get the created_at of the last processed report to continue after it
      const { data: lastReport } = await supabaseClient
        .from('reports')
        .select('created_at')
        .eq('id', job.last_processed_report_id)
        .single();
      
      if (lastReport) {
        query = query.lt('created_at', lastReport.created_at);
      }
    }

    const { data: reportsToProcess, error: fetchError } = await query.limit(effectiveBatchSize);

    if (fetchError) {
      console.error('Error fetching reports:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch reports: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!reportsToProcess || reportsToProcess.length === 0) {
      // Job complete
      console.log('🎉 No more reports to process, marking job as completed');
      await supabaseClient
        .from('use_case_generation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      return new Response(
        JSON.stringify({
          job_id: job.id,
          status: 'completed',
          processed_count: job.processed_count,
          total_count: job.total_count,
          success_count: job.success_count,
          failure_count: job.failure_count,
          message: 'Job completed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Processing batch of ${reportsToProcess.length} reports`);

    // Step 3: Process each report in the batch
    let batchSuccessCount = 0;
    let batchFailureCount = 0;
    let lastProcessedId = job.last_processed_report_id;

    for (const report of reportsToProcess) {
      // Check if job was paused mid-batch
      const { data: currentJob } = await supabaseClient
        .from('use_case_generation_jobs')
        .select('status')
        .eq('id', job.id)
        .single();

      if (currentJob?.status === 'paused') {
        console.log('⏸️ Job paused during batch processing, stopping');
        break;
      }

      // Try to generate use cases with retry
      let success = false;
      let lastError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          console.log(`🎯 Processing ${report.domain} (${report.extracted_company_name}) - attempt ${attempt + 1}/3`);
          
          const { data, error } = await supabaseClient.functions.invoke('generate-use-cases', {
            body: { report_id: report.id }
          });

          if (error) {
            lastError = error;
            console.error(`❌ Attempt ${attempt + 1} failed for ${report.domain}:`, error);
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // 2s wait before retry
            }
            continue;
          }

          if (data?.error) {
            lastError = data.error;
            console.error(`❌ Attempt ${attempt + 1} returned error for ${report.domain}:`, data.error);
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            continue;
          }

          console.log(`✅ Successfully generated use cases for ${report.domain}`);
          success = true;
          break;
        } catch (err) {
          lastError = err;
          console.error(`❌ Attempt ${attempt + 1} threw exception for ${report.domain}:`, err);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (success) {
        batchSuccessCount++;
      } else {
        batchFailureCount++;
        console.error(`💥 All 3 attempts failed for ${report.domain}:`, lastError);
      }

      lastProcessedId = report.id;

      // Update job progress and heartbeat after each report
      await supabaseClient
        .from('use_case_generation_jobs')
        .update({
          processed_count: job.processed_count + (reportsToProcess.indexOf(report) + 1),
          success_count: job.success_count + batchSuccessCount,
          failure_count: job.failure_count + batchFailureCount,
          last_processed_report_id: lastProcessedId,
          started_at: new Date().toISOString() // Heartbeat
        })
        .eq('id', job.id);

      // Rate limit: 6s between reports
      if (reportsToProcess.indexOf(report) < reportsToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 6000));
      }
    }

    // Update final counts for this batch
    const newProcessedCount = job.processed_count + reportsToProcess.length;
    const newSuccessCount = job.success_count + batchSuccessCount;
    const newFailureCount = job.failure_count + batchFailureCount;

    await supabaseClient
      .from('use_case_generation_jobs')
      .update({
        processed_count: newProcessedCount,
        success_count: newSuccessCount,
        failure_count: newFailureCount,
        last_processed_report_id: lastProcessedId,
        started_at: new Date().toISOString()
      })
      .eq('id', job.id);

    console.log(`📈 Batch complete: +${batchSuccessCount} success, +${batchFailureCount} failed. Total: ${newProcessedCount}/${job.total_count}`);

    // Check if there are more reports to process
    const { count: remainingCount } = await supabaseClient
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .not('extracted_company_name', 'is', null)
      .not('industry', 'is', null)
      .is('personalized_use_cases', null);

    const hasMoreWork = remainingCount && remainingCount > 0;

    // Step 4: Self-chain if needed
    if (chain && hasMoreWork) {
      console.log(`🔗 Chaining to next batch (${remainingCount} reports remaining)`);
      
      // Use waitUntil to continue in background
      const nextInvocation = supabaseClient.functions.invoke('resume-use-case-job', {
        body: {
          job_id: job.id,
          batch_size: effectiveBatchSize,
          chain: true
        }
      });

      // @ts-ignore - EdgeRuntime is available in Supabase edge functions
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(nextInvocation);
      }
    } else if (!hasMoreWork) {
      console.log('🎉 All reports processed, marking job as completed');
      await supabaseClient
        .from('use_case_generation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    return new Response(
      JSON.stringify({
        job_id: job.id,
        status: hasMoreWork ? 'running' : 'completed',
        processed_count: newProcessedCount,
        total_count: job.total_count,
        success_count: newSuccessCount,
        failure_count: newFailureCount,
        last_processed_report_id: lastProcessedId,
        has_more_work: hasMoreWork,
        batch_processed: reportsToProcess.length,
        message: `Processed ${reportsToProcess.length} reports. ${hasMoreWork ? `${remainingCount} remaining.` : 'Job complete.'}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in resume-use-case-job:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
