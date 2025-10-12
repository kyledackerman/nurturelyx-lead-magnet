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

    console.log("Resetting prospects that need review after failed enrichments...");

    // Reset prospects with high retry counts back to enriching status
    // These are prospects that went to "review" after multiple failed attempts
    const { data: resetProspects, error: resetError } = await supabase
      .from("prospect_activities")
      .update({
        status: "enriching",
        enrichment_retry_count: 0,
        last_enrichment_attempt: null,
        enrichment_locked_at: null,
        enrichment_locked_by: null,
        notes: "🔄 Reset from review status - ready for retry with improved enrichment"
      })
      .eq("status", "review")
      .gte("enrichment_retry_count", 2)
      .select("id, reports!inner(domain)");

    if (resetError) {
      console.error("Error resetting prospects:", resetError);
      throw resetError;
    }

    const resetCount = resetProspects?.length || 0;
    console.log(`✅ Reset ${resetCount} prospects from review to enriching status`);

    // Log audit trail
    if (resetCount > 0) {
      await supabase.from("audit_logs").insert({
        table_name: "prospect_activities",
        record_id: null,
        action_type: "BULK_UPDATE",
        business_context: `Reset ${resetCount} prospects from review status back to enriching for retry`,
        changed_by: null
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        reset_count: resetCount,
        message: `Successfully reset ${resetCount} prospects from review to enriching`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in retry-failed-enrichments:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
