import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { rateLimiter, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { ENRICHMENT_CONFIG } from "../_shared/enrichmentConfig.ts";

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
      // Helper to safely enqueue messages (prevents stream errors from breaking enrichment)
      const safeEnqueue = (message: string) => {
        try {
          controller.enqueue(encoder.encode(message));
        } catch (err) {
          // Stream already closed or errored - log but don't throw
          console.warn('⚠️ Failed to send progress update (stream closed):', err);
        }
      };
      
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log(`Starting bulk enrichment for ${prospect_ids.length} prospects (mode: ${processing_mode})...`);

        // PHASE 2: PRE-FLIGHT CHECK - BEFORE creating job record
        // Prevent concurrent enrichments (only 1 at a time)
        const { data: runningJobs, error: checkError } = await supabase
          .from('enrichment_jobs')
          .select('id, started_at')
          .eq('status', 'running');
        
        if (checkError) {
          console.error('❌ Failed to check for running jobs:', checkError);
        } else if (runningJobs && runningJobs.length > 0) {
          const oldestJob = runningJobs[0];
          const jobAge = Date.now() - new Date(oldestJob.started_at).getTime();
          const minutesAgo = Math.round(jobAge / 60000);
          
          console.log(`⚠️ Cannot start: ${runningJobs.length} job(s) already running (oldest: ${minutesAgo}min ago)`);
          safeEnqueue(
            `data: ${JSON.stringify({ 
              type: "error", 
              error: `Another enrichment is already running (started ${minutesAgo} minutes ago). Please wait or stop the current job before starting a new one.` 
            })}\n\n`
          );
          controller.close();
          return; // Exit WITHOUT creating a job record
        }

        // Create enrichment job (only after passing pre-flight check)
        const { data: jobData, error: jobError } = await supabase
          .from('enrichment_jobs')
          .insert({
            total_count: prospect_ids.length,
            job_type: 'manual'
          })
          .select('id')
          .single();
        
        if (jobError || !jobData) {
          console.error('Failed to create job:', jobError);
          safeEnqueue(
            `data: ${JSON.stringify({ type: "error", error: "Failed to create enrichment job" })}\n\n`
          );
          controller.close();
          return;
        }
        
        const enrichmentJobId = jobData.id;
        console.log(`✅ Created enrichment job: ${enrichmentJobId}`);

        // Batch-fetch all prospect details in ONE query
        const { data: allProspects, error: fetchAllError } = await supabase
          .from("prospect_activities")
          .select(`
            id,
            report_id,
            status,
            enrichment_locked_at,
            enrichment_retry_count,
            reports!inner(domain, extracted_company_name, facebook_url, industry)
          `)
          .in("id", prospect_ids);
        
        if (fetchAllError || !allProspects) {
          console.error(`Failed to fetch prospects:`, fetchAllError);
          safeEnqueue(
            `data: ${JSON.stringify({ type: "error", error: "Failed to fetch prospects" })}\n\n`
          );
          controller.close();
          return;
        }
        
        // Filter out prospects that have already been attempted once (1-attempt policy)
        const eligibleProspects = allProspects.filter(p => {
          const retryCount = p.enrichment_retry_count || 0;
          if (retryCount >= 1) {
            console.log(`⏭️ Skipping ${p.reports.domain} - already attempted enrichment once (terminal)`);
            return false;
          }
          return true;
        });

        if (eligibleProspects.length === 0) {
          safeEnqueue(
            `data: ${JSON.stringify({ 
              type: "error", 
              error: "All selected prospects have already been enriched once. Please select different prospects or manually review failed ones." 
            })}\n\n`
          );
          controller.close();
          return;
        }

        // Emit job_started event so client knows the job ID and can display progress
        safeEnqueue(
          `data: ${JSON.stringify({ 
            type: "job_started", 
            jobId: enrichmentJobId,
            total: eligibleProspects.length
          })}\n\n`
        );
        console.log(`📡 Emitted job_started event for job ${enrichmentJobId}`);

        // Create job items for ELIGIBLE prospects only
        if (enrichmentJobId) {
          const jobItems = eligibleProspects.map(p => ({
            job_id: enrichmentJobId,
            prospect_id: p.id,
            domain: p.reports.domain,
            status: 'pending'
          }));
          
          await supabase.from('enrichment_job_items').insert(jobItems);
        }

        console.log(`🔒 Acquiring locks for ${eligibleProspects.length} prospects (${processing_mode} mode)...`);
        
        let lockResults;
        if (processing_mode === 'sequential') {
          // Sequential processing - one at a time
          lockResults = [];
          for (const p of eligibleProspects) {
            const { data: locked } = await supabase.rpc('acquire_enrichment_lock', {
              p_prospect_id: p.id,
              p_source: 'bulk_enrichment'
            });
            lockResults.push({ prospectId: p.id, locked: !!locked, domain: p.reports.domain });
          }
        } else {
          // Parallel processing - all at once (default)
          lockResults = await Promise.all(
            eligibleProspects.map(async (p) => {
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
          safeEnqueue(
            `data: ${JSON.stringify({ 
              type: "error", 
              prospectId: skipped.prospectId, 
              domain: skipped.domain,
              status: "skipped",
              error: "Already being enriched" 
            })}\n\n`
          );
        }

        console.log(`✅ Successfully locked ${lockedProspectIds.length}/${eligibleProspects.length} prospects`);

        let successCount = 0;
        let failureCount = skippedProspects.length; // Count skipped as failures

        // HARD GUARDRAIL: Filter out already enriched prospects and .edu/.gov/.mil domains
        const prospectsToEnrich = eligibleProspects.filter(p => {
          if (!lockedProspectIds.includes(p.id)) return false;
          
          const domain = p.reports.domain.toLowerCase();
          if (domain.endsWith('.edu') || domain.endsWith('.gov') || domain.endsWith('.mil')) {
            console.log(`⊘ Skipping ${p.reports.domain}: government/educational domain not viable for B2B`);
            return false;
          }
          
          return true;
        });
        const safeProspects = [];
        
        for (const p of prospectsToEnrich) {
          if (p.status === 'enriched') {
            console.log(`⚠️ SKIP: ${p.reports.domain} - already enriched (status='enriched')`);
            // Release the lock
            await supabase
              .from('prospect_activities')
              .update({
                enrichment_locked_at: null,
                enrichment_locked_by: null
              })
              .eq('id', p.id);
            continue;
          }
          safeProspects.push(p);
        }
        
        console.log(`✅ Enriching ${safeProspects.length} prospects (skipped ${prospectsToEnrich.length - safeProspects.length} already enriched)`);

        // Process only safe prospects
        for (let i = 0; i < safeProspects.length; i++) {
          const prospect = safeProspects[i];
          const prospectId = prospect.id;
          
          // Check if job has been stopped
          if (enrichmentJobId) {
            const { data: jobData } = await supabase
              .from('enrichment_jobs')
              .select('status')
              .eq('id', enrichmentJobId)
              .single();
            
            if (jobData?.status === 'stopped') {
              console.log(`🛑 Job ${enrichmentJobId} stopped by user, breaking enrichment loop`);
              safeEnqueue(
                `data: ${JSON.stringify({ type: "job_stopped", jobId: enrichmentJobId })}\n\n`
              );
              break;
            }
          }
          
          const maxProspectTime = 90000; // 90 seconds max per prospect
          
          const processProspect = async () => {
            let finalStatusWritten = false;
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
            safeEnqueue(
              `data: ${JSON.stringify({ 
                type: "progress", 
                prospectId, 
                domain,
                status: "processing" 
              })}\n\n`
            );

            // Scrape the website
            let scrapedData = "";
            let socialLinks = "";
            const scrapeResult = await scrapeWebsite(domain);
            scrapedData = scrapeResult.content;
            socialLinks = scrapeResult.socialLinks;

            // If scraping failed/blocked, try using Google Search to fetch website content
            if (!scrapedData || scrapedData.length === 0) {
              console.log(`⚠️ Direct scraping failed for ${domain}, using Google Search to fetch website content...`);
              scrapedData = await fetchWebsiteViaGoogleSearch(domain, lovableApiKey);
            }

            // If we still have no content, fail fast
            if (!scrapedData || scrapedData.length === 0) {
              console.log(`❌ ${domain} - Both direct scraping and Google fetch failed`);
              
              const currentRetryCount = prospect.enrichment_retry_count || 0;
              const newRetryCount = currentRetryCount + 1;
              
              await supabase.from("prospect_activities").update({
                status: 'review',
                enrichment_retry_count: newRetryCount,
                last_enrichment_attempt: new Date().toISOString(),
                notes: `⚠️ Enrichment failed (attempt ${newRetryCount}). Could not access website. Manual review needed.`
              }).eq("id", prospectId);
              
              if (enrichmentJobId) {
                await supabase.from('enrichment_job_items').update({ 
                  status: 'failed',
                  error_message: `Could not access website (attempt ${newRetryCount})`,
                  completed_at: new Date().toISOString()
                }).eq('job_id', enrichmentJobId).eq('prospect_id', prospectId);
              }
              
              safeEnqueue(
                `data: ${JSON.stringify({ 
                  type: "needs_review", 
                  prospectId, 
                  domain,
                  status: 'review',
                  retryCount: newRetryCount,
                  error: `Could not access website (attempt ${newRetryCount})`
                })}\n\n`
              );
              
              failureCount++;
              
              if (enrichmentJobId) {
                await supabase
                  .from('enrichment_jobs')
                  .update({
                    processed_count: successCount + failureCount,
                    success_count: successCount,
                    failed_count: failureCount,
                  })
                  .eq('id', enrichmentJobId);
              }
              
              return;
            }
            
            console.log(`✅ Got ${scrapedData.length} characters of content for ${domain}`);
          
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
- ❌ EXCLUDE: noreply@, no-reply@, donotreply@, mailer-daemon@, example@example.com
- ❌ EXCLUDE: All .gov, .edu, and .mil email domains (government/educational institutions)

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

${facebookData ? `\n**🔥 FACEBOOK PAGE CONTENT (HIGH PRIORITY - EXTRACT ALL EMAILS/PHONES):**\n${facebookData.substring(0, 2000)}\n\n⚠️ Facebook often has emails not on the website - be aggressive extracting from Facebook data!\n` : ''}

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
              
              safeEnqueue(
                `data: ${JSON.stringify({ 
                  type: "error", 
                  prospectId, 
                  domain,
                  status: aiResponse.status === 429 ? "rate_limited" : "failed",
                  error: errorMessage
                })}\n\n`
              );
              
              await supabase
                .from("prospect_activities")
                .update({ status: prospect.status })
                .eq("id", prospectId);
              
              failureCount++;
              
              // Phase 2: Incremental progress update
              if (enrichmentJobId) {
                await supabase
                  .from('enrichment_jobs')
                  .update({
                    processed_count: successCount + failureCount,
                    success_count: successCount,
                  failed_count: failureCount,
                })
                .eq('id', enrichmentJobId);
            }
            
            return;
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

            // PHASE 2 OPTIMIZATION: WHOIS removed - rarely returns useful data (saves 5s)

            // Phase 5: Stage 4: If still no contacts, try multi-source Google Search
            if (contacts.length === 0) {
              console.log(`⚠️ Still no contacts for ${domain}, attempting multi-source Google Search...`);
              const foundEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
              
              if (foundEmails.length > 0) {
                const limitedEmails = foundEmails.slice(0, ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN);
                
                if (foundEmails.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN) {
                  console.log(`⚠️ ${domain}: Multi-source search found ${foundEmails.length} emails, limiting to ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}`);
                } else {
                  console.log(`✅ Multi-source search found ${foundEmails.length} emails for ${domain}`);
                }
                
                contacts = limitedEmails.map((email, index) => ({
                  first_name: "Office",
                  last_name: null,
                  email: email,
                  phone: null,
                  title: "Contact Found via Search",
                  linkedin_url: null,
                  facebook_url: null,
                  notes: index === limitedEmails.length - 1 && foundEmails.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN
                    ? `Email found via multi-source Google Search. [${foundEmails.length} total emails found, showing first ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}]`
                    : "Email found via multi-source Google Search"
                }));
              }
            }

        // Save contacts to database
        let contactsInserted = 0;
        if (Array.isArray(contacts) && contacts.length > 0) {
          // Filter out .gov, .edu, .mil emails and legal/compliance emails
          const filteredContacts = contacts.filter((contact: any) => {
            if (!contact.email) return false; // Reject contacts without email - we need emails for outreach
            
            const domain = contact.email.split('@')[1]?.toLowerCase() || '';
            const isExcluded = domain.endsWith('.gov') || 
                              domain.endsWith('.edu') || 
                              domain.endsWith('.mil');
            
            if (isExcluded) {
              console.log(`⚠️ Filtered out ${contact.email} (government/educational domain)`);
              return false;
            }
            
            // Filter legal/compliance emails
            const localPart = contact.email.split('@')[0]?.toLowerCase() || '';
            const isLegal = ['legal','privacy','compliance','counsel','attorney','law','dmca']
              .some(prefix => localPart === prefix || localPart.includes(prefix));
            
            if (isLegal) {
              console.log(`⚠️ Filtered out ${contact.email} (legal/compliance email)`);
              return false;
            }
            
            return true;
          });
          
          if (filteredContacts.length === 0) {
            console.log(`⚠️ All contacts filtered out for ${domain} (gov/edu or legal emails)`);
          } else {
            const limitedContacts = filteredContacts.slice(0, ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN);
            
            if (filteredContacts.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN) {
              console.log(`⚠️ ${domain}: Found ${filteredContacts.length} contacts, limiting to ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}`);
            }
            
            const contactsToInsert = limitedContacts.map((contact: any, index: number) => ({
              prospect_activity_id: prospectId,
              report_id: prospect.report_id,
              first_name: contact.first_name,
              last_name: contact.last_name || null,
              email: contact.email || null,
              phone: contact.phone || null,
              title: contact.title || null,
              linkedin_url: contact.linkedin_url || null,
              facebook_url: contact.facebook_url || null,
              notes: index === limitedContacts.length - 1 && filteredContacts.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN
                ? `${contact.notes || ''} [${filteredContacts.length} total contacts found, showing first ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}]`.trim()
                : contact.notes || null,
              is_primary: false,
            }));

            // Use upsert to handle duplicates gracefully
            const { error: insertError, data: insertedContacts } = await supabase
              .from("prospect_contacts")
              .upsert(contactsToInsert, {
                onConflict: 'prospect_activity_id,email',
                ignoreDuplicates: true
              })
              .select();

            if (!insertError) {
              contactsInserted = insertedContacts?.length || 0;
              console.log(`✅ Inserted ${contactsInserted} unique contacts for ${domain}`);
            } else {
              console.error(`Insert error for ${domain}:`, insertError);
            }
          }
        }
        
        // If AI extraction found no valid emails, try Google Search as last resort
        if (contactsInserted === 0 && Array.isArray(contacts)) {
          console.log(`⚠️ AI found no valid emails for ${domain}, trying Google Search as last resort...`);
          
          const searchedEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
          
          if (searchedEmails.length > 0) {
            const limitedEmails = searchedEmails.slice(0, ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN);
            
            if (searchedEmails.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN) {
              console.log(`⚠️ ${domain}: Google Search found ${searchedEmails.length} emails, limiting to ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}`);
            } else {
              console.log(`✅ Google Search found ${searchedEmails.length} email(s)`);
            }
            
            const contactsToInsert = limitedEmails.map((email: string, index: number) => ({
              prospect_activity_id: prospectId,
              report_id: prospect.report_id,
              first_name: "Office",
              email: email,
              title: "Contact Found via Search",
              notes: index === limitedEmails.length - 1 && searchedEmails.length > ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN
                ? `Email found via Google Search (AI extraction found no valid emails). [${searchedEmails.length} total emails found, showing first ${ENRICHMENT_CONFIG.MAX_CONTACTS_PER_DOMAIN}]`
                : "Email found via Google Search (AI extraction found no valid emails)",
              is_primary: false,
            }));

            const { error: insertError, data: insertedContacts } = await supabase
              .from("prospect_contacts")
              .upsert(contactsToInsert, {
                onConflict: 'prospect_activity_id,email',
                ignoreDuplicates: true
              })
              .select();

            if (!insertError) {
              contactsInserted = insertedContacts?.length || 0;
              console.log(`✅ Inserted ${contactsInserted} contacts from Google Search for ${domain}`);
            }
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

            // Check if we found any contacts with ACCEPTED email addresses (not legal/compliance)
            const contactsWithEmail = contacts.filter((c: any) => {
              if (!c.email || c.email.trim() === '') return false;
              const localPart = c.email.split('@')[0]?.toLowerCase();
              const isLegal = ['legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca']
                .some(prefix => localPart === prefix || localPart.includes(prefix));
              return !isLegal;
            });
            const hasAcceptedEmails = contactsWithEmail.length > 0;
            
            // Get current retry count
            const currentRetryCount = prospect.enrichment_retry_count || 0;
            const notesArray = [];

            // Determine final status with 1-attempt terminal policy:
            // - Has accepted email + icebreaker = enriched (Ready for Outreach)
            // - Has contacts but no accepted emails = enriching + retry=1 terminal (Missing Emails)
            // - No contacts = review + retry=1 terminal (Needs Review)
            let finalStatus = 'enriching';
            let retryCount = 1; // All outcomes are terminal after 1 attempt

            if (hasAcceptedEmails && icebreakerGenerated) {
              // SUCCESS: Email + icebreaker = ready for outreach
              finalStatus = 'enriched';
              notesArray.push(`✅ AI enrichment successful: ${contactsWithEmail.length} accepted email(s) + icebreaker generated`);
              console.log(`✅ ${domain} - ENRICHED (${contactsWithEmail.length} accepted emails + icebreaker)`);
            } else if (contactsInserted > 0 && !hasAcceptedEmails) {
              // TERMINAL: Contacts found but no accepted emails - Missing Emails
              finalStatus = 'enriching';
              notesArray.push(`⚠️ AI enrichment: Found ${contactsInserted} contacts but no valid sales emails (terminal). Shows in Missing Emails view.`);
              console.log(`🛑 ${domain} - MISSING EMAILS (${contactsInserted} contacts, 0 accepted emails, terminal after 1 attempt)`);
            } else {
              // TERMINAL: No contacts after 1 attempt - Needs Review
              finalStatus = 'review';
              notesArray.push(`⚠️ AI enrichment: No contacts found after 1 attempt (terminal). Needs human review.`);
              console.log(`🛑 ${domain} - NEEDS REVIEW (no contacts found, terminal after 1 attempt)`);
            }

            // Update prospect status, retry count, and release lock
            const { error: finalUpdateError } = await supabase
              .from("prospect_activities")
              .update({
                status: finalStatus,
                enrichment_source: "bulk_ai",
                enrichment_retry_count: retryCount,
                last_enrichment_attempt: new Date().toISOString(),
                contact_count: contactsInserted,
                enrichment_locked_at: null,
                enrichment_locked_by: null,
                notes: notesArray.length > 0 ? notesArray.join('; ') : null,
              })
              .eq("id", prospectId);

            if (finalUpdateError) {
              console.error(`❌ Failed to write final status for ${domain}:`, finalUpdateError);
              throw finalUpdateError;
            }
            
            finalStatusWritten = true;

            // Log to audit trail
            const contextParts = [`Bulk enrichment: extracted ${contactsInserted} contacts (${contactsWithEmail.length} accepted emails)`];
            if (icebreakerGenerated) contextParts.push('generated icebreaker');
            if (companyNameUpdated) contextParts.push(`updated company name to "${companyName}"`);
            if (industryUpdated) contextParts.push(`set industry to "${detectedIndustry}"`);
            contextParts.push(`from ${domain}`);
            contextParts.push(`retry ${retryCount}/3`);
            contextParts.push(`final status: ${finalStatus}`);
            
            await supabase.rpc("log_business_context", {
              p_table_name: "prospect_activities",
              p_record_id: prospectId,
              p_context: contextParts.join(", "),
            });

            // Send success update
            if (hasAcceptedEmails) {
              successCount++;
            }
            
            // Update job item status to success (tracks quality via has_emails/contacts_found)
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_job_items')
                .update({ 
                  status: 'success',
                  contacts_found: contactsInserted,
                  has_emails: hasAcceptedEmails,
                  completed_at: new Date().toISOString()
                })
                .eq('job_id', enrichmentJobId)
                .eq('prospect_id', prospectId);
              
              // Incremental progress update: success_count counts only real wins
              await supabase
                .from('enrichment_jobs')
                .update({
                  processed_count: successCount + failureCount, // excludes "no contacts" from success_count
                  success_count: successCount,
                  failed_count: failureCount,
                })
                .eq('id', enrichmentJobId);
            }
            
            safeEnqueue(
              `data: ${JSON.stringify({ 
                type: "success", 
                prospectId, 
                domain,
                status: "success",
                contactsFound: contactsInserted,
                companyName: companyNameUpdated ? companyName : null,
                industry: industryUpdated ? detectedIndustry : null
              })}\n\n`
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
            
            safeEnqueue(
              `data: ${JSON.stringify({ 
                type: "error", 
                prospectId, 
                domain: "unknown",
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error" 
              })}\n\n`
            );
            failureCount++;
            
            // Phase 2: Incremental progress update
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_jobs')
                .update({
                  processed_count: successCount + failureCount,
                  success_count: successCount,
                  failed_count: failureCount,
                })
                .eq('id', enrichmentJobId);
            }
          } finally {
            // CRITICAL: Ensure final state is always written, even on error
            if (!finalStatusWritten) {
              try {
                const domain = prospect.reports?.domain || 'unknown';
                console.log(`⚠️ Final status not written for ${domain}, forcing recovery state...`);
                
                // Determine status based on what we know
                const { data: contactCheck } = await supabase
                  .from("prospect_contacts")
                  .select("id, email")
                  .eq("prospect_activity_id", prospectId);
                
                const contactCount = contactCheck?.length || 0;
                const hasAcceptedEmail = (contactCheck || []).some(c => {
                  if (!c.email || c.email.trim() === '') return false;
                  const localPart = c.email.split('@')[0]?.toLowerCase();
                  const domainPart = c.email.split('@')[1]?.toLowerCase();
                  const isLegal = ['legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca']
                    .some(prefix => localPart === prefix || localPart.includes(prefix));
                  const isGovEduMil = domainPart?.endsWith('.gov') || domainPart?.endsWith('.edu') || domainPart?.endsWith('.mil');
                  return !isLegal && !isGovEduMil;
                });
                
                const recoveryStatus = contactCount > 0 && !hasAcceptedEmail ? 'enriching' : 'review';
                const recoveryNotes = contactCount > 0 && !hasAcceptedEmail
                  ? `⚠️ Enrichment error recovery: ${contactCount} contacts but no valid emails (terminal)`
                  : `⚠️ Enrichment error recovery: No contacts found (terminal)`;
                
                await supabase
                  .from("prospect_activities")
                  .update({
                    status: recoveryStatus,
                    enrichment_retry_count: 1,
                    last_enrichment_attempt: new Date().toISOString(),
                    contact_count: contactCount,
                    enrichment_locked_at: null,
                    enrichment_locked_by: null,
                    notes: recoveryNotes,
                  })
                  .eq("id", prospectId);
                
                console.log(`✅ Recovery state written for ${domain}: ${recoveryStatus}`);
              } catch (recoveryErr) {
                console.error(`❌ Failed to write recovery state for ${prospectId}:`, recoveryErr);
              }
            }
          }
        };
        
        // Wrap in timeout to prevent hanging
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Prospect processing timeout')), maxProspectTime)
        );
        
        try {
          await Promise.race([processProspect(), timeout]);
        } catch (error) {
          if (error instanceof Error && error.message === 'Prospect processing timeout') {
            console.log(`⏱️ ${prospect.reports.domain} took too long (>90s) - moving to next prospect`);
            
            // Release lock and mark as needs review
            await supabase.rpc('release_enrichment_lock', { p_prospect_id: prospectId });
            await supabase.from("prospect_activities").update({
              status: 'review',
              notes: 'Enrichment timed out after 90 seconds - manual review needed'
            }).eq("id", prospectId);
            
            // Update job item
            if (enrichmentJobId) {
              await supabase.from('enrichment_job_items').update({ 
                status: 'failed',
                error_message: 'Processing timeout (>90s) - moved to review',
                completed_at: new Date().toISOString()
              }).eq('job_id', enrichmentJobId).eq('prospect_id', prospectId);
            }
            
            safeEnqueue(
              `data: ${JSON.stringify({ 
                type: "error", 
                prospectId, 
                domain: prospect.reports.domain,
                error: "Processing timeout - moved to review" 
              })}\n\n`
            );
            
            failureCount++;
            
            // Phase 2: Incremental progress update
            if (enrichmentJobId) {
              await supabase
                .from('enrichment_jobs')
                .update({
                  processed_count: successCount + failureCount,
                  success_count: successCount,
                  failed_count: failureCount,
                })
                .eq('id', enrichmentJobId);
            }
          } else {
            throw error; // Re-throw other errors
          }
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
        
        safeEnqueue(
          `data: ${JSON.stringify({ 
            type: "complete", 
            summary: { 
              total: prospect_ids.length, 
              succeeded: successCount, 
              failed: failureCount 
            } 
          })}\n\n`
        );

        console.log(`Bulk enrichment complete: ${successCount}/${prospect_ids.length} succeeded`);

        // Invoke reconciliation to catch any stragglers
        console.log("🔧 Running post-job reconciliation...");
        try {
          const { data: reconResult, error: reconError } = await supabase.functions.invoke(
            'reconcile-stuck-enrichments',
            { body: {} }
          );
          
          if (reconError) {
            console.error("⚠️ Post-job reconciliation failed:", reconError);
          } else {
            console.log("✅ Post-job reconciliation complete:", reconResult);
          }
        } catch (reconErr) {
          console.error("⚠️ Failed to invoke reconciliation:", reconErr);
        }

      } catch (error) {
        console.error("Bulk enrichment error:", error);
        safeEnqueue(
          `data: ${JSON.stringify({ 
            type: "error", 
            error: error instanceof Error ? error.message : "Unknown error" 
          })}\n\n`
        );
      } finally {
        // CRITICAL: Always mark job as completed, even on error
        if (enrichmentJobId) {
          try {
            console.log("🔧 Ensuring job is marked as completed...");
            
            // PHASE 3 SAFEGUARD: If no items were processed, reset prospects to original status
            if (successCount + failureCount === 0) {
              console.log("⚠️ No items processed - resetting any prospects marked as enriching...");
              
              // Get all prospects that were selected for this job
              const { data: jobItems } = await supabase
                .from('enrichment_job_items')
                .select('prospect_id')
                .eq('job_id', enrichmentJobId);
              
              if (jobItems && jobItems.length > 0) {
                const prospectIds = jobItems.map(item => item.prospect_id);
                
                // Reset any prospects still in enriching status
                const { data: resetProspects } = await supabase
                  .from('prospect_activities')
                  .update({
                    status: 'new',
                    enrichment_locked_at: null,
                    enrichment_locked_by: null,
                    updated_at: new Date().toISOString()
                  })
                  .in('id', prospectIds)
                  .eq('status', 'enriching')
                  .select('id');
                
                if (resetProspects && resetProspects.length > 0) {
                  console.log(`✅ Reset ${resetProspects.length} prospects back to 'new' status (0 items processed)`);
                  
                  // Log to audit trail
                  for (const prospect of resetProspects) {
                    await supabase.from('audit_logs').insert({
                      table_name: 'prospect_activities',
                      record_id: prospect.id,
                      action_type: 'UPDATE',
                      field_name: 'status',
                      old_value: 'enriching',
                      new_value: 'new',
                      business_context: `Job ${enrichmentJobId} aborted with 0 items processed - reset to original status`
                    });
                  }
                }
              }
            }
            
            // Run reconciliation first to catch any stragglers
            try {
              const { data: reconResult, error: reconError } = await supabase.functions.invoke(
                'reconcile-stuck-enrichments',
                { body: {} }
              );
              
              if (reconError) {
                console.error("⚠️ Final reconciliation failed:", reconError);
              } else {
                console.log("✅ Final reconciliation complete:", reconResult);
              }
            } catch (reconErr) {
              console.error("⚠️ Failed to invoke final reconciliation:", reconErr);
            }
            
            // Mark job as completed (in case it wasn't already)
            await supabase
              .from('enrichment_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                processed_count: successCount + failureCount,
                success_count: successCount,
                failed_count: failureCount
              })
              .eq('id', enrichmentJobId)
              .eq('status', 'running'); // Only update if still running
            
            console.log("✅ Job marked as completed in finally block");
          } catch (finalErr) {
            console.error("❌ Failed to mark job as completed:", finalErr);
          }
        }
        
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
  const maxTotalTime = 60000; // 60 seconds max for ALL URLs combined (increased from 30s)
  const startTime = Date.now();
  
  // Phase 4: Prioritize contact pages first (highest value)
  const urlsToTry = [
    `https://${domain}/contact`,        // 🎯 HIGHEST VALUE
    `https://${domain}/contact-us`,
    `https://www.${domain}/contact`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/team`,
    `https://${domain}/get-in-touch`,
    `https://${domain}`,                // Homepage last (lowest value)
    `https://www.${domain}`,
  ];

  let allContent = "";
  let allSocialLinks = "";

  for (const url of urlsToTry) {
    // Check if we've exceeded total time budget
    if (Date.now() - startTime > maxTotalTime) {
      console.log(`⏱️ Scraping timeout reached for ${domain} - moving on with ${allContent.length} chars collected`);
      break;
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(5000), // PHASE 3: Reduced to 5s (from 15s) for speed
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
      signal: AbortSignal.timeout(7000), // PHASE 3: Reduced to 7s (from 15s) for speed
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
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`⏱️ Facebook scraping timed out for ${facebookUrl}`);
    } else {
      console.log(`⚠️ Failed to scrape Facebook page:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  return "";
}

// Helper function to fetch website content via Google Search when direct scraping fails
async function fetchWebsiteViaGoogleSearch(domain: string, lovableApiKey: string): Promise<string> {
  try {
    console.log(`🔍 Using Google Search to fetch content from ${domain}...`);
    
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
            content: "You are a web content fetcher. Retrieve and return the main content from the website's contact page, about page, or homepage."
          },
          {
            role: "user",
            content: `Fetch the main text content from these pages for domain ${domain}: contact page, about page, or homepage. Return the raw text content you find.`
          }
        ],
        tools: [{ type: "google_search_retrieval" }],
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      if (content) {
        console.log(`✅ Google Search fetched ${content.length} characters`);
      }
      return content;
    }
    console.log(`❌ Google Search fetch failed: ${response.status}`);
    return "";
  } catch (error) {
    console.log(`❌ Failed to fetch via Google Search:`, error instanceof Error ? error.message : String(error));
    return "";
  }
}

// WHOIS lookup for domain registration contacts
async function whoisLookup(domain: string): Promise<string[]> {
  try {
    console.log(`📇 Checking WHOIS data for ${domain}...`);
    
    const response = await fetch(`https://who-dat.as93.net/${domain}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    // Handle 403 or other HTTP errors gracefully
    if (!response.ok) {
      console.log(`⚠️ WHOIS lookup unavailable (${response.status}) - skipping`);
      return [];
    }
    
    const data = await response.json();
    const emails: string[] = [];
    
    // Extract registrant email
    if (data.registrant_email && !data.registrant_email.includes('REDACTED') && !data.registrant_email.includes('privacy')) {
      emails.push(data.registrant_email);
      console.log(`📇 Found registrant email: ${data.registrant_email}`);
    }
    
    // Extract admin contact
    if (data.admin_email && !data.admin_email.includes('REDACTED') && !data.admin_email.includes('privacy')) {
      emails.push(data.admin_email);
      console.log(`📇 Found admin email: ${data.admin_email}`);
    }
    
    // Extract tech contact
    if (data.tech_email && !data.tech_email.includes('REDACTED') && !data.tech_email.includes('privacy')) {
      emails.push(data.tech_email);
      console.log(`📇 Found tech email: ${data.tech_email}`);
    }
    
    // Deduplicate
    const uniqueEmails = [...new Set(emails)];
    
    if (uniqueEmails.length > 0) {
      console.log(`✅ WHOIS found ${uniqueEmails.length} contact(s) for ${domain}`);
    } else {
      console.log(`⚠️ WHOIS data is privacy-protected for ${domain}`);
    }
    
    return uniqueEmails;
  } catch (error) {
    console.log(`⚠️ WHOIS lookup error for ${domain}:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Helper to run a single search query
async function runSingleSearch(query: string, lovableApiKey: string): Promise<string[]> {
  try {
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
            content: "You are a contact extraction specialist. Extract ALL email addresses from the search results. Return them as a simple JSON array."
          },
          {
            role: "user",
            content: `Search query: ${query}

Extract ALL email addresses you find. Return ONLY a JSON array like:
["email1@company.com", "email2@company.com"]

If no emails found, return empty array: []`
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
          return Array.isArray(emails) ? emails : [];
        } catch (e) {
          return [];
        }
      }
    }
  } catch (error) {
    // Silent fail for individual queries
  }
  
  return [];
}

// Phase 4: Multi-source Google Search across the entire public internet (PARALLELIZED)
async function googleSearchEmails(domain: string, companyName: string, lovableApiKey: string): Promise<string[]> {
  try {
    console.log(`🔍 Parallel multi-source search for ${domain} (${companyName})...`);
    
    // Define search queries - searching the ENTIRE public internet
    const searchQueries = [
      // Query 1: Original domain search (keep for website emails)
      `site:${domain} (contact OR email OR phone OR team OR about)`,
      
      // Query 2: LinkedIn company page search
      `site:linkedin.com/company "${companyName}" OR "${domain}"`,
      
      // Query 3: Business directory search
      `site:yelp.com OR site:bbb.org OR site:yellowpages.com "${companyName}" contact`,
      
      // Query 4: General web search for company + contact
      `"${companyName}" owner email OR contact email -linkedin.com -facebook.com`,
      
      // Query 5: Review sites (owner responses often have emails)
      `site:google.com/maps "${companyName}" owner response contact`,
      
      // Query 6: Forum/discussion mentions
      `"${companyName}" OR "${domain}" email site:reddit.com OR site:quora.com`,
    ];
    
    // PHASE 1 OPTIMIZATION: Run all queries in parallel (70% faster)
    console.log(`🚀 Running ${searchQueries.length} queries in parallel...`);
    const searchPromises = searchQueries.map(async (query, i) => {
      try {
        console.log(`  📍 Query ${i + 1}: ${query.substring(0, 60)}...`);
        const emails = await runSingleSearch(query, lovableApiKey);
        if (emails.length > 0) {
          console.log(`  ✅ Query ${i + 1} found ${emails.length} email(s)`);
        }
        return emails;
      } catch (error) {
        console.log(`  ❌ Query ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
        return [];
      }
    });
    
    const results = await Promise.all(searchPromises);
    const allEmails = results.flat();
    
    // Deduplicate emails
    const uniqueEmails = [...new Set(allEmails)];
    
    if (uniqueEmails.length > 0) {
      console.log(`✅ Parallel search found ${uniqueEmails.length} unique email(s) from ${allEmails.length} total results`);
    } else {
      console.log(`⚠️ No emails found across all sources`);
    }
    
    return uniqueEmails;
  } catch (error) {
    console.log(`⚠️ Multi-source search failed:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}
