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
    const scrapedData = await scrapeWebsite(domain);

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
    const contacts = extractedData.contacts || [];

    console.log(`AI extracted company name: "${companyName}" and ${contacts.length} contacts`);

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

    // Update prospect status - preserve status if already in advanced stages
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

    const messageParts = [];
    if (contactsInserted > 0) messageParts.push(`Found ${contactsInserted} contact${contactsInserted > 1 ? "s" : ""}`);
    if (companyNameUpdated) messageParts.push(`Company: "${companyName}"`);
    if (facebookUrlAdded) messageParts.push(`Facebook URL added`);
    if (industryUpdated) messageParts.push(`Industry: ${detectedIndustry}`);
    
    const resultMessage = messageParts.length > 0 
      ? messageParts.join(". ")
      : "No contacts found. Try manual entry.";

    console.log(`✅ Manual enrichment complete: ${resultMessage}`);

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

        console.log(`✅ Successfully scraped ${url} (${text.length} chars)`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to scrape ${url}:`, error instanceof Error ? error.message : String(error));
    }
  }

  return allContent;
}
