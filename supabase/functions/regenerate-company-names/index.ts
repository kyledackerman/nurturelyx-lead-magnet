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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("is_admin", { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prospect_ids, regenerate_all } = await req.json();

    console.log(`Starting company name regeneration. All: ${regenerate_all}, IDs: ${prospect_ids?.length || 0}`);

    // Test AI credits before processing
    try {
      const testResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5,
        }),
      });

      if (testResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Out of AI credits",
            message: "Please add credits to your Lovable workspace before regenerating company names"
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.warn("Could not verify AI credits, proceeding anyway");
    }

    let prospectsToProcess: any[] = [];

    // Helper function to detect if a company name needs fixing
    const needsCompanyNameFix = (name: string | null, domain: string): boolean => {
      if (!name) return true; // Null/empty needs fixing
      if (name === domain) return true; // Exact domain match needs fixing
      if (name.startsWith("Unknown")) return true; // Unknown prefix needs fixing
      
      // Check if it looks like a domain (no spaces, all lowercase-ish)
      const noSpaces = !name.includes(" ");
      const allLowercase = name.toLowerCase() === name;
      const matchesDomainPattern = name.toLowerCase().replace(/[^a-z0-9]/g, "") === 
                                   domain.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      return noSpaces || allLowercase || matchesDomainPattern;
    };

    if (regenerate_all) {
      // Find all enriched prospects with domain-like company names
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          reports!inner(
            id,
            domain,
            extracted_company_name
          )
        `)
        .eq("status", "enriched")
        .not("reports.extracted_company_name", "is", null);

      if (error) throw error;

      // ONLY process names that actually need fixing
      prospectsToProcess = (data || []).filter((p: any) => 
        needsCompanyNameFix(p.reports.extracted_company_name, p.reports.domain)
      );
    } else if (prospect_ids && Array.isArray(prospect_ids)) {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          reports!inner(
            id,
            domain,
            extracted_company_name
          )
        `)
        .in("id", prospect_ids);

      if (error) throw error;
      
      // STILL filter even when specific IDs provided
      prospectsToProcess = (data || []).filter((p: any) => 
        needsCompanyNameFix(p.reports.extracted_company_name, p.reports.domain)
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Must provide prospect_ids or set regenerate_all=true" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${prospectsToProcess.length} prospects that need company name fixes`);

    const results = {
      updated: [] as Array<{ domain: string; oldName: string; newName: string }>,
      failed: [] as Array<{ domain: string; reason: string }>,
      skipped: [] as Array<{ domain: string; reason: string }>,
    };

    for (const prospect of prospectsToProcess) {
      const domain = prospect.reports.domain;
      const oldName = prospect.reports.extracted_company_name || domain;

      try {
        console.log(`Regenerating company name for ${domain} (currently: "${oldName}")`);

        // Scrape website with fallback strategies
        const { content, method } = await scrapeWebsite(domain);

        if (!content || content.length === 0) {
          console.log(`⚠️ Could not scrape ${domain}, skipping`);
          results.failed.push({
            domain,
            reason: "Could not access website (tried HTTP/HTTPS with/without www)",
          });
          continue;
        }

        console.log(`Scraped ${domain} using: ${method}`);

        // Ask AI to extract proper company name
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a company name extraction specialist. Extract the REAL business name from website content.

**CRITICAL RULES:**
- Extract the business name EXACTLY as it appears on the website (logos, headers, titles)
- Use proper capitalization:
  * Title Case for most words (Smith Plumbing Company)
  * Keep acronyms uppercase (HVAC, LLC, Inc., USA, etc.)
  * Preserve brand capitalization (e.g., "eBay", "iPhone")
- Look in these places (priority order):
  1. Page title (<title> tag)
  2. Logo text / header branding
  3. "About Us" page content
  4. Footer copyright notice (© 2024 ABC Company)
  5. Contact page business name
- DO NOT just capitalize the domain name
- If the real business name is truly not found, return "Unknown - [domain]"
- Return ONLY the company name as a single string, nothing else`,
              },
              {
                role: "user",
                content: `Domain: ${domain}

**WEBSITE CONTENT:**
${content.substring(0, 15000)}

Extract the proper company name. Return ONLY the company name string.`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${domain}:`, aiResponse.status, errorText);
          
          // If we're out of credits, stop processing entirely
          if (aiResponse.status === 402) {
            console.error("❌ OUT OF CREDITS - Stopping regeneration");
            results.failed.push({
              domain,
              reason: "Out of AI credits - Please add credits and try again",
            });
            
            // Mark all remaining domains as skipped
            const remainingIndex = prospectsToProcess.findIndex(p => p.reports.domain === domain);
            for (let i = remainingIndex + 1; i < prospectsToProcess.length; i++) {
              results.skipped.push({
                domain: prospectsToProcess[i].reports.domain,
                reason: "Skipped due to credit exhaustion",
              });
            }
            
            break; // Exit the loop immediately
          }
          
          results.failed.push({
            domain,
            reason: `AI extraction failed: ${aiResponse.status}`,
          });
          continue;
        }

        const aiData = await aiResponse.json();
        const newName = aiData.choices?.[0]?.message?.content?.trim();

        if (!newName || newName === oldName) {
          console.log(`No new name found for ${domain}`);
          results.failed.push({
            domain,
            reason: "AI could not extract valid business name from content",
          });
          continue;
        }

        // Update company name in reports table
        const { error: updateError } = await supabase
          .from("reports")
          .update({ extracted_company_name: newName })
          .eq("id", prospect.report_id);

        if (updateError) {
          console.error(`Error updating ${domain}:`, updateError);
          results.failed.push({
            domain,
            reason: `Database update failed: ${updateError.message}`,
          });
          continue;
        }

        // Log to audit trail
        await supabase.rpc("log_business_context", {
          p_table_name: "reports",
          p_record_id: prospect.report_id,
          p_context: `Regenerated company name from "${oldName}" to "${newName}" (Method: ${method})`,
        });

        console.log(`✅ Updated ${domain}: "${oldName}" → "${newName}"`);
        results.updated.push({ domain, oldName, newName });
      } catch (error: any) {
        console.error(`Error processing ${domain}:`, error);
        results.failed.push({
          domain,
          reason: error.message || "Unknown error",
        });
      }
    }

    console.log(`✅ Company name regeneration complete: ${results.updated.length} updated, ${results.failed.length} failed, ${results.skipped.length} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: results.updated,
        failed: results.failed,
        skipped: results.skipped,
        total: prospectsToProcess.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in regenerate-company-names:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to scrape website with fallback strategies
async function scrapeWebsite(domain: string): Promise<{ content: string; method: string }> {
  // Try multiple strategies in order
  const strategies = [
    { urls: [`https://${domain}`, `https://${domain}/about`], name: 'HTTPS' },
    { urls: [`https://www.${domain}`, `https://www.${domain}/about`], name: 'HTTPS with www' },
    { urls: [`http://${domain}`, `http://${domain}/about`], name: 'HTTP' },
    { urls: [`http://www.${domain}`, `http://www.${domain}/about`], name: 'HTTP with www' },
  ];

  for (const strategy of strategies) {
    let combinedContent = "";
    
    for (const url of strategy.urls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LeadEnrichmentBot/1.0)",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const html = await response.text();
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          combinedContent += textContent + "\n\n";
        }
      } catch (error) {
        console.log(`Failed ${url}:`, error);
      }
    }

    if (combinedContent.length > 200) {
      return { content: combinedContent, method: strategy.name };
    }
  }

  return { content: "", method: "none" };
}
