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

    // Check ALL enriching prospects, not just stale locks
    // This catches prospects where icebreaker completed but status wasn't updated
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
      .eq("status", "enriching");

    if (fetchError) {
      console.error("Failed to fetch stale locked prospects:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch stuck prospects", details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${staleLockedProspects?.length || 0} enriching prospects to reconcile`);

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

        // Check for company name
        const { data: reportData } = await supabase
          .from("reports")
          .select("extracted_company_name")
          .eq("id", prospect.report_id)
          .single();
        
        const hasCompanyName = !!reportData?.extracted_company_name;

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

        // Determine final status based on ALL 3 CRITERIA
        let finalStatus = 'review';
        let finalNotes = '';

        if (hasCompanyName && hasAcceptedEmails && hasIcebreaker) {
          // SUCCESS: Has company name + accepted email + icebreaker = enriched
          finalStatus = 'enriched';
          finalNotes = `✅ Reconciled: Company name + ${acceptedEmails.length} accepted email(s) + icebreaker (terminal)`;
          movedToEnriched++;
          console.log(`✅ ${domain} -> enriched (company + ${acceptedEmails.length} emails + icebreaker)`);
        } else if (hasContacts && !hasAcceptedEmails) {
          // TERMINAL: Contacts but no accepted emails = Missing Emails
          finalStatus = 'enriching';
          finalNotes = `⚠️ Reconciled: ${prospect.contact_count} contacts but no valid sales emails (terminal)`;
          movedToMissingEmails++;
          console.log(`🛑 ${domain} -> Missing Emails (${prospect.contact_count} contacts, 0 accepted emails)`);
        } else if (!hasCompanyName || !hasIcebreaker || !hasAcceptedEmails) {
          // TERMINAL: Missing one or more required criteria = Needs Review
          const missing = [];
          if (!hasCompanyName) missing.push('company name');
          if (!hasAcceptedEmails) missing.push('valid email');
          if (!hasIcebreaker) missing.push('icebreaker');
          
          finalStatus = 'review';
          finalNotes = `⚠️ Reconciled: Missing ${missing.join(', ')} (terminal)`;
          movedToReview++;
          console.log(`🛑 ${domain} -> Needs Review (missing: ${missing.join(', ')})`);
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
