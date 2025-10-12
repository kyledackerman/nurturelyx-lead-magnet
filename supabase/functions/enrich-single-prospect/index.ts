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
    
    // Phase 2: Facebook Scraping (if Facebook URL found in social links)
    let facebookData = "";
    const facebookUrlMatch = socialLinks.match(/https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[^\s]+/i);
    if (facebookUrlMatch) {
      const extractedFacebookUrl = facebookUrlMatch[0];
      console.log(`📘 Found Facebook URL: ${extractedFacebookUrl}`);
      facebookData = await scrapeFacebookPage(extractedFacebookUrl);
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

    // Phase 5: Stage 3: If no contacts found, try Google Search for emails
    if (contacts.length === 0) {
      console.log(`⚠️ No contacts found, attempting Google Search for emails...`);
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
      const foundEmails = await googleSearchEmails(domain, companyName, lovableApiKey);
      
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
    const companyFacebookUrl = extractedData.facebook_url || null;
    const detectedIndustry = extractedData.industry || null;
    
    let companyNameUpdated = false;
    let facebookUrlAdded = false;
    let industryUpdated = false;
    
    const updateData: any = {};
    
    // Only update company name if changed
    if (companyName && companyName !== currentCompanyName) {
      updateData.extracted_company_name = companyName;
      companyNameUpdated = true;
      console.log(`✅ Updating company name to "${companyName}"`);
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

    // Update prospect status to "enriched" immediately (don't wait for icebreaker)
    const newStatus = ["new", "needs_review", "enriching"].includes(prospect.status)
      ? "enriched"
      : prospect.status;
    
    await supabase
      .from("prospect_activities")
      .update({
        status: newStatus,
        enrichment_source: "manual_ai",
      })
      .eq("id", prospect_id);

    // Log to audit trail
    const contextParts = [`Manual enrichment: extracted ${contactsInserted} contacts`];
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
          } else {
            console.log('✅ Icebreaker generated successfully in background');
            // Update status to review after icebreaker is done
            await supabase
              .from("prospect_activities")
              .update({ status: "review" })
              .eq("id", prospect_id);
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
