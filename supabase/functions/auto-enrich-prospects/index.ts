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

    // Get up to 12 prospects that need enrichment (with smart retry delays)
    const RETRY_DELAYS = [0, 1800, 7200, 86400]; // 0s, 30m, 2h, 24h
    const now = new Date();
    
    const { data: prospects, error: fetchError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        status,
        enrichment_retry_count,
        last_enrichment_attempt,
        reports!inner(domain, extracted_company_name, facebook_url, industry)
      `)
      .in("status", ["new", "enriching"])
      .lt("enrichment_retry_count", 3)
      .is("enrichment_locked_at", null) // Not currently locked
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
      const retryCount = prospect.enrichment_retry_count || 0;
      
      // Check if enough time has passed since last attempt (exponential backoff)
      if (prospect.last_enrichment_attempt && retryCount > 0) {
        const lastAttempt = new Date(prospect.last_enrichment_attempt);
        const secondsSince = (now.getTime() - lastAttempt.getTime()) / 1000;
        const requiredDelay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        
        if (secondsSince < requiredDelay) {
          console.log(`⏱️ Skipping ${domain} - retry ${retryCount} not ready (${Math.floor(requiredDelay - secondsSince)}s remaining)`);
          continue;
        }
      }
      
      console.log(`Processing ${domain} (attempt ${retryCount + 1}/3)...`);

      try {
        // Acquire enrichment lock to prevent concurrent processing
        const { data: lockAcquired } = await supabase.rpc('acquire_enrichment_lock', {
          p_prospect_id: prospect.id,
          p_source: 'auto_enrichment'
        });

        if (!lockAcquired) {
          console.log(`🔒 ${domain} is already being enriched, skipping...`);
          continue;
        }

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

**FACEBOOK URL RULES:**
- Extract the company's official Facebook page URL at the top level (e.g., https://www.facebook.com/CompanyName)
- If individual contacts have personal Facebook profiles, include in their contact object
- Look for Facebook links in contact pages, footer, social media sections
- Only include valid Facebook URLs (must start with facebook.com or fb.com)

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
                content: `Company: ${companyName}
Domain: ${domain}

Scraped website content:
${scrapedData.substring(0, 10000)}

Extract company name, Facebook URL, industry, and all contact information following the rules. Return ONLY the JSON object with the specified structure.`,
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
        let extractedData: { company_name: string; contacts: any[]; facebook_url?: string; industry?: string };
        try {
          // Remove markdown code blocks if present
          const cleanedContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          extractedData = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error("Failed to parse AI response:", aiContent);
          throw new Error("Invalid JSON from AI");
        }

        const extractedCompanyName = extractedData.company_name || companyName;
        const contacts = extractedData.contacts || [];

        console.log(`AI extracted company name: "${extractedCompanyName}" and ${contacts.length} contacts`);

        let contactsInserted = 0;

        // Save contacts to database if any found
        if (Array.isArray(contacts) && contacts.length > 0) {
          const contactsToInsert = contacts.map((contact: any) => ({
            prospect_activity_id: prospect.id,
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

          if (insertError) {
            console.error("Error inserting contacts:", insertError);
          } else {
            contactsInserted = contacts.length;
          }
        }

        // Update company name, Facebook URL, and industry in reports table
        const currentFacebookUrl = prospect.reports.facebook_url;
        const currentIndustry = prospect.reports.industry;
        const currentCompanyName = prospect.reports.extracted_company_name;
        const companyFacebookUrl = extractedData.facebook_url || null;
        const detectedIndustry = extractedData.industry || null;

        let companyNameUpdated = false;
        let facebookUrlAdded = false;
        let industryUpdated = false;

        const updateData: any = {};

        // Only update company name if changed
        if (extractedCompanyName && extractedCompanyName !== currentCompanyName) {
          updateData.extracted_company_name = extractedCompanyName;
          companyNameUpdated = true;
          console.log(`✅ Updating company name to "${extractedCompanyName}"`);
        }

        // Only update facebook_url if currently empty
        if (!currentFacebookUrl && companyFacebookUrl) {
          updateData.facebook_url = companyFacebookUrl;
          facebookUrlAdded = true;
          console.log(`✅ Adding company Facebook URL: ${companyFacebookUrl}`);
        } else if (currentFacebookUrl && companyFacebookUrl) {
          console.log(`ℹ️ Facebook URL already exists, keeping: ${currentFacebookUrl}`);
        }

        // Only update industry if currently empty or "other"
        if (detectedIndustry && (!currentIndustry || currentIndustry === 'other')) {
          updateData.industry = detectedIndustry;
          industryUpdated = true;
          console.log(`✅ Setting industry to: ${detectedIndustry}`);
        } else if (currentIndustry && currentIndustry !== 'other') {
          console.log(`ℹ️ Industry already set to "${currentIndustry}", keeping existing value`);
        }

        // Apply updates if any changes detected
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from("reports")
            .update(updateData)
            .eq("id", prospect.report_id);

          if (updateError) {
            console.error("Error updating company info:", updateError);
          }
        }

        let icebreakerGenerated = false;

        // Check if icebreaker already exists
        const { data: existingProspect } = await supabase
          .from("prospect_activities")
          .select("icebreaker_text")
          .eq("id", prospect.id)
          .single();

        const hasExistingIcebreaker = !!(existingProspect?.icebreaker_text?.trim());

        // Generate icebreaker if missing
        if (!hasExistingIcebreaker) {
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
                    content: `You are a B2B sales copywriting expert helping a sales team craft personalized cold outreach openers for local service businesses. Your goal is to write casual, friendly, colleague-like messages that feel authentic and conversational.`
                  },
                  {
                    role: "user",
                    content: `
**COMPANY INFORMATION:**
- Domain: ${domain}
- Company Name: ${companyName}

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
- Use casual language: "I noticed", "just saw", "looks like"
- Specific and personalized (reference something unique you found)
- Authentic (not obviously AI-generated or salesy)
- NO greetings (Hey, Hi, Hello, etc.) - start directly with content
- NO formal greetings like "Dear" or "To whom it may concern"
- NO obvious sales language like "I wanted to reach out about..."

**STRUCTURE:**
1st sentence: START with something SPECIFIC you found (achievement, review highlight, expansion, etc.)
2nd sentence: Natural transition mentioning you analyzed their website traffic and found untapped lead potential

**EXAMPLE OUTPUTS:**

Example 1 (HVAC):
"Just saw you folks were featured in the Tribune for your emergency response during that winter storm - impressive 24/7 service. I ran some numbers on your website traffic and noticed you might be missing out on a pretty significant number of leads each month from anonymous visitors."

Example 2 (Law Firm):
"Noticed you recently expanded into family law mediation - looks like that's filling a real gap in the area. Quick heads up: I analyzed your site traffic and found some interesting opportunities to capture more of those website visitors who are checking out your services but not filling out forms."

Example 3 (Plumbing):
"Your Google reviews are killer - 4.9 stars with customers raving about your same-day service is no joke. I took a look at your website analytics and found you're getting solid traffic, but there might be a way to turn more of those anonymous visitors into actual leads."

**IMPORTANT RULES:**
- Must reference something SPECIFIC from your web research
- Keep it under 50 words total
- Make it feel like you genuinely researched them (because you did!)
- End with a soft mention of their "lead loss" or "missed website opportunities"
- Be conversational, not corporate

${scrapedData ? `\n**WEBSITE CONTENT (for additional context):**\n${scrapedData.substring(0, 1500)}\n` : ''}

Now search the web and write the icebreaker:
`
                  }
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

        // Determine final status: enriched ONLY if we have BOTH contacts AND icebreaker (existing or newly generated)
        const hasIcebreaker = hasExistingIcebreaker || icebreakerGenerated;
        const finalStatus = (contactsInserted > 0 && hasIcebreaker) ? "enriched" : "review";

        // Update prospect status and release lock
        await supabase
          .from("prospect_activities")
          .update({
            status: finalStatus,
            auto_enriched: true,
            enrichment_source: "auto_scrape_ai",
            enrichment_locked_at: null,
            enrichment_locked_by: null,
          })
          .eq("id", prospect.id);

        // Log success to audit
        const enrichmentDetails = [];
        if (contactsInserted > 0) enrichmentDetails.push(`${contactsInserted} contacts`);
        if (hasIcebreaker) enrichmentDetails.push('icebreaker');
        
        await supabase.rpc("log_business_context", {
          p_table_name: "prospect_activities",
          p_record_id: prospect.id,
          p_context: `Auto-enrichment ${finalStatus === 'enriched' ? 'successful' : 'needs review'}: ${enrichmentDetails.join(' + ')} from ${domain}`,
        });

        results.successful++;
        results.details.push({
          domain,
          status: "success",
          contactsFound: contactsInserted,
          icebreakerGenerated: hasIcebreaker,
          finalStatus,
        });

        console.log(`✅ Successfully enriched ${domain}`);

        // Small delay between prospects
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to enrich ${domain}:`, error);

        const newRetryCount = retryCount + 1;
        const newStatus = newRetryCount >= 3 ? "enrichment_failed" : "enriching";

        // Update retry count, status, and release lock
        await supabase
          .from("prospect_activities")
          .update({
            enrichment_retry_count: newRetryCount,
            last_enrichment_attempt: new Date().toISOString(),
            status: newStatus,
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            ...(newStatus === "enrichment_failed" && {
              notes: `Auto-enrichment failed after 3 attempts. Last error: ${error instanceof Error ? error.message : String(error)}. Manual review required.`
            }),
          })
          .eq("id", prospect.id);

        // Log failure to audit
        await supabase.rpc("log_business_context", {
          p_table_name: "prospect_activities",
          p_record_id: prospect.id,
          p_context: `Auto-enrichment attempt ${newRetryCount}/3 failed: ${error instanceof Error ? error.message : String(error)}. Status: ${newStatus}.`,
        });

        results.failed++;
        results.details.push({
          domain,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          retryCount: newRetryCount,
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
