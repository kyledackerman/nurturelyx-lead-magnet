import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LAYER 2: Clean AI output from meta-commentary and formatting issues
function cleanIcebreakerOutput(rawOutput: string): string {
  let cleaned = rawOutput.trim();
  
  // 1. Remove common AI meta-commentary patterns
  const metaPatterns = [
    /^(here's|here is|here you go|based on|i found|i couldn't find|i noticed|let me|i'll|i've created|i've generated)[^.!?]*[:.-]\s*/i,
    /^(icebreaker|opener|opening line|cold outreach|personalized message)[:.-]\s*/i,
    /\(.*?based on.*?\)/gi,  // Remove parenthetical notes
    /\[.*?note.*?\]/gi,       // Remove bracketed notes
  ];
  
  for (const pattern of metaPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // 2. Remove wrapping quotation marks (but preserve internal quotes)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // 3. Remove smart quotes that AI sometimes adds
  cleaned = cleaned
    .replace(/^[""]|[""]$/g, '')  // Remove smart quotes at start/end
    .replace(/^['']|['']$/g, '');  // Remove smart single quotes
  
  // 4. Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // 5. Ensure it doesn't start with common filler words
  const fillerStarts = [
    'so, ',
    'well, ',
    'um, ',
    'anyway, ',
    'basically, '
  ];
  
  for (const filler of fillerStarts) {
    if (cleaned.toLowerCase().startsWith(filler)) {
      cleaned = cleaned.substring(filler.length);
      // Capitalize first letter after removing filler
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  
  return cleaned.trim();
}

// LAYER 3: Validate icebreaker quality
function validateIcebreaker(icebreaker: string): string[] {
  const errors: string[] = [];
  
  if (!icebreaker) {
    errors.push('Empty icebreaker');
    return errors;
  }
  
  // Check length (50 words max ≈ 350 characters)
  if (icebreaker.length > 350) {
    errors.push(`Too long: ${icebreaker.length} chars (max 350)`);
  }
  
  // Check minimum length
  if (icebreaker.length < 20) {
    errors.push(`Too short: ${icebreaker.length} chars (min 20)`);
  }
  
  // Check for unwanted meta-commentary keywords
  const forbiddenPhrases = [
    'here is',
    'here\'s',
    'i found',
    'i couldn\'t',
    'based on my',
    'i noticed that',
    'let me know',
    'hope this helps',
    'icebreaker:',
    'opener:'
  ];
  
  const lowerIcebreaker = icebreaker.toLowerCase();
  const foundForbidden = forbiddenPhrases.filter(phrase => 
    lowerIcebreaker.includes(phrase)
  );
  
  if (foundForbidden.length > 0) {
    errors.push(`Contains meta-commentary: ${foundForbidden.join(', ')}`);
  }
  
  // Check sentence structure (should have 2-4 sentences)
  const sentenceCount = (icebreaker.match(/[.!?]+/g) || []).length;
  if (sentenceCount > 4) {
    errors.push(`Too many sentences: ${sentenceCount} (max 4)`);
  }
  if (sentenceCount < 1) {
    errors.push('No sentences found (missing punctuation)');
  }
  
  return errors;
}

// LAYER 7: Fallback icebreaker generator
function generateFallbackIcebreaker(
  companyName: string | null, 
  domain: string
): string {
  const name = companyName || domain;
  
  return `I took a look at ${name}'s website and noticed you're getting solid traffic. Quick heads up: there might be an opportunity to capture more of those website visitors who aren't converting into leads yet.`;
}

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

    // Check if icebreaker already exists and fetch lead_source (unless force_regenerate)
    const { data: prospectData } = await supabaseClient
      .from('prospect_activities')
      .select('icebreaker_text, lead_source')
      .eq('id', prospect_activity_id)
      .single();

    if (!force_regenerate && prospectData?.icebreaker_text) {
      console.log('✅ Icebreaker already exists, skipping generation');
      return new Response(
        JSON.stringify({ 
          icebreaker: prospectData.icebreaker_text, 
          skipped: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lead_source = prospectData?.lead_source || 'cold_outbound';

    // Get Lovable API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Construct AI prompt for icebreaker generation
    const searchQuery = `Recent news, achievements, customer reviews, awards, community involvement, or notable information about ${company_name || domain} business`;
    
    const systemPrompt = lead_source === 'warm_inbound'
      ? `You are a B2B sales expert writing to someone who ALREADY ran their own lead recovery report on your website.

They SAW their missed revenue. They took ACTION by running the report. This is a WARM lead.

Your icebreaker should:
- Acknowledge they ran the report (e.g., "I saw you ran a lead recovery analysis for [company]...")
- Reference the specific numbers they saw
- Position yourself as helping them solve a problem THEY discovered

CRITICAL OUTPUT RULES:
- Output ONLY the icebreaker text - no quotation marks, no explanations
- Maximum 50 words, 2-3 sentences
- First person, conversational tone`
      
      : `You are a B2B sales copywriting expert. Your ONLY job is to output the icebreaker text itself - nothing else.

CRITICAL OUTPUT RULES:
- Output ONLY the icebreaker sentences - no quotation marks, no explanations, no meta-commentary
- Do NOT write "Here's the icebreaker:" or "Here you go:" or any preamble
- Do NOT wrap output in quotation marks (neither single nor double)
- Do NOT include any instructions or notes about what you did
- If you cannot find specific information, write a generic but personalized opener instead of explaining the limitation
- Maximum 50 words, 2-3 sentences maximum`;

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

**WHAT NOT TO OUTPUT:**
❌ "Here's a personalized icebreaker: Just saw you folks..."
❌ "Just saw you folks were featured in the Tribune..."
❌ I found that they recently expanded. Here's what I came up with: "Noticed you recently..."
❌ Based on my research, I couldn't find recent news, so here's a generic opener...

✅ CORRECT OUTPUT (no quotes, no preamble): Just saw you folks were featured in the Tribune...

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
        temperature: 0.6, // Lower for more consistent output
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
    const rawIcebreaker = aiData.choices?.[0]?.message?.content?.trim();

    if (!rawIcebreaker) {
      throw new Error('No icebreaker generated by AI');
    }

    console.log('🔍 Raw AI output:', rawIcebreaker);

    // LAYER 2: Post-processing sanitization
    const icebreaker = cleanIcebreakerOutput(rawIcebreaker);
    console.log('🧹 Cleaned output:', icebreaker);

    // LAYER 3: Validation before saving
    const validationErrors = validateIcebreaker(icebreaker);
    
    if (validationErrors.length > 0) {
      console.error('❌ Icebreaker validation failed:', validationErrors);
      console.error('❌ Raw output:', rawIcebreaker);
      console.error('❌ Cleaned output:', icebreaker);
      
      // LAYER 7: Fallback strategy
      const fallbackIcebreaker = generateFallbackIcebreaker(company_name, domain);
      console.log('🔄 Using fallback icebreaker:', fallbackIcebreaker);
      
      // Save fallback to database
      const { error: updateError } = await supabaseClient
        .from('prospect_activities')
        .update({
          icebreaker_text: fallbackIcebreaker,
          icebreaker_generated_at: new Date().toISOString(),
          icebreaker_edited_manually: false
        })
        .eq('id', prospect_activity_id);

      if (updateError) {
        console.error('❌ Database update error:', updateError);
        throw updateError;
      }

      // LAYER 5: Log quality issues for monitoring
      console.log('⚠️ Quality issue logged:', {
        prospect_activity_id,
        validation_errors: validationErrors,
        used_fallback: true
      });

      return new Response(
        JSON.stringify({ 
          icebreaker: fallbackIcebreaker,
          generated_at: new Date().toISOString(),
          used_fallback: true,
          validation_errors: validationErrors
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log('✅ Icebreaker generated:', icebreaker.substring(0, 100) + '...');

    // LAYER 5: Quality metrics logging
    const qualityMetrics = {
      length: icebreaker.length,
      wordCount: icebreaker.split(/\s+/).length,
      sentenceCount: (icebreaker.match(/[.!?]+/g) || []).length,
      hasQuotes: icebreaker.includes('"') || icebreaker.includes("'"),
      startsWithCapital: /^[A-Z]/.test(icebreaker),
    };
    console.log('📊 Quality metrics:', qualityMetrics);

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
