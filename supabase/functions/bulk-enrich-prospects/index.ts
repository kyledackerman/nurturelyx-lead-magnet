import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { rateLimiter, RATE_LIMITS } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse and validate request BEFORE creating stream
  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const { prospect_ids, job_id, processing_mode = 'parallel' } = requestBody;

  // Validate prospect_ids early
  if (!Array.isArray(prospect_ids) || prospect_ids.length === 0) {
    return new Response(
      JSON.stringify({ error: "prospect_ids array is required and must not be empty" }), 
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  // Rate limiting by user session or IP
  const authHeader = req.headers.get('authorization');
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'anonymous';
  const rateLimitKey = authHeader ? `bulk-enrich:${authHeader.substring(0, 20)}` : `bulk-enrich:${clientIp}`;
  
  if (rateLimiter.isRateLimited(rateLimitKey, RATE_LIMITS.WRITE.limit, RATE_LIMITS.WRITE.windowMs)) {
    const remaining = rateLimiter.getRemaining(rateLimitKey, RATE_LIMITS.WRITE.limit);
    const resetAt = rateLimiter.getResetAt(rateLimitKey);
    
    return new Response(
      JSON.stringify({ 
        error: "Rate limit exceeded. Please wait before retrying.",
        remaining,
        resetAt: resetAt ? new Date(resetAt).toISOString() : null
      }), 
      { 
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log(`Starting bulk enrichment for ${prospect_ids.length} prospects (mode: ${processing_mode})...`);

        // Create or update enrichment job
        let enrichmentJobId = job_id;
        if (!enrichmentJobId) {
          const { data: jobData, error: jobError } = await supabase
            .from('enrichment_jobs')
            .insert({
              total_count: prospect_ids.length,
              job_type: 'manual'
            })
            .select('id')
            .single();
          
          if (jobError) {
            console.error('Failed to create job:', jobError);
          } else {
            enrichmentJobId = jobData.id;
            console.log(`Created enrichment job: ${enrichmentJobId}`);
          }
        }

        // PHASE 3: Batch-fetch all prospect details in ONE query
        const { data: allProspects, error: fetchAllError } = await supabase
          .from("prospect_activities")
          .select(`
            id,
            report_id,
            status,
            enrichment_locked_at,
            reports!inner(domain, extracted_company_name, facebook_url, industry)
          `)
          .in("id", prospect_ids);

        if (fetchAllError || !allProspects) {
          console.error(`Failed to fetch prospects:`, fetchAllError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: "Failed to fetch prospects" })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // PHASE 3: Batch-acquire locks for all prospects in parallel
        // Create job items for all prospects
        if (enrichmentJobId) {
          const jobItems = allProspects.map(p => ({
            job_id: enrichmentJobId,
            prospect_id: p.id,
            domain: p.reports.domain,
            status: 'pending'
          }));
          
          await supabase.from('enrichment_job_items').insert(jobItems);
        }

        console.log(`🔒 Acquiring locks for ${allProspects.length} prospects (${processing_mode} mode)...`);
        
        let lockResults;
        if (processing_mode === 'sequential') {
          // Sequential processing - one at a time
          lockResults = [];
          for (const p of allProspects) {
            const { data: locked } = await supabase.rpc('acquire_enrichment_lock', {
              p_prospect_id: p.id,
              p_source: 'bulk_enrichment'
            });
            lockResults.push({ prospectId: p.id, locked: !!locked, domain: p.reports.domain });
          }
        } else {
          // Parallel processing - all at once (default)
          lockResults = await Promise.all(
            allProspects.map(async (p) => {
              const { data: locked } = await supabase.rpc('acquire_enrichment_lock', {
                p_prospect_id: p.id,
                p_source: 'bulk_enrichment'
              });
              return { prospectId: p.id, locked: !!locked, domain: p.reports.domain };
            })
          );
        }

        // Filter to only process successfully locked prospects
        const lockedProspectIds = lockResults
          .filter(r => r.locked)
          .map(r => r.prospectId);

        // Send skipped events for already-locked prospects
        const skippedProspects = lockResults.filter(r => !r.locked);
        for (const skipped of skippedProspects) {
          console.log(`🔒 Prospect ${skipped.prospectId} (${skipped.domain}) already being enriched - skipping`);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: "error", 
                prospectId: skipped.prospectId, 
                domain: skipped.domain,
                status: "skipped",
                error: "Already being enriched" 
              })}\n\n`
            )
          );
        }

        console.log(`✅ Successfully locked ${lockedProspectIds.length}/${allProspects.length} prospects`);

        let successCount = 0;
        let failureCount = skippedProspects.length; // Count skipped as failures

        // Process only successfully locked prospects
        for (let i = 0; i < lockedProspectIds.length; i++) {
          const prospectId = lockedProspectIds[i];
          const prospect = allProspects.find(p => p.id === prospectId)!;
          
          try {
            const domain = prospect.reports.domain;
            const currentCompanyName = prospect.reports.extracted_company_name || domain;

            // Update job item status to processing
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_job_items')
                .update({ 
                  status: 'processing',
                  started_at: new Date().toISOString()
                })
                .eq('job_id', enrichmentJobId)
                .eq('prospect_id', prospectId);
            }

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

            // Scrape the website
            const { content: scrapedData, socialLinks } = await scrapeWebsite(domain);

            if (!scrapedData || scrapedData.length === 0) {
              console.log(`⚠️ Scraping failed for ${domain}, attempting Google Search fallback...`);
              
              // Try Google Search for emails as fallback
              const foundEmails = await googleSearchEmails(domain, currentCompanyName, lovableApiKey);
              
              if (foundEmails.length > 0) {
                // SUCCESS with fallback - create contacts from emails
                const contactsToInsert = foundEmails.map((email: string) => ({
                  prospect_activity_id: prospectId,
                  report_id: prospect.report_id,
                  first_name: "Office",
                  email: email,
                  title: "Contact Found via Search",
                  notes: "Email found via Google Search (website scraping blocked)",
                  is_primary: false,
                }));

                await supabase.from("prospect_contacts").insert(contactsToInsert);
                
                // Update to enriched with fallback source
                await supabase.from("prospect_activities").update({
                  status: "enriched",
                  enrichment_source: 'google_search_only',
                  enrichment_retry_count: 0,
                  last_enrichment_attempt: new Date().toISOString()
                }).eq("id", prospectId);
                
                // Update job item
                if (enrichmentJobId) {
                  await supabase.from('enrichment_job_items').update({ 
                    status: 'completed',
                    contacts_found: foundEmails.length,
                    completed_at: new Date().toISOString()
                  }).eq('job_id', enrichmentJobId).eq('prospect_id', prospectId);
                }
                
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ 
                      type: "success", 
                      prospectId, 
                      domain,
                      status: "enriched",
                      contacts: foundEmails.length,
                      message: `✅ Enriched via Google Search: Found ${foundEmails.length} email(s). Website scraping was blocked.`
                    })}\n\n`
                  )
                );
                
                successCount++;
                continue;
              }
              
              // BOTH methods failed - increment retry count and possibly move to review
              const currentRetryCount = prospect.enrichment_retry_count || 0;
              const newRetryCount = currentRetryCount + 1;
              const shouldMoveToReview = newRetryCount >= 2;
              
              const newStatus = shouldMoveToReview ? "review" : prospect.status;
              const errorNote = shouldMoveToReview 
                ? `⚠️ Enrichment failed after ${newRetryCount} attempts. Moved to review queue - website may be blocked or inaccessible.`
                : `⚠️ Enrichment attempt ${newRetryCount} failed. Will retry later.`;
              
              await supabase.from("prospect_activities").update({
                status: newStatus,
                enrichment_retry_count: newRetryCount,
                last_enrichment_attempt: new Date().toISOString()
              }).eq("id", prospectId);
              
              if (enrichmentJobId) {
                await supabase.from('enrichment_job_items').update({ 
                  status: 'failed',
                  error_message: `Could not access website (attempt ${newRetryCount})${shouldMoveToReview ? ' - Moved to review' : ''}`,
                  completed_at: new Date().toISOString()
                }).eq('job_id', enrichmentJobId).eq('prospect_id', prospectId);
              }
              
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ 
                    type: shouldMoveToReview ? "moved_to_review" : "error", 
                    prospectId, 
                    domain,
                    status: newStatus,
                    retryCount: newRetryCount,
                    error: shouldMoveToReview 
                      ? `Moved to review after ${newRetryCount} failures` 
                      : `Could not access website (attempt ${newRetryCount})`
                  })}\n\n`
                )
              );
              
              failureCount++;
              continue;
            }
            
            // Phase 2: Facebook Scraping (check settings first)
            let facebookData = "";
            
            // Fetch Facebook scraping setting
            const { data: settings } = await supabase
              .from("enrichment_settings")
              .select("facebook_scraping_enabled")
              .single();
            
            const facebookScrapingEnabled = settings?.facebook_scraping_enabled || false;
            
            if (facebookScrapingEnabled) {
              const facebookUrlMatch = socialLinks.match(/https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[^\s]+/i);
              if (facebookUrlMatch) {
                const extractedFacebookUrl = facebookUrlMatch[0];
                console.log(`📘 Found Facebook URL: ${extractedFacebookUrl}`);
                facebookData = await scrapeFacebookPage(extractedFacebookUrl);
              }
            } else {
              console.log(`⏭️ Facebook scraping disabled, skipping...`);
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
                    content: `Current Company Name: ${currentCompanyName}
Domain: ${domain}

**SOCIAL MEDIA LINKS FOUND:**
${socialLinks || 'None found'}

**WEBSITE CONTENT:**
${scrapedData.substring(0, 8000)}

${facebookData ? `\n**FACEBOOK PAGE CONTENT:**\n${facebookData.substring(0, 2000)}\n` : ''}

Extract the proper company name and all contact information. BE AGGRESSIVE in finding contacts - include phone numbers, emails, and addresses even if no specific person is named. Return ONLY the JSON object.`,
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
              
              if (enrichmentJobId) {
                await supabase
                  .from('enrichment_job_items')
                  .update({ 
                    status: aiResponse.status === 429 ? 'rate_limited' : 'failed',
                    error_message: errorMessage,
                    completed_at: new Date().toISOString()
                  })
                  .eq('job_id', enrichmentJobId)
                  .eq('prospect_id', prospectId);
              }
              
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
            let contacts = extractedData.contacts || [];

            // Phase 5: Stage 3: If no contacts found, try Google Search for emails
            if (contacts.length === 0) {
              console.log(`⚠️ No contacts found for ${domain}, attempting Google Search for emails...`);
              const foundEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
              
              if (foundEmails.length > 0) {
                console.log(`✅ Google Search found ${foundEmails.length} emails for ${domain}`);
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
            } else {
              console.log(`⚠️ No contacts extracted for ${domain} - will be set to review status`);
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

            // Check if we found any contacts with email addresses
            const contactsWithEmail = contacts.filter((c: any) => c.email && c.email.trim() !== '');
            const hasValidContacts = contactsWithEmail.length > 0;

            // Determine final status: enriched ONLY if we have email contacts AND icebreaker, otherwise review
            const finalStatus = (hasValidContacts && icebreakerGenerated) ? "enriched" : "review";

            // Update prospect status, enrichment_status, and release lock
            await supabase
              .from("prospect_activities")
              .update({
                status: finalStatus,
                enrichment_source: "bulk_ai",
                enrichment_locked_at: null,
                enrichment_locked_by: null,
                enrichment_status: {
                  has_company_info: !!companyName,
                  has_contacts: contactsInserted > 0,
                  has_emails: hasValidContacts,
                  has_phones: contactsInserted > 0,
                  has_icebreaker: icebreakerGenerated,
                  facebook_found: !!companyFacebookUrl,
                  industry_found: !!detectedIndustry
                },
              })
              .eq("id", prospectId);

            // Log to audit trail
            const contextParts = [`Bulk enrichment: extracted ${contactsInserted} contacts (${contactsWithEmail.length} with email)`];
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
            successCount++;
            
            // Update job item status to success
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_job_items')
                .update({ 
                  status: 'success',
                  contacts_found: contactsInserted,
                  completed_at: new Date().toISOString()
                })
                .eq('job_id', enrichmentJobId)
                .eq('prospect_id', prospectId);
            }
            
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

          } catch (error) {
            console.error(`Error enriching prospect ${prospectId}:`, error);
            
            // Update job item status to failed
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_job_items')
                .update({ 
                  status: 'failed',
                  error_message: error instanceof Error ? error.message : 'Unknown error',
                  completed_at: new Date().toISOString()
                })
                .eq('job_id', enrichmentJobId)
                .eq('prospect_id', prospectId);
            }
            
            // Release lock on error
            await supabase.rpc('release_enrichment_lock', {
              p_prospect_id: prospectId
            });
            
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
        // Mark job as completed
        if (enrichmentJobId) {
          await supabase
            .from('enrichment_jobs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              processed_count: successCount + failureCount,
              success_count: successCount,
              failed_count: failureCount
            })
            .eq('id', enrichmentJobId);
        }
        
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

async function scrapeWebsite(domain: string): Promise<{ content: string; socialLinks: string }> {
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
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const html = await response.text();
        
        // Phase 1: Extract social links BEFORE stripping HTML
        const socialLinks = extractSocialLinks(html);
        if (socialLinks) {
          allSocialLinks += socialLinks + "\n";
        }

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

  return { content: allContent, socialLinks: allSocialLinks };
}

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
