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

            // Generate personalized icebreaker using AI with Google Search grounding
            console.log(`🎯 Generating personalized icebreaker for ${domain}...`);
            let icebreakerGenerated = false;
            try {
              // Check if icebreaker already exists
              const { data: existingIcebreaker } = await supabase
                .from('prospect_activities')
                .select('icebreaker_text')
                .eq('id', prospectId)
                .single();

              if (!existingIcebreaker?.icebreaker_text) {
                const systemPrompt = `You are a B2B sales copywriting expert helping a sales team craft personalized cold outreach openers for local service businesses. Your goal is to write casual, friendly, colleague-like messages that feel authentic and conversational.`;

                const userPrompt = `
**COMPANY INFORMATION:**
- Domain: ${domain}
- Company Name: ${companyName || 'Unknown'}

**YOUR TASK:**
Search the web for recent information about this company and write a casual, friendly 1-2 sentence opener as if you're emailing a colleague.

**RESEARCH FOCUS:**
- Recent news mentions or press releases
- Customer reviews and testimonials (especially standout feedback)
- Awards, certifications, or recognitions
- Service expansions or new offerings
- Community involvement or charity work
- Notable projects or case studies
- Social media highlights

**TONE & STYLE:**
- Conversational and warm (like internal team communication)
- Use casual language: "Hey", "I noticed", "just saw", "looks like"
- Specific and personalized (reference something unique you found)
- Authentic (not obviously AI-generated or salesy)
- NO formal greetings like "Dear" or "To whom it may concern"
- NO obvious sales language like "I wanted to reach out about..."

**STRUCTURE:**
1st sentence: Reference something SPECIFIC you found (achievement, review highlight, expansion, etc.)
2nd sentence: Natural transition mentioning you analyzed their website traffic and found untapped lead potential

**EXAMPLE OUTPUTS:**

Example 1 (HVAC):
"Hey! Just saw you folks were featured in the Tribune for your emergency response during that winter storm - impressive 24/7 service. I ran some numbers on your website traffic and noticed you might be missing out on a pretty significant number of leads each month from anonymous visitors."

Example 2 (Law Firm):
"Hey there! Noticed you recently expanded into family law mediation - looks like that's filling a real gap in the area. Quick heads up: I analyzed your site traffic and found some interesting opportunities to capture more of those website visitors who are checking out your services but not filling out forms."

Example 3 (Plumbing):
"Hey! Your Google reviews are killer - 4.9 stars with customers raving about your same-day service is no joke. I took a look at your website analytics and found you're getting solid traffic, but there might be a way to turn more of those anonymous visitors into actual leads."

**IMPORTANT RULES:**
- Must reference something SPECIFIC from your web research
- Keep it under 50 words total
- Make it feel like you genuinely researched them (because you did!)
- End with a soft mention of their "lead loss" or "missed website opportunities"
- Be conversational, not corporate

${scrapedData ? `\n**WEBSITE CONTENT (for additional context):**\n${scrapedData.substring(0, 1500)}\n` : ''}

Now search the web and write the icebreaker:
`;

                const icebreakerResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${lovableApiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: userPrompt }
                    ],
                    tools: [{ type: "google_search_retrieval" }],
                    temperature: 0.8,
                  }),
                });

                if (icebreakerResponse.ok) {
                  const icebreakerData = await icebreakerResponse.json();
                  const icebreaker = icebreakerData.choices?.[0]?.message?.content?.trim();

                  if (icebreaker) {
                    await supabase
                      .from('prospect_activities')
                      .update({
                        icebreaker_text: icebreaker,
                        icebreaker_generated_at: new Date().toISOString(),
                        icebreaker_edited_manually: false
                      })
                      .eq('id', prospectId);

                    console.log(`✅ Icebreaker generated for ${domain}`);
                    icebreakerGenerated = true;
                  }
                } else {
                  const errorText = await icebreakerResponse.text();
                  console.error(`⚠️ Icebreaker generation failed for ${domain}:`, icebreakerResponse.status, errorText);
                }
              } else {
                console.log(`ℹ️ Icebreaker already exists for ${domain}, skipping generation`);
                icebreakerGenerated = true;
              }
            } catch (icebreakerErr) {
              console.error(`⚠️ Icebreaker generation error for ${domain}:`, icebreakerErr);
              // Silent fail - enrichment still succeeds
            }

            // Determine final status: enriched ONLY if we have BOTH contacts AND icebreaker
            const finalStatus = (contactsInserted > 0 && icebreakerGenerated) ? "enriched" : "review";

            // Update prospect status AFTER both contacts and icebreaker attempts
            await supabase
              .from("prospect_activities")
              .update({
                status: finalStatus,
                enrichment_source: "bulk_ai",
              })
              .eq("id", prospectId);

            // Log to audit trail
            const contextParts = [`Bulk enrichment: extracted ${contactsInserted} contacts`];
            if (icebreakerGenerated) contextParts.push('generated icebreaker');
            if (companyNameUpdated) contextParts.push(`updated company name to "${companyName}"`);
            if (industryUpdated) contextParts.push(`set industry to "${detectedIndustry}"`);
            contextParts.push(`from ${domain}`);
            contextParts.push(`final status: ${finalStatus}`);
            
            await supabase.rpc("log_business_context", {
              p_table_name: "prospect_activities",
              p_record_id: prospectId,
              p_context: contextParts.join(", "),
            });

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
