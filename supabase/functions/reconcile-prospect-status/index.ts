import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`🔄 Starting prospect status reconciliation by ${user.email}`);

    // Fetch all prospects that need reconciliation (exclude closed/lost)
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select(`
        id, 
        status, 
        enrichment_retry_count,
        icebreaker_text,
        contact_count,
        report_id,
        reports!inner(domain)
      `)
      .not('status', 'in', '("closed_won","closed_lost","not_viable")');

    if (fetchError) {
      throw new Error(`Failed to fetch prospects: ${fetchError.message}`);
    }

    let fixedToEnriched = 0;
    let movedToReview = 0;
    let resetToEnriching = 0;
    let alreadyCorrect = 0;

    console.log(`📊 Processing ${prospects.length} prospects for reconciliation`);

    for (const prospect of prospects) {
      // Check for accepted emails (not legal/compliance)
      const { data: contacts } = await supabase
        .from('prospect_contacts')
        .select('email')
        .eq('prospect_activity_id', prospect.id);
      
      const hasAcceptedEmail = contacts?.some(c => {
        if (!c.email || c.email.trim() === '') return false;
        const localPart = c.email.split('@')[0]?.toLowerCase();
        return !['legal','privacy','compliance','counsel','attorney','law','dmca']
          .some(prefix => localPart === prefix || localPart.includes(prefix));
      });
      
      const hasIcebreaker = prospect.icebreaker_text != null;
      const domain = prospect.reports.domain;
      
      let newStatus = prospect.status;
      let reason = '';
      
      // Determine correct status
      if (prospect.status === 'enriched') {
        // Already enriched - verify it's correct
        if (hasAcceptedEmail && hasIcebreaker) {
          alreadyCorrect++;
          continue;
        } else {
          // Enriched but missing requirements - move to enriching
          newStatus = 'enriching';
          reason = 'Missing email or icebreaker';
          resetToEnriching++;
        }
      } else if (hasAcceptedEmail && hasIcebreaker) {
        // Should be enriched!
        newStatus = 'enriched';
        reason = 'Has accepted email + icebreaker';
        fixedToEnriched++;
      } else if (prospect.contact_count > 0 && !hasAcceptedEmail && (prospect.enrichment_retry_count || 0) >= 2) {
        // Contacts but no accepted email after 3 attempts
        newStatus = 'review';
        reason = 'No accepted email after 3 attempts';
        movedToReview++;
      } else if (!hasAcceptedEmail && (prospect.enrichment_retry_count || 0) < 3) {
        // Needs more enrichment attempts
        newStatus = 'enriching';
        reason = 'Needs more enrichment attempts';
        resetToEnriching++;
      } else {
        alreadyCorrect++;
        continue;
      }
      
      if (newStatus !== prospect.status) {
        // Update prospect status
        await supabase
          .from('prospect_activities')
          .update({
            status: newStatus,
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.id);
        
        // Log audit trail
        await supabase.from('audit_logs').insert({
          table_name: 'prospect_activities',
          record_id: prospect.id,
          action_type: 'UPDATE',
          field_name: 'status',
          old_value: prospect.status,
          new_value: newStatus,
          business_context: `Reconciliation: ${reason} (${domain})`,
          user_id: user.id
        });
        
        console.log(`✅ ${domain}: ${prospect.status} → ${newStatus} (${reason})`);
      }
    }

    const summary = {
      success: true,
      total_processed: prospects.length,
      fixed_to_enriched: fixedToEnriched,
      moved_to_review: movedToReview,
      reset_to_enriching: resetToEnriching,
      already_correct: alreadyCorrect
    };

    console.log(`✅ Reconciliation complete:`, summary);

    return new Response(
      JSON.stringify(summary),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in reconcile-prospect-status:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
