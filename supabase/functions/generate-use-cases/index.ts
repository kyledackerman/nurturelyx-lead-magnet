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
    const { report_id } = await req.json();
    
    if (!report_id) {
      throw new Error('report_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch report data
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('extracted_company_name, industry, report_data, domain')
      .eq('id', report_id)
      .single();

    if (fetchError || !report) {
      console.error('Failed to fetch report:', fetchError);
      throw new Error('Report not found');
    }

    const { extracted_company_name, industry, report_data, domain } = report;

    if (!extracted_company_name) {
      console.log('Skipping generation: missing company name');
      return new Response(
        JSON.stringify({ success: false, message: 'Missing company name' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organicTraffic = report_data?.organicTraffic || 0;
    const missedLeads = report_data?.missedLeads || 0;
    const yearlyRevenueLost = report_data?.yearlyRevenueLost || 0;
    const avgTransactionValue = report_data?.avgTransactionValue || 0;

    // Format industry name for context (if available)
    const industryContext = industry && industry !== 'other' 
      ? `a ${industry.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} business` 
      : 'a business';

    // Build AI prompt
    const prompt = `You are writing for busy small business owners who hate corporate jargon. Analyze ${extracted_company_name} (${domain}) and write 2-3 real-world scenarios showing how they can turn anonymous website visitors into paying customers.

Context:
- Company: ${extracted_company_name}
- Domain: ${domain}
- Industry: ${industry || 'unknown'}
- Monthly Traffic: ${organicTraffic.toLocaleString()}
- Visitors leaving without identifying: ${missedLeads.toLocaleString()}/month
- Average sale: $${avgTransactionValue.toLocaleString()}
- Money left on table yearly: $${yearlyRevenueLost.toLocaleString()}

Writing style (IMPORTANT):
- Write like you're explaining to a friend over coffee
- Use short sentences and simple words
- No buzzwords like "leverage", "synergy", "actionable", "holistic", "solution"
- Speak directly: "When someone visits your site..." not "When a prospect engages..."
- Be specific and visual: "That contractor who spent 10 minutes reading your pricing page" not "high-intent visitors"

Each scenario should:
- Use "${extracted_company_name}" (not "your company")
- Show a concrete example from their actual business type
- Include realistic dollar amounts based on $${avgTransactionValue} sales
- Address this specific pain: ${missedLeads.toLocaleString()} people visit every month but you don't know who they are
- Be 3-4 sentences
- Total: 250-350 words

Examples of the friendly tone we want:
✅ "Picture this: someone spends 15 minutes on your pricing page at 2am, then vanishes. With identity resolution, you'd know they're the operations manager at ABC Corp—and your sales team can follow up in the morning."
❌ "Identity resolution enables your organization to leverage visitor intelligence for actionable outreach strategies."

Output only 2-3 scenario paragraphs separated by double line breaks. No headers, bullets, or intro/outro.`;

    console.log('Generating use cases and categorizing industry for:', extracted_company_name);

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You write like a friendly SaaS sales rep who hates corporate speak. Keep it real, specific, and conversational—like explaining the product to a busy small business owner over coffee.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_content",
              description: "Generate personalized use cases and categorize the business industry",
              parameters: {
                type: "object",
                properties: {
                  use_cases: {
                    type: "string",
                    description: "2-3 scenario paragraphs showing how the company can use identity resolution (250-350 words total)"
                  },
                  industry_category: {
                    type: "string",
                    description: "Industry category that best describes this business (max 3 words, lowercase, hyphenated if needed). Examples: hvac, legal, real-estate, financial-services, home-services, medical-practice, etc. Be specific and concise."
                  }
                },
                required: ["use_cases", "industry_category"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_content" } },
        temperature: 0.8,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== 'generate_content') {
      throw new Error('No tool call returned by AI');
    }

    const functionArgs = JSON.parse(toolCall.function.arguments);
    const generatedText = functionArgs.use_cases;
    const aiSuggestedIndustry = functionArgs.industry_category;

    if (!generatedText || !aiSuggestedIndustry) {
      throw new Error('Missing use_cases or industry_category in AI response');
    }

    console.log('Generated use cases length:', generatedText.length);
    console.log('AI suggested industry:', aiSuggestedIndustry);

    // Determine if we should update the industry field
    const shouldUpdateIndustry = !industry || industry === 'other';
    
    // Build update object
    const updateData: any = {
      personalized_use_cases: generatedText,
      use_cases_approved: true,
      use_cases_generated_at: new Date().toISOString()
    };

    // Only update industry if current value is "other" or null
    if (shouldUpdateIndustry) {
      updateData.industry = aiSuggestedIndustry;
      console.log(`✅ Updating industry from "${industry || 'null'}" to "${aiSuggestedIndustry}"`);
    } else {
      console.log(`ℹ️ Keeping existing industry "${industry}" (AI suggested: "${aiSuggestedIndustry}")`);
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', report_id);

    if (updateError) {
      console.error('Failed to save use cases:', updateError);
      throw updateError;
    }

    console.log('✅ Use cases generated and saved for:', domain);

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: generatedText,
        word_count: generatedText.split(/\s+/).length,
        industry_updated: shouldUpdateIndustry,
        old_industry: industry,
        new_industry: aiSuggestedIndustry
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-use-cases:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
