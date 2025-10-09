import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting re-enrichment of contacted prospects");

    // Fetch all prospects with status = "contacted"
    const { data: prospects, error: prospectsError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        reports!inner(domain, extracted_company_name)
      `)
      .eq("status", "contacted");

    if (prospectsError) {
      console.error("Error fetching prospects:", prospectsError);
      throw prospectsError;
    }

    console.log(`Found ${prospects?.length || 0} contacted prospects to re-enrich`);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendProgress = (message: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
        };

        let successCount = 0;
        let errorCount = 0;

        for (const prospect of prospects || []) {
          const prospectId = prospect.id;
          const reportId = prospect.report_id;
          const domain = prospect.reports.domain;
          const existingCompanyName = prospect.reports.extracted_company_name;

          try {
            console.log(`Processing prospect ${prospectId} for domain: ${domain}`);
            sendProgress({ 
              type: "progress", 
              prospectId, 
              domain,
              message: `Re-enriching ${domain}...` 
            });

            // Update last_enrichment_attempt (but NOT status)
            await supabase
              .from("prospect_activities")
              .update({
                last_enrichment_attempt: new Date().toISOString(),
              })
              .eq("id", prospectId);

            // Scrape website
            const websiteContent = await scrapeWebsite(domain);

            if (!websiteContent || websiteContent.length < 100) {
              console.error(`Insufficient content for ${domain}`);
              sendProgress({ 
                type: "error", 
                prospectId, 
                domain,
                error: "Insufficient website content" 
              });
              errorCount++;
              continue;
            }

            // Call Lovable AI for enrichment
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  {
                    role: "system",
                    content: `You are a contact extraction expert. Extract contact information and company name from website content.\nReturn ONLY a valid JSON object with this exact structure:\n{\n  "company_name": "string or null",\n  "contacts": [\n    {\n      "first_name": "string",\n      "last_name": "string or null",\n      "email": "string or null",\n      "phone": "string or null",\n      "title": "string or null"\n    }\n  ]\n}\n\nRules:\n- Extract ALL contacts you can find\n- Include owner/CEO/manager contacts with priority\n- Use null for missing fields\n- Ensure valid email format\n- Extract phone numbers in any format found\n- Return empty contacts array if none found\n- company_name should be the business name, not domain`
                  },
                  {
                    role: "user",
                    content: `Extract contacts and company name from this website:\n\nDomain: ${domain}\n\nContent:\n${websiteContent.slice(0, 8000)}`
                  }
                ],
                temperature: 0.3,
              }),
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              console.error(`AI API error for ${domain}:`, errorText);
              sendProgress({ 
                type: "error", 
                prospectId, 
                domain,
                error: "AI enrichment failed" 
              });
              errorCount++;
              continue;
            }

            const aiData = await aiResponse.json();
            let aiContent = aiData.choices?.[0]?.message?.content || "";

            // Clean and parse AI response
            aiContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            
            let enrichmentData;
            try {
              enrichmentData = JSON.parse(aiContent);
            } catch (parseError) {
              console.error(`Failed to parse AI response for ${domain}:`, parseError);
              sendProgress({ 
                type: "error", 
                prospectId, 
                domain,
                error: "Failed to parse AI response" 
              });
              errorCount++;
              continue;
            }

            // Count existing contacts
            const { data: existingContacts } = await supabase
              .from("prospect_contacts")
              .select("id")
              .eq("report_id", reportId);

            const existingContactCount = existingContacts?.length || 0;

            // Insert new contacts
            let contactsInserted = 0;
            const contacts = enrichmentData.contacts || [];
            
            for (const contact of contacts) {
              if (!contact.first_name) continue;

              const { error: insertError } = await supabase
                .from("prospect_contacts")
                .insert({
                  prospect_activity_id: prospectId,
                  report_id: reportId,
                  first_name: contact.first_name,
                  last_name: contact.last_name,
                  email: contact.email,
                  phone: contact.phone,
                  title: contact.title,
                  is_primary: contactsInserted === 0 && existingContactCount === 0,
                });

              if (!insertError) {
                contactsInserted++;
              }
            }

            // Update company name if found and different
            const extractedCompanyName = enrichmentData.company_name;
            if (extractedCompanyName && extractedCompanyName !== existingCompanyName) {
              await supabase
                .from("reports")
                .update({ extracted_company_name: extractedCompanyName })
                .eq("id", reportId);
            }

            // Update prospect with re_enrichment source (keep status as "contacted")
            await supabase
              .from("prospect_activities")
              .update({
                enrichment_source: "re_enrichment",
                last_enrichment_attempt: new Date().toISOString(),
              })
              .eq("id", prospectId);

            // Log to audit trail
            await supabase.rpc("log_business_context", {
              p_table_name: "prospect_activities",
              p_record_id: prospectId,
              p_context: `Re-enrichment: Added ${contactsInserted} new contacts (${existingContactCount} existed) for ${domain}. Company: ${extractedCompanyName || 'not found'}`,
            });

            console.log(`Successfully re-enriched ${domain}: ${contactsInserted} contacts added`);
            sendProgress({ 
              type: "success", 
              prospectId, 
              domain,
              contactsAdded: contactsInserted,
              existingContacts: existingContactCount,
              companyName: extractedCompanyName
            });
            successCount++;

            // Delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

          } catch (error) {
            console.error(`Error processing prospect ${prospectId}:`, error);
            sendProgress({ 
              type: "error", 
              prospectId, 
              domain,
              error: error.message 
            });
            errorCount++;
          }
        }

        // Send final summary
        sendProgress({ 
          type: "complete", 
          totalProcessed: prospects?.length || 0,
          successCount,
          errorCount
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in re-enrich-contacted function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function scrapeWebsite(domain: string): Promise<string> {
  const urls = [
    `https://${domain}`,
    `https://www.${domain}`,
    `https://${domain}/contact`,
    `https://${domain}/about`,
    `https://${domain}/team`,
  ];

  let combinedContent = "";

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        const textContent = html
          .replace(/<script[^>]*>[\\s\\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\\s\\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\\s+/g, " ")
          .trim();

        combinedContent += textContent + "\n";
      }
    } catch (error) {
      console.log(`Failed to fetch ${url}:`, error.message);
      continue;
    }
  }

  return combinedContent;
}
