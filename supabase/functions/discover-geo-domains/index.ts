import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin access
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin']);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { location, keywords } = await req.json();
    console.log(`🔍 STRICT LOCATION SEARCH: ${location}${keywords ? ` (${keywords})` : ''}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Detect if location is a ZIP code
    const isZipCode = /^\d{5}(-\d{4})?$/.test(location.trim());
    const normalizedLocation = location.trim();
    
    console.log(`📍 Location type: ${isZipCode ? 'ZIP CODE' : 'CITY/STATE'}`);

    // Construct strict location-specific search prompt
    const keywordText = keywords ? `${keywords} ` : '';
    const locationConstraint = isZipCode 
      ? `ZIP code ${normalizedLocation} ONLY. Do NOT include businesses from neighboring ZIP codes or cities.`
      : `${normalizedLocation} (the exact city/area specified). Do NOT include businesses from nearby cities.`;

    const searchPrompt = `Search Google for ${keywordText}businesses with PHYSICAL OFFICES located in ${locationConstraint}

CRITICAL REQUIREMENTS:
1. ONLY include businesses that are PHYSICALLY LOCATED in ${normalizedLocation}
2. Do NOT include businesses that only SERVE the area but are located elsewhere
3. Extract the business domain (website), name, and VERIFIED physical address
4. For each business, confirm their address is within ${normalizedLocation}

Search multiple queries:
- "businesses with physical address in ${normalizedLocation}"
- "companies located in ${normalizedLocation} office address"
- "${keywordText}businesses headquarters ${normalizedLocation}"
- "local ${keywordText}business address ${normalizedLocation}"

For EACH business found, verify:
- They have a physical office/location in ${normalizedLocation}
- Extract their full address (street, city, state, ZIP)
- Determine confidence level (high/medium/low) based on address clarity

EXCLUDE:
- Nationwide companies that only serve the area
- Businesses in nearby cities/ZIPs
- PO Box only addresses
- Businesses without clear physical locations`;

    console.log('🤖 Calling Lovable AI with structured verification...');
    
    // Define structured output schema
    const tools = [{
      type: "function",
      function: {
        name: "report_verified_businesses",
        description: "Report businesses physically located in the target location with verified addresses",
        parameters: {
          type: "object",
          properties: {
            verified_businesses: {
              type: "array",
              description: "Businesses confirmed to be physically located in the target location",
              items: {
                type: "object",
                properties: {
                  domain: { 
                    type: "string", 
                    description: "Business domain without http/https/www (e.g., example.com)" 
                  },
                  name: { 
                    type: "string", 
                    description: "Business name" 
                  },
                  address: { 
                    type: "string", 
                    description: "Full street address" 
                  },
                  city: { 
                    type: "string", 
                    description: "City name" 
                  },
                  state: { 
                    type: "string", 
                    description: "State abbreviation (e.g., MI, FL)" 
                  },
                  zip: { 
                    type: "string", 
                    description: "ZIP code" 
                  },
                  confidence: { 
                    type: "string", 
                    enum: ["high", "medium", "low"],
                    description: "Confidence in location verification" 
                  }
                },
                required: ["domain", "name", "city", "state", "confidence"]
              }
            },
            filtered_out: {
              type: "array",
              description: "Businesses excluded because they are not in the target location",
              items: {
                type: "object",
                properties: {
                  domain: { type: "string" },
                  name: { type: "string" },
                  reason: { type: "string", description: "Why it was filtered out" },
                  actual_location: { type: "string", description: "Where it's actually located" }
                },
                required: ["domain", "reason"]
              }
            }
          },
          required: ["verified_businesses"],
          additionalProperties: false
        }
      }
    }];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a precise location verification assistant. Your job is to find businesses PHYSICALLY LOCATED in a specific location and EXCLUDE any businesses that are elsewhere.

CRITICAL RULES:
1. A business in ZIP 48906 is NOT the same as ZIP 48910 - they are different locations
2. A business in "Miami" is NOT the same as "Fort Lauderdale" - verify exact city
3. If a business only SERVES an area but is located elsewhere, EXCLUDE IT
4. Only include businesses with confirmed physical addresses in the target location
5. Be STRICT - when in doubt, exclude it`
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        tools: [
          {
            type: 'google_search_retrieval',
            google_search_retrieval: {
              dynamic_retrieval_config: {
                mode: 'MODE_DYNAMIC',
                dynamic_threshold: 0.7
              }
            }
          },
          tools[0]  // Include the report_verified_businesses function schema
        ],
        tool_choice: { type: "function", function: { name: "report_verified_businesses" } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI search failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // Extract structured data from function call
    let verifiedBusinesses = [];
    let filteredOut = [];
    
    const toolCalls = aiData.choices?.[0]?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const functionCall = toolCalls[0];
      if (functionCall.function?.name === 'report_verified_businesses') {
        const result = JSON.parse(functionCall.function.arguments);
        verifiedBusinesses = result.verified_businesses || [];
        filteredOut = result.filtered_out || [];
      }
    }

    console.log(`✅ VERIFIED: ${verifiedBusinesses.length} businesses in ${normalizedLocation}`);
    console.log(`❌ FILTERED: ${filteredOut.length} businesses (wrong location)`);
    
    // Log filtered domains for transparency
    if (filteredOut.length > 0) {
      console.log('📋 Filtered out domains:');
      filteredOut.forEach((item: any) => {
        console.log(`  - ${item.domain || item.name}: ${item.reason} (${item.actual_location || 'unknown location'})`);
      });
    }

    // Clean domains and remove duplicates
    const uniqueVerified = Array.from(
      new Map(
        verifiedBusinesses
          .filter((b: any) => b.domain && b.domain.length > 3)
          .map((b: any) => [b.domain.toLowerCase().trim(), b])
      ).values()
    );

    return new Response(
      JSON.stringify({
        verified: uniqueVerified,
        filtered: filteredOut,
        stats: {
          total_found: verifiedBusinesses.length + filteredOut.length,
          verified_count: uniqueVerified.length,
          filtered_count: filteredOut.length,
          search_location: normalizedLocation,
          location_type: isZipCode ? 'ZIP' : 'CITY'
        },
        location: normalizedLocation,
        keywords: keywords || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Geo-discovery error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Discovery failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
