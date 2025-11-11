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
    console.log(`Searching for domains in ${location}${keywords ? ` (${keywords})` : ''}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Construct search prompt
    const keywordText = keywords ? ` specializing in ${keywords}` : '';
    const searchPrompt = `Find business websites and domains in ${location}${keywordText}. 
Search for local businesses, companies, and service providers in this area.
Extract ONLY the domain names (like example.com) from the search results.
Return a simple list of unique domain names, one per line, without http/https or www.
Focus on real, operational business websites.`;

    console.log('Calling Lovable AI with Google Search...');
    
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
            content: 'You are a domain discovery assistant. Extract only valid domain names from search results. Return them as a clean list, one per line, without http/https or www prefixes.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        tools: [{
          type: 'google_search_retrieval',
          google_search_retrieval: {
            dynamic_retrieval_config: {
              mode: 'MODE_DYNAMIC',
              dynamic_threshold: 0.7
            }
          }
        }]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI search failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', aiContent);

    // Extract domains from AI response
    const domainRegex = /(?:[a-z0-9-]+\.)+[a-z]{2,}/gi;
    const foundDomains = aiContent.match(domainRegex) || [];
    
    // Clean and deduplicate
    const uniqueDomains = [...new Set(
      foundDomains
        .map((d: string) => d.toLowerCase().trim())
        .filter((d: string) => {
          // Filter out common non-business domains
          const excluded = ['google.com', 'facebook.com', 'yelp.com', 'linkedin.com', 
                          'instagram.com', 'twitter.com', 'youtube.com', 'example.com'];
          return d.length > 3 && !excluded.includes(d);
        })
    )];

    console.log(`Found ${uniqueDomains.length} unique domains`);

    return new Response(
      JSON.stringify({
        domains: uniqueDomains,
        location,
        keywords: keywords || null,
        count: uniqueDomains.length
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
