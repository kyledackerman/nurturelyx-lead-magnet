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

        // Phase 5: Multi-stage enrichment - Stage 1: Website Scraping
        const { content: scrapedData, socialLinks } = await scrapeWebsite(domain);
        
        // Don't hard-fail if scraping fails - try alternative methods
        if (!scrapedData || scrapedData.length === 0) {
          console.log(`⚠️ No website data scraped for ${domain}, trying alternative enrichment methods...`);
          
          // Try Google Search for emails as fallback
          const foundEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
          
          if (foundEmails.length > 0) {
            console.log(`✅ Google Search found ${foundEmails.length} emails despite scraping failure`);
            
            // Create contacts from emails
            const contactsToInsert = foundEmails.map(email => ({
              prospect_activity_id: prospect.id,
              report_id: prospect.report_id,
              first_name: "Office",
              last_name: null,
              email: email,
              phone: null,
              title: "Contact Found via Search",
              linkedin_url: null,
              facebook_url: null,
              notes: "Email found via Google Search (website scraping blocked)",
              is_primary: false,
            }));

            const { error: insertError } = await supabase
              .from("prospect_contacts")
              .insert(contactsToInsert);

            if (!insertError) {
              // Mark as 'enriched' - partial data is still successful enrichment
              await supabase
                .from("prospect_activities")
                .update({
                  status: "enriched",
                  enrichment_retry_count: 0,
                  last_enrichment_attempt: new Date().toISOString(),
                  enrichment_source: 'google_search_only',
                  auto_enriched: true,
                  notes: `✅ Enriched via Google Search: Found ${foundEmails.length} email(s). Website scraping was blocked.`
                })
                .eq("id", prospect.id);

              await supabase.rpc('release_enrichment_lock', { p_prospect_id: prospect.id });

              results.successful++;
              results.details.push({
                domain,
                status: "partial_success",
                contacts: foundEmails.length,
                reason: "Website blocked, found emails via search"
              });
              
              continue; // Move to next prospect
            }
          }
          
          // If all methods fail, mark as review (not failed) to allow manual handling
          await supabase
            .from("prospect_activities")
            .update({
              status: "review",
              enrichment_retry_count: (retryCount + 1),
              last_enrichment_attempt: new Date().toISOString(),
              enrichment_source: 'failed_all_methods',
              notes: `⚠️ Auto-enrichment could not scrape website after ${retryCount + 1} attempts. Needs manual review.`
            })
            .eq("id", prospect.id);

          await supabase.rpc('release_enrichment_lock', { p_prospect_id: prospect.id });

          results.failed++;
          results.details.push({
            domain,
            status: "needs_review",
            reason: "All enrichment methods failed - website blocked"
          });
          
          continue; // Move to next prospect
        }

        console.log(`Scraped ${scrapedData.length} characters from ${domain}`);
        
        // Phase 5: Stage 2: Facebook Scraping (if Facebook URL found in social links)
        let facebookData = "";
        const facebookUrlMatch = socialLinks.match(/https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[^\s]+/i);
        if (facebookUrlMatch) {
          const extractedFacebookUrl = facebookUrlMatch[0];
          console.log(`📘 Found Facebook URL: ${extractedFacebookUrl}`);
          facebookData = await scrapeFacebookPage(extractedFacebookUrl);
        }
        
        // Phase 5: Stage 3: Google Search for emails (if no contacts found initially)
        // We'll attempt this after the first AI extraction

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

**PHASE 3: ENHANCED CONTACT EXTRACTION RULES (BE AGGRESSIVE)**
- ✅ INCLUDE: info@, contact@, sales@, admin@, support@, hello@, team@, office@
- ✅ INCLUDE: Personal emails like @gmail.com, @yahoo.com, @hotmail.com, @outlook.com
- ✅ INCLUDE: All emails with person names (john.smith@company.com)
- ✅ INCLUDE: Phone numbers from contact pages even without names
- ✅ INCLUDE: Addresses and locations from contact pages
- ✅ CREATE GENERIC CONTACTS: If you find phone/email/address but no name, create a contact with first_name="Office" or "Reception" and add details to notes
- ❌ ONLY EXCLUDE: noreply@, no-reply@, donotreply@, mailer-daemon@, example@example.com

**CRITICAL: ACCEPT GENERAL BUSINESS CONTACTS**
- If you find a contact form with phone number but no specific person → CREATE CONTACT: first_name="Office", phone=number, title="General Contact"
- If you find "Call us at 555-1234" → CREATE CONTACT: first_name="Office", phone="555-1234", title="Phone Contact"
- If you find "Email: info@company.com" → CREATE CONTACT: first_name="Office", email="info@company.com", title="General Contact"
- If you find business address → ADD to notes field of Office contact
- If you find ANY contact information on /contact or /about pages → INCLUDE IT (create generic contact if needed)

**CONTEXT FILTERING (Still exclude testimonials):**
- ❌ EXCLUDE contacts found in testimonial sections
- ❌ EXCLUDE contacts with context like: "customer says", "client review", "testimonial from", "case study"
- ❌ EXCLUDE contacts mentioned as users/customers of the company
- ✅ INCLUDE contacts from: "our team", "contact us", "meet our staff", "leadership", "about us", "get in touch"
- ✅ Prioritize contacts from: /contact, /about, /team pages
- ❌ Ignore contacts from: /testimonials, /reviews, /case-studies sections
- ⚠️ When in doubt on /contact or /about pages → INCLUDE (be aggressive)

**NOTES FIELD REQUIREMENT:**
- MUST include where the contact was found (e.g., "Found on contact page", "Listed on team page", "Phone number from contact form")
- If found in testimonial/review context, DO NOT include the contact at all

Return ONLY valid JSON with the structure above.`,
              },
              {
                role: "user",
                content: `Company: ${companyName}
Domain: ${domain}

**SOCIAL MEDIA LINKS FOUND:**
${socialLinks || 'None found'}

**WEBSITE CONTENT:**
${scrapedData.substring(0, 8000)}

${facebookData ? `\n**FACEBOOK PAGE CONTENT:**\n${facebookData.substring(0, 2000)}\n` : ''}

Extract company name, Facebook URL, industry, and all contact information following the rules. BE AGGRESSIVE in finding contacts - include phone numbers, emails, and addresses even if no specific person is named. Return ONLY the JSON object with the specified structure.`,
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
        let contacts = extractedData.contacts || [];

        console.log(`AI extracted company name: "${extractedCompanyName}" and ${contacts.length} contacts`);

        // Phase 5: Stage 3: If no contacts found, try Google Search for emails
        if (contacts.length === 0) {
          console.log(`⚠️ No contacts found, attempting Google Search for emails...`);
          const foundEmails = await googleSearchEmails(domain, extractedCompanyName, lovableApiKey);
          
          if (foundEmails.length > 0) {
            console.log(`✅ Google Search found ${foundEmails.length} emails`);
            contacts = foundEmails.map(email => ({
              first_name: "Office",
              last_name: null,
              email: email,
              phone: null,
              title: "Contact Found via Search",
              linkedin_url: null,
              facebook_url: null,
              notes: "Email found via Google Search"
            }));
          }
        }

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

// Phase 1: Extract social media links from HTML before stripping tags
function extractSocialLinks(html: string): string {
  const socialLinks = new Set<string>();
  
  // Extract all href attributes
  const hrefMatches = html.matchAll(/href=["']([^"']+)["']/gi);
  for (const match of hrefMatches) {
    const url = match[1].toLowerCase();
    if (url.includes('facebook.com') || url.includes('fb.com') || 
        url.includes('linkedin.com') || url.includes('twitter.com') || 
        url.includes('instagram.com')) {
      socialLinks.add(match[1]);
    }
  }
  
  return Array.from(socialLinks).join('\n');
}

// Phase 2: Scrape Facebook "About" page for contact info
async function scrapeFacebookPage(facebookUrl: string): Promise<string> {
  if (!facebookUrl) return "";
  
  try {
    // Try to scrape the About page
    const aboutUrl = facebookUrl.replace(/\/$/, '') + '/about';
    console.log(`Scraping Facebook page: ${aboutUrl}...`);
    
    const response = await fetch(aboutUrl, {
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
      
      console.log(`✅ Scraped Facebook page (${text.length} chars)`);
      return text;
    }
  } catch (error) {
    console.log(`⚠️ Failed to scrape Facebook page:`, error instanceof Error ? error.message : String(error));
  }
  
  return "";
}

// Phase 4: Use Google Search to find email addresses
async function googleSearchEmails(domain: string, companyName: string, lovableApiKey: string): Promise<string[]> {
  try {
    console.log(`🔍 Searching for emails via Google Search for ${domain}...`);
    
    const searchQuery = `site:${domain} @${domain} OR contact OR email`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are an email extraction specialist. Extract ALL email addresses from the search results."
          },
          {
            role: "user",
            content: `Search query: ${searchQuery}\n\nExtract all email addresses found. Return ONLY a JSON array of email strings: ["email1@domain.com", "email2@domain.com"]`
          }
        ],
        tools: [{ type: "google_search_retrieval" }],
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const emails = JSON.parse(cleanedContent);
          if (Array.isArray(emails)) {
            console.log(`✅ Found ${emails.length} emails via Google Search`);
            return emails;
          }
        } catch (e) {
          console.log(`⚠️ Failed to parse email search results`);
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ Google Search failed:`, error instanceof Error ? error.message : String(error));
  }
  
  return [];
}

async function scrapeWebsite(domain: string): Promise<{ content: string; socialLinks: string }> {
  // Rotate through modern User-Agents to avoid bot detection
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  
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
  let allSocialLinks = "";

  for (const url of urlsToTry) {
    try {
      console.log(`Scraping ${url}...`);
      
      // Use random User-Agent for each request
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': randomUA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000), // Increase to 15 seconds
      });

      if (response.ok) {
        const html = await response.text();
        
        // Phase 1: Extract social links BEFORE stripping HTML
        const socialLinks = extractSocialLinks(html);
        if (socialLinks) {
          allSocialLinks += socialLinks + "\n";
        }

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
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
    } catch (error) {
      console.log(`⚠️ Failed to scrape ${url}:`, error instanceof Error ? error.message : String(error));
    }
  }

  return { content: allContent, socialLinks: allSocialLinks };
}
