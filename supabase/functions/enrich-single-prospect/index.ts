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

    const { prospect_id } = await req.json();

    if (!prospect_id) {
      return new Response(
        JSON.stringify({ success: false, error: "prospect_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting manual enrichment for prospect ${prospect_id}...`);

    // Get prospect details
    const { data: prospect, error: fetchError } = await supabase
      .from("prospect_activities")
      .select(`
        id,
        report_id,
        status,
        reports!inner(domain, extracted_company_name, facebook_url, industry)
      `)
      .eq("id", prospect_id)
      .single();

    if (fetchError || !prospect) {
      console.error("Error fetching prospect:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Prospect not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = prospect.reports.domain;
    const currentCompanyName = prospect.reports.extracted_company_name || domain;

    // Block .edu/.gov/.mil domains immediately
    const domainLower = domain.toLowerCase();
    if (domainLower.endsWith('.edu') || domainLower.endsWith('.gov') || domainLower.endsWith('.mil')) {
      console.log(`⊘ Rejected ${domain}: government/educational domain not viable for B2B`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot enrich government/educational domains (.edu, .gov, .mil)',
          notViable: true 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Enriching ${domain}...`);

    // Update status to enriching
    await supabase
      .from("prospect_activities")
      .update({
        status: "enriching",
        last_enrichment_attempt: new Date().toISOString(),
      })
      .eq("id", prospect_id);

    // Scrape the website
    const { content: scrapedData, socialLinks } = await scrapeWebsite(domain);

    if (!scrapedData || scrapedData.length === 0) {
      await supabase
        .from("prospect_activities")
        .update({ status: prospect.status })
        .eq("id", prospect_id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not access website. Domain may be down or unreachable." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Scraped ${scrapedData.length} characters from ${domain}`);
    
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

    // Use AI to extract contacts AND company name
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

**COMPANY NAME RULES (CRITICAL - READ CAREFULLY):**
- Extract the REAL business name as it appears on their website, signage, or marketing materials
- Look in these places (in order of priority):
  1. Page titles (<title> tag)
  2. Logo text / header branding
  3. "About Us" page (company description)
  4. Footer copyright notice (© 2024 Company Name LLC)
  5. Contact page business name
  6. Meta description tags
- Use proper capitalization:
  * Title Case for most words (Smith Plumbing Company)
  * Keep acronyms uppercase (HVAC, LLC, Inc., USA, etc.)
  * Preserve brand capitalization (e.g., "eBay", "iPhone")
- DO NOT just capitalize the domain name
- If the business name is truly not found anywhere on the website, return "Unknown - [Domain]" (e.g., "Unknown - q1mechservices.com")
- Common patterns to recognize:
  * "Welcome to ABC Company" → "ABC Company"
  * "© 2024 Smith Services LLC" → "Smith Services LLC"
  * Domain "abchvac.com" + Footer "ABC Heating & Cooling" → "ABC Heating & Cooling"

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
            content: `Current Company Name: ${currentCompanyName}
Domain: ${domain}

**SOCIAL MEDIA LINKS FOUND:**
${socialLinks || 'None found'}

**WEBSITE CONTENT:**
${scrapedData.substring(0, 15000)}

${facebookData ? `\n**FACEBOOK PAGE CONTENT:**\n${facebookData.substring(0, 2000)}\n` : ''}

Extract the proper company name and all contact information. BE AGGRESSIVE in finding contacts - include phone numbers, emails, and addresses even if no specific person is named. Return ONLY the JSON object.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      await supabase
        .from("prospect_activities")
        .update({ status: prospect.status })
        .eq("id", prospect_id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "AI service busy. Please try again in a moment." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Invalid JSON from AI");
    }

    const companyName = extractedData.company_name || currentCompanyName;
    let contacts = extractedData.contacts || [];

    console.log(`AI extracted company name: "${companyName}" and ${contacts.length} contacts`);

    // Phase 5: Stage 3: If no contacts found, try WHOIS lookup first (fast & free)
    if (contacts.length === 0) {
      console.log(`⚠️ No contacts found, trying WHOIS lookup...`);
      const whoisEmails = await whoisLookup(domain);
      
      if (whoisEmails.length > 0) {
        console.log(`✅ WHOIS found ${whoisEmails.length} email(s)`);
        contacts = whoisEmails.map(email => ({
          first_name: "Domain Owner",
          last_name: null,
          email: email,
          phone: null,
          title: "Registrant Contact",
          linkedin_url: null,
          facebook_url: null,
          notes: "Email found via WHOIS lookup"
        }));
      }
    }

    // Phase 5: Stage 4: If still no contacts, try multi-source Google Search
    if (contacts.length === 0) {
      console.log(`⚠️ Still no contacts, attempting multi-source Google Search...`);
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
      const foundEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
      
      if (foundEmails.length > 0) {
        console.log(`✅ Multi-source search found ${foundEmails.length} emails`);
        contacts = foundEmails.map(email => ({
          first_name: "Office",
          last_name: null,
          email: email,
          phone: null,
          title: "Contact Found via Search",
          linkedin_url: null,
          facebook_url: null,
          notes: "Email found via multi-source Google Search"
        }));
      }
    }

    let contactsInserted = 0;

    // Save contacts to database if any found
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
        console.log(`⚠️ All contacts filtered out (gov/edu or legal emails)`);
      } else {
        const contactsToInsert = filteredContacts.map((contact: any) => ({
          prospect_activity_id: prospect_id,
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
          console.log(`✅ Inserted ${contactsInserted} unique contacts`);
        } else {
          console.error("Error inserting contacts:", insertError);
        }
      }
    }

    // Update company name, Facebook URL, and industry in reports table
    const currentFacebookUrl = prospect.reports.facebook_url;
    const currentIndustry = prospect.reports.industry;
    const companyFacebookUrl = extractedData.facebook_url || null;
    const detectedIndustry = extractedData.industry || null;
    
    let companyNameUpdated = false;
    let facebookUrlAdded = false;
    let industryUpdated = false;
    
    const updateData: any = {};
    
    // Detect if current name looks like a domain (no spaces, all lowercase-ish)
    const currentLooksLikeDomain = currentCompanyName && 
      (!currentCompanyName.includes(' ') || 
       currentCompanyName.toLowerCase().replace(/\s/g, '') === currentCompanyName.replace(/\s/g, ''));

    // Force update if new name is better OR current name looks like domain
    if (companyName && (
      companyName !== currentCompanyName || 
      currentLooksLikeDomain ||
      currentCompanyName?.startsWith('Unknown')
    )) {
      updateData.extracted_company_name = companyName;
      companyNameUpdated = true;
      console.log(`✅ Updating company name from "${currentCompanyName}" to "${companyName}"`);
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

    // Check if we found any contacts with email addresses
    const contactsWithEmail = contacts.filter((c: any) => c.email && c.email.trim() !== '');
    const hasValidContacts = contactsWithEmail.length > 0;

    // DON'T mark as "enriched" yet - wait for icebreaker to complete
    // Keep as "enriching" until icebreaker is generated
    const tempStatus = hasValidContacts && ["new", "needs_review", "enriching"].includes(prospect.status)
      ? "enriching"  // Keep enriching until icebreaker is done
      : "review";
    
    await supabase
      .from("prospect_activities")
      .update({
        status: tempStatus,
        enrichment_source: "manual_ai",
      })
      .eq("id", prospect_id);

    // Log to audit trail
    const contextParts = [`Manual enrichment: extracted ${contactsInserted} contacts (${contactsWithEmail.length} with email)`];
    if (companyNameUpdated) contextParts.push(`updated company name to "${companyName}"`);
    if (facebookUrlAdded) contextParts.push(`added Facebook URL`);
    if (industryUpdated) contextParts.push(`set industry to "${detectedIndustry}"`);
    contextParts.push(`from ${domain}. Status: ${prospect.status} → ${newStatus}`);
    
    await supabase.rpc("log_business_context", {
      p_table_name: "prospect_activities",
      p_record_id: prospect_id,
      p_context: contextParts.join(", "),
    });

    // Build response message immediately
    const messageParts = [];
    if (contactsInserted > 0) messageParts.push(`Found ${contactsInserted} contact${contactsInserted > 1 ? "s" : ""}`);
    if (companyNameUpdated) messageParts.push(`Company: "${companyName}"`);
    if (facebookUrlAdded) messageParts.push(`Facebook URL added`);
    if (industryUpdated) messageParts.push(`Industry: ${detectedIndustry}`);
    
    const resultMessage = messageParts.length > 0 
      ? messageParts.join(". ")
      : "No contacts found. Try manual entry.";

    console.log(`✅ Manual enrichment complete: ${resultMessage}`);

    // Generate icebreaker in background (async, no await)
    // Using EdgeRuntime.waitUntil to ensure it completes even after response is sent
    EdgeRuntime.waitUntil(
      (async () => {
        console.log("🧊 Generating icebreaker in background...");
        try {
          const { data: icebreakerData, error: icebreakerError } = await supabase.functions.invoke(
            'generate-icebreaker',
            {
              body: {
                prospect_activity_id: prospect_id,
                domain: domain,
                company_name: companyName,
                scraped_content: scrapedData,
                force_regenerate: false
              }
            }
          );

          if (icebreakerError) {
            console.error('❌ Error generating icebreaker:', icebreakerError);
            
            // If icebreaker fails, move to review with note
            await supabase
              .from("prospect_activities")
              .update({ 
                status: "review",
                notes: "Enrichment complete but icebreaker generation failed. Please review manually."
              })
              .eq("id", prospect_id);
            
            console.log('⚠️ Icebreaker failed - moved prospect to review');
          } else {
            console.log('✅ Icebreaker generated successfully in background');
            
            // Check if we have email contacts
            const { data: emailContacts } = await supabase
              .from('prospect_contacts')
              .select('email')
              .eq('prospect_activity_id', prospect_id)
              .not('email', 'is', null)
              .neq('email', '');
            
            const hasEmails = emailContacts && emailContacts.length > 0;
            
            // NOW mark as "enriched" - icebreaker is generated successfully
            await supabase
              .from("prospect_activities")
              .update({ 
                status: "enriched",  // Only mark enriched when EVERYTHING is done
                enrichment_status: {
                  has_company_info: companyNameUpdated,
                  has_contacts: contactsInserted > 0,
                  has_emails: hasEmails,
                  has_phones: contactsInserted > 0,
                  has_icebreaker: true,
                  facebook_found: false,
                  industry_found: false
                }
              })
              .eq("id", prospect_id);
            
            console.log(`✅ Prospect fully enriched with icebreaker - status set to 'enriched'`);
          }
        } catch (error) {
          console.error('❌ Background icebreaker generation failed:', error);
        }
      })()
    );

    // Return response immediately without waiting for icebreaker
    return new Response(
      JSON.stringify({
        success: true,
        message: resultMessage,
        contactsFound: contactsInserted,
        companyNameUpdated: companyNameUpdated ? companyName : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Manual enrichment error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Enrichment failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
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
      console.log(`Scraping ${url}...`);
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

        console.log(`✅ Successfully scraped ${url} (${text.length} chars)`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to scrape ${url}:`, error instanceof Error ? error.message : String(error));
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
      signal: AbortSignal.timeout(15000), // Phase 3: Standardized to 15s (matches bulk-enrich)
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

// Phase 4: Multi-source Google Search across the entire public internet
async function googleSearchEmails(domain: string, companyName: string, lovableApiKey: string): Promise<string[]> {
  try {
    console.log(`🔍 Multi-source search for ${domain} (${companyName})...`);
    
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
    
    const allEmails: string[] = [];
    
    // Run searches with 1-second delays between queries to avoid rate limits
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`🔍 Query ${i + 1}/${searchQueries.length}: ${query.substring(0, 60)}...`);
      
      const emails = await runSingleSearch(query, lovableApiKey);
      
      if (emails.length > 0) {
        console.log(`  ✅ Found ${emails.length} email(s) from query ${i + 1}`);
        allEmails.push(...emails);
      }
      
      // Add 1-second delay between queries (except after last query)
      if (i < searchQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Deduplicate emails
    const uniqueEmails = [...new Set(allEmails)];
    
    if (uniqueEmails.length > 0) {
      console.log(`✅ Multi-source search found ${uniqueEmails.length} unique email(s) from ${allEmails.length} total results`);
    } else {
      console.log(`⚠️ No emails found across all sources`);
    }
    
    return uniqueEmails;
  } catch (error) {
    console.log(`⚠️ Multi-source search failed:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}
