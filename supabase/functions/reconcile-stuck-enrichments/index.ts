import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔧 Starting stuck enrichment reconciliation...");

    // Phase 1: Release stale locks (older than 10 minutes)
    const staleLockThreshold = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: staleLockedProspects, error: fetchError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        status,
        contact_count,
        icebreaker_text,
        enrichment_retry_count,
        enrichment_locked_at,
        reports!inner(domain)
      `)
      .eq("status", "enriching")
      .not("enrichment_locked_at", "is", null)
      .lt("enrichment_locked_at", staleLockThreshold);

    if (fetchError) {
      console.error("Failed to fetch stale locked prospects:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch stuck prospects", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${staleLockedProspects?.length || 0} prospects with stale locks`);

    let reconciledCount = 0;
    let movedToReview = 0;
    let movedToMissingEmails = 0;
    let movedToEnriched = 0;
    const errors: string[] = [];

    for (const prospect of staleLockedProspects || []) {
      try {
        const domain = prospect.reports.domain;
        const hasContacts = (prospect.contact_count || 0) > 0;
        const hasIcebreaker = !!prospect.icebreaker_text;

        // Check for accepted emails (not legal/compliance/gov/edu/mil)
        const { data: contacts } = await supabase
          .from("prospect_contacts")
          .select("email")
          .eq("prospect_activity_id", prospect.id);

        const acceptedEmails = (contacts || []).filter((c) => {
          if (!c.email || c.email.trim() === '') return false;
          
          const localPart = c.email.split('@')[0]?.toLowerCase();
          const domainPart = c.email.split('@')[1]?.toLowerCase();
          
          // Filter out legal/compliance
          const isLegal = ['legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca']
            .some(prefix => localPart === prefix || localPart.includes(prefix));
          
          // Filter out gov/edu/mil domains
          const isGovEduMil = domainPart?.endsWith('.gov') || domainPart?.endsWith('.edu') || domainPart?.endsWith('.mil');
          
          return !isLegal && !isGovEduMil;
        });

        const hasAcceptedEmails = acceptedEmails.length > 0;

        // Determine final status
        let finalStatus = 'review';
        let finalNotes = '';

        if (hasAcceptedEmails && hasIcebreaker) {
          // SUCCESS: Has accepted email + icebreaker = enriched
          finalStatus = 'enriched';
          finalNotes = `✅ Reconciled: ${acceptedEmails.length} accepted email(s) + icebreaker (terminal)`;
          movedToEnriched++;
          console.log(`✅ ${domain} -> enriched (${acceptedEmails.length} emails + icebreaker)`);
        } else if (hasContacts && !hasAcceptedEmails) {
          // TERMINAL: Contacts but no accepted emails = Missing Emails
          finalStatus = 'enriching';
          finalNotes = `⚠️ Reconciled: ${prospect.contact_count} contacts but no valid sales emails (terminal)`;
          movedToMissingEmails++;
          console.log(`🛑 ${domain} -> Missing Emails (${prospect.contact_count} contacts, 0 accepted emails)`);
        } else {
          // TERMINAL: No contacts = Needs Review
          finalStatus = 'review';
          finalNotes = `⚠️ Reconciled: No contacts found after enrichment (terminal)`;
          movedToReview++;
          console.log(`🛑 ${domain} -> Needs Review (no contacts)`);
        }

        // Update prospect with final state
        const { error: updateError } = await supabase
          .from("prospect_activities")
          .update({
            status: finalStatus,
            enrichment_retry_count: 1, // Mark as terminal
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            last_enrichment_attempt: new Date().toISOString(),
            notes: finalNotes,
          })
          .eq("id", prospect.id);

        if (updateError) {
          console.error(`Failed to update ${domain}:`, updateError);
          errors.push(`${domain}: ${updateError.message}`);
          continue;
        }

        // Log to audit trail
        await supabase.rpc("log_business_context", {
          p_table_name: "prospect_activities",
          p_record_id: prospect.id,
          p_context: `Reconciled stuck enrichment: ${finalNotes} (${domain})`,
        });

        reconciledCount++;
      } catch (err) {
        const domain = prospect.reports?.domain || prospect.id;
        console.error(`Error reconciling ${domain}:`, err);
        errors.push(`${domain}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Phase 2: One-time backfill for any existing stuck prospects without stale locks
    // (These may have failed before locks were even set)
    const { data: orphanedProspects } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        contact_count,
        icebreaker_text,
        enrichment_retry_count,
        reports!inner(domain)
      `)
      .eq("status", "enriching")
      .is("enrichment_locked_at", null)
      .eq("enrichment_retry_count", 0);

    console.log(`Found ${orphanedProspects?.length || 0} orphaned enriching prospects (no lock, retry=0)`);

    for (const prospect of orphanedProspects || []) {
      try {
        const domain = prospect.reports.domain;
        const hasContacts = (prospect.contact_count || 0) > 0;

        // Same logic: check for accepted emails
        const { data: contacts } = await supabase
          .from("prospect_contacts")
          .select("email")
          .eq("prospect_activity_id", prospect.id);

        const acceptedEmails = (contacts || []).filter((c) => {
          if (!c.email || c.email.trim() === '') return false;
          const localPart = c.email.split('@')[0]?.toLowerCase();
          const domainPart = c.email.split('@')[1]?.toLowerCase();
          const isLegal = ['legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca']
            .some(prefix => localPart === prefix || localPart.includes(prefix));
          const isGovEduMil = domainPart?.endsWith('.gov') || domainPart?.endsWith('.edu') || domainPart?.endsWith('.mil');
          return !isLegal && !isGovEduMil;
        });

        const finalStatus = hasContacts && acceptedEmails.length === 0 ? 'enriching' : 'review';
        const finalNotes = hasContacts && acceptedEmails.length === 0
          ? `⚠️ Backfilled: ${prospect.contact_count} contacts but no valid sales emails (terminal)`
          : `⚠️ Backfilled: No contacts found (terminal)`;

        await supabase
          .from("prospect_activities")
          .update({
            status: finalStatus,
            enrichment_retry_count: 1,
            last_enrichment_attempt: new Date().toISOString(),
            notes: finalNotes,
          })
          .eq("id", prospect.id);

        if (finalStatus === 'review') movedToReview++;
        else movedToMissingEmails++;
        
        reconciledCount++;
        console.log(`✅ Backfilled ${domain} -> ${finalStatus}`);
      } catch (err) {
        console.error(`Error backfilling prospect:`, err);
      }
    }

    const summary = {
      success: true,
      reconciledCount,
      movedToReview,
      movedToMissingEmails,
      movedToEnriched,
      errors: errors.length > 0 ? errors : null,
    };

    console.log("🎉 Reconciliation complete:", summary);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reconciliation failed:", error);
    return new Response(
      JSON.stringify({ 
        error: "Reconciliation failed", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
