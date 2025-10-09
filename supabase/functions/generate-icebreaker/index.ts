import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prospect_activity_id, 
      domain, 
      company_name, 
      scraped_content,
      force_regenerate = false 
    } = await req.json();

    console.log(`🎯 Generating icebreaker for ${domain} (${company_name || 'Unknown'})`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if icebreaker already exists (unless force_regenerate)
    if (!force_regenerate) {
      const { data: existing } = await supabaseClient
        .from('prospect_activities')
        .select('icebreaker_text')
        .eq('id', prospect_activity_id)
        .single();

      if (existing?.icebreaker_text) {
        console.log('✅ Icebreaker already exists, skipping generation');
        return new Response(
          JSON.stringify({ 
            icebreaker: existing.icebreaker_text, 
            skipped: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get Lovable API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Construct AI prompt for icebreaker generation
    const searchQuery = `Recent news, achievements, customer reviews, awards, community involvement, or notable information about ${company_name || domain} business`;
    
    const systemPrompt = `You are a B2B sales copywriting expert helping a sales team craft personalized cold outreach openers for local service businesses. Your goal is to write casual, friendly, colleague-like messages that feel authentic and conversational.`;

    const userPrompt = `
**COMPANY INFORMATION:**
- Domain: ${domain}
- Company Name: ${company_name || 'Unknown'}

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
- Use casual language: "Hey", "I noticed", "just saw", "looks like"
- Specific and personalized (reference something unique you found)
- Authentic (not obviously AI-generated or salesy)
- NO formal greetings like "Dear" or "To whom it may concern"
- NO obvious sales language like "I wanted to reach out about..."

**STRUCTURE:**
1st sentence: Reference something SPECIFIC you found (achievement, review highlight, expansion, etc.)
2nd sentence: Natural transition mentioning you analyzed their website traffic and found untapped lead potential

**EXAMPLE OUTPUTS:**

Example 1 (HVAC):
"Hey! Just saw you folks were featured in the Tribune for your emergency response during that winter storm - impressive 24/7 service. I ran some numbers on your website traffic and noticed you might be missing out on a pretty significant number of leads each month from anonymous visitors."

Example 2 (Law Firm):
"Hey there! Noticed you recently expanded into family law mediation - looks like that's filling a real gap in the area. Quick heads up: I analyzed your site traffic and found some interesting opportunities to capture more of those website visitors who are checking out your services but not filling out forms."

Example 3 (Plumbing):
"Hey! Your Google reviews are killer - 4.9 stars with customers raving about your same-day service is no joke. I took a look at your website analytics and found you're getting solid traffic, but there might be a way to turn more of those anonymous visitors into actual leads."

**IMPORTANT RULES:**
- Must reference something SPECIFIC from your web research
- Keep it under 50 words total
- Make it feel like you genuinely researched them (because you did!)
- End with a soft mention of their "lead loss" or "missed website opportunities"
- Be conversational, not corporate

${scraped_content ? `\n**WEBSITE CONTENT (for additional context):**\n${scraped_content.substring(0, 1500)}\n` : ''}

Now search the web and write the icebreaker:
`;

    console.log('🔍 Calling Lovable AI with Google Search grounding...');

    // Call Lovable AI with Google Search tool
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "google_search_retrieval"
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI API error: ${aiResponse.status}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const aiData = await aiResponse.json();
    const icebreaker = aiData.choices?.[0]?.message?.content?.trim();

    if (!icebreaker) {
      throw new Error('No icebreaker generated by AI');
    }

    console.log('✅ Icebreaker generated:', icebreaker.substring(0, 100) + '...');

    // Save to database
    const { error: updateError } = await supabaseClient
      .from('prospect_activities')
      .update({
        icebreaker_text: icebreaker,
        icebreaker_generated_at: new Date().toISOString(),
        icebreaker_edited_manually: false
      })
      .eq('id', prospect_activity_id);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw updateError;
    }

    console.log('✅ Icebreaker saved to database');

    return new Response(
      JSON.stringify({ 
        icebreaker,
        generated_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-icebreaker:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
