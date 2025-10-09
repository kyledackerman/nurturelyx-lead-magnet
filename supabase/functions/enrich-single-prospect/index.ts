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
        reports!inner(domain, extracted_company_name)
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
            content: `You are a contact extraction specialist. Extract ALL legitimate contact information AND the properly capitalized company name.

**RETURN THIS EXACT JSON STRUCTURE:**
{
  "company_name": "Properly Capitalized Company Name Inc.",
  "contacts": [
    {
      "first_name": "John",
      "last_name": "Smith",
      "email": "john@company.com",
      "phone": "+1-555-0123",
      "title": "CEO",
      "linkedin_url": "https://linkedin.com/in/johnsmith",
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

**CRITICAL EMAIL RULES:**
- ✅ INCLUDE: info@, contact@, sales@, admin@, support@, hello@, team@
- ✅ INCLUDE: Personal emails like @gmail.com, @yahoo.com, @hotmail.com, @outlook.com
- ✅ INCLUDE: All emails with person names (john.smith@company.com)
- ❌ ONLY EXCLUDE: noreply@, no-reply@, donotreply@, mailer-daemon@, example@example.com

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
    let extractedData: { company_name: string; contacts: any[] };
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

    // Update company name in reports table
    let companyNameUpdated = false;
    if (companyName && companyName !== currentCompanyName) {
      const { error: updateError } = await supabase
        .from("reports")
        .update({ extracted_company_name: companyName })
        .eq("id", prospect.report_id);

      if (updateError) {
        console.error("Error updating company name:", updateError);
      } else {
        companyNameUpdated = true;
        console.log(`✅ Updated company name to "${companyName}"`);
      }
    }

    // Update prospect status
    await supabase
      .from("prospect_activities")
      .update({
        status: "enriched",
        enrichment_source: "manual_ai",
      })
      .eq("id", prospect_id);

    // Log to audit trail
    await supabase.rpc("log_business_context", {
      p_table_name: "prospect_activities",
      p_record_id: prospect_id,
      p_context: `Manual enrichment: extracted ${contactsInserted} contacts${companyNameUpdated ? `, updated company name to "${companyName}"` : ""} from ${domain}`,
    });

    const resultMessage = contactsInserted > 0
      ? `Found ${contactsInserted} contact${contactsInserted > 1 ? "s" : ""}${companyNameUpdated ? `. Company name updated to "${companyName}"` : ""}`
      : companyNameUpdated
      ? `Company name updated to "${companyName}". No additional contacts found.`
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
