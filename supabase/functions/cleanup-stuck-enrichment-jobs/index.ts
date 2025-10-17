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

    console.log('🧹 Starting prospect-centric cleanup (locks + terminal classification)...');

    // Phase 1: Release stale locks (10+ minutes old OR last attempt 15+ minutes ago)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: locksReleased, error: lockError } = await supabase
      .from('prospect_activities')
      .update({
        enrichment_locked_at: null,
        enrichment_locked_by: null,
      })
      .or(`enrichment_locked_at.lt.${tenMinutesAgo},last_enrichment_attempt.lt.${fifteenMinutesAgo}`)
      .not('enrichment_locked_at', 'is', null)
      .select('id, domain:reports!inner(domain)');

    if (lockError) {
      console.error('❌ Error releasing locks:', lockError);
    } else {
      console.log(`🔓 Released ${locksReleased?.length || 0} stale locks`);
    }

    // Phase 2: Terminalize prospects at retry_count >= 1
    // Get prospects that have been attempted once but aren't terminalized
    const { data: terminalCandidates, error: terminalError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        status,
        enrichment_retry_count,
        contact_count,
        reports!inner(domain)
      `)
      .gte('enrichment_retry_count', 1)
      .in('status', ['enriching', 'review']);

    if (terminalError) {
      console.error('❌ Error fetching terminal candidates:', terminalError);
    }

    let enrichedCount = 0;
    let reviewCount = 0;
    let missingEmailsCount = 0;

    if (terminalCandidates && terminalCandidates.length > 0) {
      console.log(`🔍 Processing ${terminalCandidates.length} prospects at retry cap...`);

      for (const prospect of terminalCandidates) {
        const domain = prospect.reports?.domain || 'unknown';
        
        // Check if prospect has contacts with accepted emails
        const { data: contacts } = await supabase
          .from('prospect_contacts')
          .select('email')
          .eq('prospect_activity_id', prospect.id);

        const hasAcceptedEmails = contacts?.some(c => {
          if (!c.email || c.email.trim() === '') return false;
          const localPart = c.email.split('@')[0]?.toLowerCase();
          const domain = c.email.split('@')[1]?.toLowerCase();
          return !(
            ['legal','privacy','compliance','counsel','attorney','law','dmca'].some(prefix => localPart === prefix || localPart.includes(prefix)) ||
            /\.(gov|edu|mil)$/.test(domain)
          );
        });

        let targetStatus = prospect.status;
        let notes = '';

        if (prospect.contact_count === 0) {
          // Terminal: No contacts found -> review
          targetStatus = 'review';
          notes = `Cleanup: No contacts found after 1 attempt (terminal). Needs human review.`;
          reviewCount++;
          console.log(`🛑 ${domain} -> review (zero contacts, terminal)`);
        } else if (!hasAcceptedEmails) {
          // Terminal: Has contacts but no accepted emails -> keep enriching (shows in Missing Emails)
          targetStatus = 'enriching';
          notes = `Cleanup: ${prospect.contact_count} contacts but no accepted emails after 1 attempt (terminal). Shows in Missing Emails.`;
          missingEmailsCount++;
          console.log(`🛑 ${domain} -> enriching/terminal (${prospect.contact_count} contacts, no accepted emails) - Missing Emails`);
        } else {
          // Has accepted emails -> should be enriched (check for icebreaker)
          const { data: activityData } = await supabase
            .from('prospect_activities')
            .select('icebreaker_text')
            .eq('id', prospect.id)
            .single();

          if (activityData?.icebreaker_text) {
            targetStatus = 'enriched';
            enrichedCount++;
            console.log(`✅ ${domain} -> enriched (has accepted emails + icebreaker)`);
          }
        }

        if (targetStatus !== prospect.status || notes) {
          await supabase
            .from('prospect_activities')
            .update({
              status: targetStatus,
              notes: notes || null,
            })
            .eq('id', prospect.id)
            .neq('status', 'enriched'); // Never downgrade enriched
        }
      }
    }

    // Phase 3: Reconcile job items and job statuses
    const { data: runningJobs } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('status', 'running');

    const cleanedJobs = [];

    if (runningJobs && runningJobs.length > 0) {
      console.log(`📊 Reconciling ${runningJobs.length} running jobs...`);

      for (const job of runningJobs) {
        const { data: items } = await supabase
          .from('enrichment_job_items')
          .select('*')
          .eq('job_id', job.id);

        if (!items) continue;

        // Count with "accepted email only" success rule
        const successCount = items.filter(i => i.status === 'success' && i.has_emails === true).length;
        const failedCount = items.filter(i => i.status === 'failed').length;
        const pendingCount = items.filter(i => i.status === 'pending').length;
        const processedCount = successCount + failedCount + items.filter(i => i.status === 'success' && !i.has_emails).length;
        const totalCount = items.length;

        const isCompleted = pendingCount === 0;
        const newStatus = isCompleted ? 'completed' : 'running';

        await supabase
          .from('enrichment_jobs')
          .update({
            processed_count: processedCount,
            success_count: successCount,
            failed_count: failedCount,
            status: newStatus,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', job.id);

        console.log(`✅ Job ${job.id}: ${processedCount}/${totalCount} (${successCount} with emails, ${failedCount} failed) - ${newStatus}`);
        cleanedJobs.push({
          job_id: job.id,
          processed: processedCount,
          total: totalCount,
          success_with_emails: successCount,
          failed: failedCount,
          status: newStatus,
        });
      }
    }


    return new Response(
      JSON.stringify({
        message: `Cleanup complete: ${locksReleased?.length || 0} locks released, ${enrichedCount + reviewCount + missingEmailsCount} prospects terminalized, ${cleanedJobs.length} jobs reconciled`,
        locksReleased: locksReleased?.length || 0,
        prospectsTerminalized: {
          enriched: enrichedCount,
          review: reviewCount,
          missingEmails: missingEmailsCount,
          total: enrichedCount + reviewCount + missingEmailsCount,
        },
        jobsReconciled: cleanedJobs.length,
        jobs: cleanedJobs,
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
