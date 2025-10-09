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

    // Check if auto-enrichment is enabled
    const { data: settings, error: settingsError } = await supabase
      .from("enrichment_settings")
      .select("*")
      .single();

    if (settingsError) {
      console.error("Error fetching enrichment settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch enrichment settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.auto_enrichment_enabled) {
      console.log("Auto-enrichment is disabled, skipping...");
      return new Response(
        JSON.stringify({ message: "Auto-enrichment is disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting auto-enrichment process...");

    // Get up to 12 prospects that need enrichment
    const { data: prospects, error: fetchError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        status,
        enrichment_retry_count,
        reports!inner(domain, extracted_company_name)
      `)
      .in("status", ["new", "enriching"])
      .lt("enrichment_retry_count", 3)
      .order("last_enrichment_attempt", { ascending: true, nullsFirst: true })
      .limit(12);

    if (fetchError) {
      console.error("Error fetching prospects:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prospects || prospects.length === 0) {
      console.log("No prospects need enrichment");
      return new Response(JSON.stringify({ message: "No prospects to enrich", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${prospects.length} prospects to enrich`);

    const results = {
      total: prospects.length,
      successful: 0,
      failed: 0,
      details: [] as any[],
    };

    // Process each prospect
    for (const prospect of prospects) {
      const domain = prospect.reports.domain;
      const companyName = prospect.reports.extracted_company_name || domain;
      
      console.log(`Processing ${domain}...`);

      try {
        // Update status to enriching
        await supabase
          .from("prospect_activities")
          .update({
            status: "enriching",
            last_enrichment_attempt: new Date().toISOString(),
          })
          .eq("id", prospect.id);

        // Scrape the website
        const scrapedData = await scrapeWebsite(domain);
        
        if (!scrapedData || scrapedData.length === 0) {
          throw new Error("No data scraped from website");
        }

        console.log(`Scraped ${scrapedData.length} characters from ${domain}`);

        // Use AI to extract contacts from scraped data
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
                content: `You are a contact extraction specialist. Extract ALL legitimate contact information from scraped website text.

**CRITICAL EMAIL RULES:**
- ✅ INCLUDE: info@, contact@, sales@, admin@, support@, hello@, team@
- ✅ INCLUDE: Personal emails like @gmail.com, @yahoo.com, @hotmail.com, @outlook.com
- ✅ INCLUDE: All emails with person names (john.smith@company.com)
- ❌ ONLY EXCLUDE: noreply@, no-reply@, donotreply@, mailer-daemon@, example@example.com

**CRITICAL CONTEXT FILTERING RULES:**
- ❌ EXCLUDE contacts found in testimonial sections
- ❌ EXCLUDE contacts with context like: "customer says", "client review", "testimonial from", "case study"
- ❌ EXCLUDE contacts mentioned as users/customers of the company
- ✅ ONLY INCLUDE contacts that appear to be EMPLOYEES or COMPANY REPRESENTATIVES
- ✅ Look for context like: "our team", "contact us", "meet our staff", "leadership", "about us"
- ✅ Prioritize contacts from: /contact, /about, /team pages
- ❌ Ignore contacts from: /testimonials, /reviews, /case-studies sections
- If unsure whether someone is an employee or customer, EXCLUDE them
- Only extract contacts you are confident work FOR the company, not WITH the company

**NOTES FIELD REQUIREMENT:**
- MUST include where the contact was found (e.g., "Found on contact page", "Listed on team page")
- If found in testimonial/review context, DO NOT include the contact at all

Return ONLY valid JSON array of contacts. Each contact object should have:
- first_name (required: person's name OR company name if no person found)
- last_name (optional: only if person's last name is clearly identified)
- email (required: following rules above)
- phone (optional: full phone number with country code if found)
- title (optional: job title or role)
- linkedin_url (optional: LinkedIn profile URL)
- notes (optional: any additional context)

Example output:
[
  {
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@company.com",
    "phone": "+1-555-0123",
    "title": "CEO",
    "linkedin_url": "https://linkedin.com/in/johnsmith",
    "notes": "Found on about page"
  },
  {
    "first_name": "Company Name",
    "email": "info@company.com",
    "notes": "Main contact email"
  }
]`,
              },
              {
                role: "user",
                content: `Company: ${companyName}
Domain: ${domain}

Scraped website content:
${scrapedData.substring(0, 10000)}

Extract all contact information following the email rules. Return ONLY the JSON array.`,
              },
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI API error:", aiResponse.status, errorText);
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content;

        if (!aiContent) {
          throw new Error("No content from AI");
        }

        // Parse AI response
        let contacts = [];
        try {
          // Remove markdown code blocks if present
          const cleanedContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          contacts = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error("Failed to parse AI response:", aiContent);
          throw new Error("Invalid JSON from AI");
        }

        if (!Array.isArray(contacts) || contacts.length === 0) {
          throw new Error("No contacts extracted by AI");
        }

        console.log(`AI extracted ${contacts.length} contacts`);

        // Save contacts to database
        const contactsToInsert = contacts.map((contact: any) => ({
          prospect_activity_id: prospect.id,
          report_id: prospect.report_id,
          first_name: contact.first_name,
          last_name: contact.last_name || null,
          email: contact.email || null,
          phone: contact.phone || null,
          title: contact.title || null,
          linkedin_url: contact.linkedin_url || null,
          notes: contact.notes || null,
          is_primary: false,
        }));

        const { error: insertError } = await supabase
          .from("prospect_contacts")
          .insert(contactsToInsert);

        if (insertError) {
          console.error("Error inserting contacts:", insertError);
          throw new Error(`Failed to save contacts: ${insertError.message}`);
        }

        let contactsFound = contacts.length;
        let icebreakerGenerated = false;

        // Check if icebreaker already exists
        const { data: existingProspect } = await supabase
          .from("prospect_activities")
          .select("icebreaker_text")
          .eq("id", prospect.id)
          .single();

        // Generate icebreaker if missing
        if (!existingProspect?.icebreaker_text?.trim()) {
          try {
            console.log(`Generating personalized icebreaker for ${domain}...`);
            
            const icebreakerResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                    content: `You are a B2B sales expert. Create a personalized, conversational opener for a cold outreach email.

CRITICAL RULES:
- Maximum 1-2 sentences
- Reference something specific about their business (from website content)
- Be conversational and authentic, not salesy
- Focus on a pain point, achievement, or relevant observation
- Do not use generic phrases like "I noticed" or "I came across"
- Sound like a real person reaching out to help

Example good openers:
"Your HVAC service area covers 3 counties—that's a lot of ground to cover when leads slip through the cracks on your website."
"Most law firms lose 40% of their web visitors because they can't identify them, and with your traffic numbers, that's real money walking away."

Return ONLY the opener text, nothing else.`,
                  },
                  {
                    role: "user",
                    content: `Company: ${companyName}
Domain: ${domain}

Website content:
${scrapedData.substring(0, 8000)}

Create a personalized opener that references something specific about their business.`,
                  },
                ],
                tools: [{ type: "google_search_retrieval" }],
              }),
            });

            if (icebreakerResponse.ok) {
              const icebreakerData = await icebreakerResponse.json();
              const icebreakerText = icebreakerData.choices?.[0]?.message?.content?.trim();

              if (icebreakerText) {
                await supabase
                  .from("prospect_activities")
                  .update({
                    icebreaker_text: icebreakerText,
                    icebreaker_generated_at: new Date().toISOString(),
                    icebreaker_edited_manually: false,
                  })
                  .eq("id", prospect.id);

                icebreakerGenerated = true;
                console.log(`✅ Icebreaker generated for ${domain}`);
              }
            } else if (icebreakerResponse.status === 429) {
              console.warn(`⚠️ Rate limit hit while generating icebreaker for ${domain}`);
            } else if (icebreakerResponse.status === 402) {
              console.warn(`⚠️ Credits exhausted while generating icebreaker for ${domain}`);
            } else {
              console.error(`Failed to generate icebreaker for ${domain}: ${icebreakerResponse.status}`);
            }
          } catch (icebreakerError) {
            console.error(`Error generating icebreaker for ${domain}:`, icebreakerError);
            // Don't throw - continue with enrichment even if icebreaker fails
          }
        } else {
          console.log(`Icebreaker already exists for ${domain}, skipping generation`);
        }

        // Determine final status: enriched if we have contacts OR icebreaker, otherwise review
        const finalStatus = (contactsFound > 0 || icebreakerGenerated) ? "enriched" : "review";

        // Update prospect status
        await supabase
          .from("prospect_activities")
          .update({
            status: finalStatus,
            auto_enriched: true,
            enrichment_source: "auto_scrape_ai",
          })
          .eq("id", prospect.id);

        // Log success to audit
        const enrichmentDetails = [];
        if (contactsFound > 0) enrichmentDetails.push(`${contactsFound} contacts`);
        if (icebreakerGenerated) enrichmentDetails.push('icebreaker');
        
        await supabase.rpc("log_business_context", {
          p_table_name: "prospect_activities",
          p_record_id: prospect.id,
          p_context: `Auto-enrichment ${finalStatus === 'enriched' ? 'successful' : 'needs review'}: ${enrichmentDetails.join(' + ')} from ${domain}`,
        });

        results.successful++;
        results.details.push({
          domain,
          status: "success",
          contactsFound,
          icebreakerGenerated,
          finalStatus,
        });

        console.log(`✅ Successfully enriched ${domain}`);

        // Small delay between prospects
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to enrich ${domain}:`, error);

        const retryCount = (prospect.enrichment_retry_count || 0) + 1;
        const newStatus = retryCount >= 3 ? "review" : "enriching";

        // Update retry count and status
        await supabase
          .from("prospect_activities")
          .update({
            enrichment_retry_count: retryCount,
            last_enrichment_attempt: new Date().toISOString(),
            status: newStatus,
          })
          .eq("id", prospect.id);

        // Log failure to audit
        await supabase.rpc("log_business_context", {
          p_table_name: "prospect_activities",
          p_record_id: prospect.id,
          p_context: `Auto-enrichment attempt ${retryCount} failed: ${error instanceof Error ? error.message : String(error)}. Status set to ${newStatus}.`,
        });

        results.failed++;
        results.details.push({
          domain,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          retryCount,
          newStatus,
        });
      }
    }

    console.log("Auto-enrichment complete:", results);

    // Update enrichment settings with last run time and totals
    await supabase
      .from("enrichment_settings")
      .update({
        last_run_at: new Date().toISOString(),
        total_enriched: settings.total_enriched + results.successful,
        total_failed: settings.total_failed + results.failed,
      })
      .eq("id", settings.id);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Auto-enrichment error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function scrapeWebsite(domain: string): Promise<string> {
  const urlsToTry = [
    `https://${domain}`,
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/team`,
    `https://www.${domain}`,
    `https://www.${domain}/contact`,
  ];

  let allContent = "";

  for (const url of urlsToTry) {
    try {
      console.log(`Scraping ${url}...`);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract text content (simple approach - remove HTML tags)
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        allContent += text + "\n\n";
        
        console.log(`✅ Successfully scraped ${url} (${text.length} chars)`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to scrape ${url}:`, error instanceof Error ? error.message : String(error));
    }
  }

  return allContent;
}
