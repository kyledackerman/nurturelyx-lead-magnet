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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { prospect_ids } = await req.json();

        if (!Array.isArray(prospect_ids) || prospect_ids.length === 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "prospect_ids array is required" })}\n\n`
            )
          );
          controller.close();
          return;
        }

        console.log(`Starting bulk enrichment for ${prospect_ids.length} prospects...`);

        let successCount = 0;
        let failureCount = 0;

        // Process each prospect sequentially with delays
        for (let i = 0; i < prospect_ids.length; i++) {
          const prospectId = prospect_ids[i];
          
          try {
            // Fetch prospect details
            const { data: prospect, error: fetchError } = await supabase
              .from("prospect_activities")
              .select(`
                id,
                report_id,
                status,
                reports!inner(domain, extracted_company_name, facebook_url, industry)
              `)
              .eq("id", prospectId)
              .single();

            if (fetchError || !prospect) {
              console.error(`Prospect ${prospectId} not found:`, fetchError);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ 
                    type: "error", 
                    prospectId, 
                    domain: "unknown",
                    status: "failed",
                    error: "Prospect not found" 
                  })}\n\n`
                )
              );
              failureCount++;
              continue;
            }

            const domain = prospect.reports.domain;
            const currentCompanyName = prospect.reports.extracted_company_name || domain;

            // Send processing update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: "progress", 
                  prospectId, 
                  domain,
                  status: "processing" 
                })}\n\n`
              )
            );

            // Update status to enriching
            await supabase
              .from("prospect_activities")
              .update({
                status: "enriching",
                last_enrichment_attempt: new Date().toISOString(),
              })
              .eq("id", prospectId);

            // Scrape the website
            const scrapedData = await scrapeWebsite(domain);

            if (!scrapedData || scrapedData.length === 0) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ 
                    type: "error", 
                    prospectId, 
                    domain,
                    status: "failed",
                    error: "Could not access website" 
                  })}\n\n`
                )
              );
              
              await supabase
                .from("prospect_activities")
                .update({ status: prospect.status })
                .eq("id", prospectId);
              
              failureCount++;
              continue;
            }

            // Use AI to extract contacts
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
                    content: `You are a contact extraction specialist. Extract ALL legitimate contact information, the properly capitalized company name, AND the business industry.

**RETURN THIS EXACT JSON STRUCTURE:**
{
  "company_name": "Properly Capitalized Company Name Inc.",
  "facebook_url": "https://www.facebook.com/CompanyPageName",
  "industry": "hvac",
  "contacts": [
    {
      "first_name": "John",
      "last_name": "Smith",
      "email": "john@company.com",
      "phone": "+1-555-0123",
      "title": "CEO",
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "facebook_url": "https://www.facebook.com/johnsmith",
      "notes": "Found on about page"
    }
  ]
}

**COMPANY NAME RULES:**
- Use proper capitalization (Title Case for most words)
- Keep acronyms uppercase (LLC, Inc., Corp., USA, HVAC, etc.)
- Preserve brand-specific capitalization (e.g., "iPhone", "eBay", "YouTube")
- Remove "www." or domain suffixes
- If company name not found, use domain name with proper capitalization

**INDUSTRY DETECTION:**
- Analyze the website content to determine the business industry
- Valid categories: hvac, plumbing, roofing, electrical, automotive, legal, medical, real-estate, restaurant, retail, other
- Look for keywords in: services offered, page titles, meta descriptions, business descriptions
- Common indicators:
  * hvac: heating, cooling, air conditioning, HVAC, furnace, AC repair
  * plumbing: plumber, pipes, water heater, drain cleaning
  * roofing: roofer, roof repair, shingles, gutters
  * electrical: electrician, wiring, electrical repair
  * automotive: car repair, auto service, mechanic
  * legal: lawyer, attorney, law firm, legal services
  * medical: doctor, clinic, hospital, healthcare
  * real-estate: realtor, real estate, property, homes for sale
  * restaurant: restaurant, cafe, dining, food service
  * retail: store, shop, retail, merchandise
- If unclear or doesn't fit categories, use "other"

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

Return ONLY valid JSON with the structure above.`,
                  },
                  {
                    role: "user",
                    content: `Current Company Name: ${currentCompanyName}
Domain: ${domain}

Scraped website content:
${scrapedData.substring(0, 10000)}

Extract the proper company name and all contact information. Return ONLY the JSON object.`,
                  },
                ],
              }),
            });

            if (!aiResponse.ok) {
              const errorText = await aiResponse.text();
              console.error(`AI API error for ${domain}:`, aiResponse.status, errorText);
              
              const errorMessage = aiResponse.status === 429 
                ? "Rate limit exceeded" 
                : aiResponse.status === 402
                ? "Payment required"
                : "AI service error";
              
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ 
                    type: "error", 
                    prospectId, 
                    domain,
                    status: aiResponse.status === 429 ? "rate_limited" : "failed",
                    error: errorMessage
                  })}\n\n`
                )
              );
              
              await supabase
                .from("prospect_activities")
                .update({ status: prospect.status })
                .eq("id", prospectId);
              
              failureCount++;
              continue;
            }

            const aiData = await aiResponse.json();
            const aiContent = aiData.choices?.[0]?.message?.content;

            if (!aiContent) {
              throw new Error("No content from AI");
            }

            // Parse AI response
            let extractedData: { company_name: string; contacts: any[]; facebook_url?: string; industry?: string };
            try {
              const cleanedContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              extractedData = JSON.parse(cleanedContent);
            } catch (parseError) {
              console.error(`Failed to parse AI response for ${domain}:`, aiContent);
              throw new Error("Invalid JSON from AI");
            }

            const companyName = extractedData.company_name || currentCompanyName;
            const contacts = extractedData.contacts || [];

            // Save contacts to database
            let contactsInserted = 0;
            if (Array.isArray(contacts) && contacts.length > 0) {
              const contactsToInsert = contacts.map((contact: any) => ({
                prospect_activity_id: prospectId,
                report_id: prospect.report_id,
                first_name: contact.first_name,
                last_name: contact.last_name || null,
                email: contact.email || null,
                phone: contact.phone || null,
                title: contact.title || null,
                linkedin_url: contact.linkedin_url || null,
                facebook_url: contact.facebook_url || null,
                notes: contact.notes || null,
                is_primary: false,
              }));

              const { error: insertError } = await supabase
                .from("prospect_contacts")
                .insert(contactsToInsert);

              if (!insertError) {
                contactsInserted = contacts.length;
              }
            }

            // Update company name, Facebook URL, and industry
            const currentFacebookUrl = prospect.reports.facebook_url;
            const currentIndustry = prospect.reports.industry;
            const companyFacebookUrl = extractedData.facebook_url || null;
            const detectedIndustry = extractedData.industry || null;
            
            let companyNameUpdated = false;
            let industryUpdated = false;
            
            const updateData: any = {};
            
            // Only update company name if changed
            if (companyName && companyName !== currentCompanyName) {
              updateData.extracted_company_name = companyName;
              companyNameUpdated = true;
            }
            
            // Only update facebook_url if currently empty
            if (!currentFacebookUrl && companyFacebookUrl) {
              updateData.facebook_url = companyFacebookUrl;
            }
            
            // Only update industry if currently empty or "other"
            if (detectedIndustry && (!currentIndustry || currentIndustry === 'other')) {
              updateData.industry = detectedIndustry;
              industryUpdated = true;
            }
            
            // Apply updates if any changes detected
            if (Object.keys(updateData).length > 0) {
              await supabase
                .from("reports")
                .update(updateData)
                .eq("id", prospect.report_id);
            }

            // Update prospect status
            await supabase
              .from("prospect_activities")
              .update({
                status: "enriched",
                enrichment_source: "bulk_ai",
              })
              .eq("id", prospectId);

            // Log to audit trail
            const contextParts = [`Bulk enrichment: extracted ${contactsInserted} contacts`];
            if (companyNameUpdated) contextParts.push(`updated company name to "${companyName}"`);
            if (industryUpdated) contextParts.push(`set industry to "${detectedIndustry}"`);
            contextParts.push(`from ${domain}`);
            
            await supabase.rpc("log_business_context", {
              p_table_name: "prospect_activities",
              p_record_id: prospectId,
              p_context: contextParts.join(", "),
            });

            // Generate personalized icebreaker using AI
            console.log(`🎯 Generating personalized icebreaker for ${domain}...`);
            try {
              const { data: icebreakerData, error: icebreakerError } = await supabase.functions.invoke(
                'generate-icebreaker',
                {
                  body: {
                    prospect_activity_id: prospectId,
                    domain: domain,
                    company_name: companyName,
                    scraped_content: scrapedData,
                    force_regenerate: false
                  }
                }
              );

              if (icebreakerError) {
                console.error('⚠️ Icebreaker generation failed:', icebreakerError);
                // Don't fail enrichment - icebreaker is optional
              } else {
                console.log('✅ Icebreaker generated successfully');
              }
            } catch (icebreakerErr) {
              console.error('⚠️ Icebreaker generation error:', icebreakerErr);
              // Silent fail - enrichment still succeeds
            }

            // Send success update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: "success", 
                  prospectId, 
                  domain,
                  status: "success",
                  contactsFound: contactsInserted,
                  companyName: companyNameUpdated ? companyName : null,
                  industry: industryUpdated ? detectedIndustry : null
                })}\n\n`
              )
            );

            successCount++;

          } catch (error) {
            console.error(`Error enriching prospect ${prospectId}:`, error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ 
                  type: "error", 
                  prospectId, 
                  domain: "unknown",
                  status: "failed",
                  error: error instanceof Error ? error.message : "Unknown error" 
                })}\n\n`
              )
            );
            failureCount++;
          }

          // Add delay between requests (3-5 seconds) to avoid rate limits
          if (i < prospect_ids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
          }
        }

        // Send completion summary
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ 
              type: "complete", 
              summary: { 
                total: prospect_ids.length, 
                succeeded: successCount, 
                failed: failureCount 
              } 
            })}\n\n`
          )
        );

        console.log(`Bulk enrichment complete: ${successCount}/${prospect_ids.length} succeeded`);

      } catch (error) {
        console.error("Bulk enrichment error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ 
              type: "error", 
              error: error instanceof Error ? error.message : "Unknown error" 
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
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
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const html = await response.text();
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        allContent += text + "\n\n";
      }
    } catch (error) {
      // Continue with next URL
    }
  }

  return allContent;
}
