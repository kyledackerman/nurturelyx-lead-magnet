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

    console.log("🔍 Finding prospects with missing icebreakers...");

    // Find all prospects that are enriched, have contacts, but missing icebreaker
    const { data: prospects, error: fetchError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        icebreaker_text,
        contact_count,
        reports!inner(domain, extracted_company_name)
      `)
      .eq("status", "enriched")
      .gt("contact_count", 0)
      .is("icebreaker_text", null);

    if (fetchError) {
      console.error("Error fetching prospects:", fetchError);
      throw fetchError;
    }

    if (!prospects || prospects.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: 0,
          message: "No prospects need icebreaker generation"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📝 Found ${prospects.length} prospects needing icebreakers`);

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Generate icebreaker for each prospect
    for (const prospect of prospects) {
      const domain = prospect.reports.domain;
      const companyName = prospect.reports.extracted_company_name || domain;

      console.log(`🧊 Generating icebreaker for ${domain}...`);

      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-icebreaker',
          {
            body: {
              prospect_activity_id: prospect.id,
              domain: domain,
              company_name: companyName,
              force_regenerate: true
            }
          }
        );

        if (error) {
          console.error(`❌ Failed for ${domain}:`, error);
          failedCount++;
          errors.push(`${domain}: ${error.message}`);
        } else {
          console.log(`✅ Generated icebreaker for ${domain}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Exception for ${domain}:`, error);
        failedCount++;
        errors.push(`${domain}: ${error.message}`);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Completed: ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        total: prospects.length,
        successCount,
        failedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in regenerate-icebreakers:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
