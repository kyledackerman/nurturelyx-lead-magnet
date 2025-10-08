import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, knownDomains } = await req.json();
    
    if (!rawText || !knownDomains || !Array.isArray(knownDomains)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: rawText and knownDomains' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create AI prompt
    const prompt = `You are a contact information extraction assistant. Parse the following raw text and extract contact information for people. Match them to the known company domains provided.

Known company domains: ${knownDomains.join(', ')}

Extract for each person:
- first_name (required)
- last_name (required)
- email (optional)
- phone (optional)
- title (optional)
- linkedin_url (optional)
- company_domain (required - must match one of the known domains, extract from email or context)
- notes (optional - any additional context)

Return ONLY a JSON object with this exact structure:
{
  "matched": [
    {
      "domain": "example.com",
      "contacts": [
        {
          "first_name": "John",
          "last_name": "Smith",
          "email": "john@example.com",
          "phone": "+1234567890",
          "title": "VP of Sales",
          "linkedin_url": "https://linkedin.com/in/johnsmith",
          "notes": "Met at conference"
        }
      ]
    }
  ],
  "unmatched": [
    {
      "raw_text": "snippet of text that couldn't be matched",
      "reason": "domain not in known list"
    }
  ]
}

Raw text to parse:
${rawText}`;

    console.log('Calling Lovable AI to parse contacts...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise contact information extraction assistant. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data));

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let parsedResult;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI returned invalid JSON');
    }

    // Validate structure
    if (!parsedResult.matched || !Array.isArray(parsedResult.matched)) {
      parsedResult.matched = [];
    }
    if (!parsedResult.unmatched || !Array.isArray(parsedResult.unmatched)) {
      parsedResult.unmatched = [];
    }

    // Validate each contact has required fields
    parsedResult.matched = parsedResult.matched.filter((item: any) => {
      if (!item.domain || !item.contacts || !Array.isArray(item.contacts)) {
        return false;
      }
      item.contacts = item.contacts.filter((contact: any) => {
        return contact.first_name && contact.last_name;
      });
      return item.contacts.length > 0;
    });

    console.log(`Successfully parsed ${parsedResult.matched.length} matched domains with contacts`);

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-bulk-contacts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
