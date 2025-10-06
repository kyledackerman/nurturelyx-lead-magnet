import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prospectIds } = await req.json();

    if (!prospectIds || prospectIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No prospects selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Enriching ${prospectIds.length} prospects for user ${user.id}`);

    const results = [];

    // Process each prospect sequentially to avoid rate limits
    for (const prospectId of prospectIds) {
      try {
        // Update status to in_progress
        await supabase
          .from('prospect_activities')
          .update({
            enrichment_status: 'in_progress',
            enrichment_started_at: new Date().toISOString(),
          })
          .eq('id', prospectId);

        // Fetch prospect with report data
        const { data: prospect, error: fetchError } = await supabase
          .from('prospect_activities')
          .select('id, report_id, reports!inner(domain, report_data, extracted_company_name)')
          .eq('id', prospectId)
          .single();

        if (fetchError || !prospect) {
          console.error(`Error fetching prospect ${prospectId}:`, fetchError);
          await supabase
            .from('prospect_activities')
            .update({ enrichment_status: 'failed' })
            .eq('id', prospectId);
          results.push({ prospectId, success: false, error: 'Failed to fetch prospect' });
          continue;
        }

        const domain = prospect.reports.domain;
        const companyName = prospect.reports.extracted_company_name || domain;

        // Call AI to find contacts
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
                content: `You are a contact enrichment specialist. Your task is to find ALL available contact information for a company domain.

PRIORITY: Decision-makers (CEO, Founder, CTO, CMO, VP, Director, Manager, Owner, President, COO, CFO, Chief)
SOURCES TO SEARCH: Company website, About Us page, Team page, Contact page, LinkedIn company page and employee profiles, Facebook, Twitter/X, press releases, news articles, public directories

For each contact found, extract:
- Full name (first and last name)
- Email address
- Job title (if available)
- Phone number (if available)
- Street address (if available)
- LinkedIn URL (if available)
- Facebook URL (if available)

CLASSIFICATION RULES:
- Generic emails (info@, contact@, sales@, support@, hello@, admin@): Use company name as first_name, contact_type='generic'
- Department emails (marketing@, hr@, finance@, legal@): Use company name as first_name, department as last_name, contact_type='department'
- Personal emails (firstname.lastname@, etc.): Extract actual person's name, contact_type based on title (decision_maker if C-level/VP/Director/Manager/Founder/Owner)

Assign confidence scores (1-100) based on source reliability and data completeness.

IMPORTANT: Find ALL contacts, no limit. Prioritize decision-makers but include everyone.`
              },
              {
                role: 'user',
                content: `Find all contact information for the company: ${companyName}
Domain: ${domain}

Search their website, team pages, social media, press releases, and any public sources. Return ALL contacts found.`
              }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'save_contacts',
                description: 'Save all discovered contacts for the company',
                parameters: {
                  type: 'object',
                  properties: {
                    contacts: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          contact_type: {
                            type: 'string',
                            enum: ['decision_maker', 'generic', 'department'],
                            description: 'Type of contact based on email and title'
                          },
                          first_name: {
                            type: 'string',
                            description: 'First name (company name for generic/department contacts)'
                          },
                          last_name: {
                            type: 'string',
                            description: 'Last name (null for generic contacts, department name for department contacts)'
                          },
                          email: {
                            type: 'string',
                            description: 'Email address'
                          },
                          job_title: {
                            type: 'string',
                            description: 'Job title if available'
                          },
                          phone: {
                            type: 'string',
                            description: 'Phone number if available'
                          },
                          street_address: {
                            type: 'string',
                            description: 'Street address if available'
                          },
                          facebook_url: {
                            type: 'string',
                            description: 'Facebook URL if available'
                          },
                          linkedin_url: {
                            type: 'string',
                            description: 'LinkedIn URL if available'
                          },
                          source: {
                            type: 'string',
                            enum: ['company_website', 'about_us', 'team_page', 'contact_page', 'linkedin', 'facebook', 'twitter', 'press_release', 'paid_database', 'other'],
                            description: 'Source where the contact was found'
                          },
                          confidence_score: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            description: 'Confidence score (1-100) based on source reliability and data completeness'
                          },
                          is_decision_maker: {
                            type: 'boolean',
                            description: 'Whether this is a decision-maker (C-level, VP, Director, Manager, Founder, Owner)'
                          }
                        },
                        required: ['contact_type', 'first_name', 'email', 'source', 'confidence_score', 'is_decision_maker']
                      }
                    }
                  },
                  required: ['contacts']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'save_contacts' } }
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${domain}:`, aiResponse.status, errorText);
          
          if (aiResponse.status === 429) {
            // Rate limited - wait and retry
            console.log('Rate limited, waiting 60 seconds...');
            await new Promise(resolve => setTimeout(resolve, 60000));
            // Could retry here, but for now just fail
          }
          
          await supabase
            .from('prospect_activities')
            .update({ enrichment_status: 'failed' })
            .eq('id', prospectId);
          
          results.push({ prospectId, success: false, error: `AI API error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        console.log('AI response:', JSON.stringify(aiData, null, 2));

        // Extract contacts from tool call
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall || !toolCall.function?.arguments) {
          console.error('No tool call in AI response');
          await supabase
            .from('prospect_activities')
            .update({ enrichment_status: 'failed' })
            .eq('id', prospectId);
          results.push({ prospectId, success: false, error: 'No contacts found by AI' });
          continue;
        }

        const contactsData = JSON.parse(toolCall.function.arguments);
        const contacts = contactsData.contacts || [];

        console.log(`Found ${contacts.length} contacts for ${domain}`);

        // Check for existing contacts to avoid duplicates
        const { data: existingContacts } = await supabase
          .from('prospect_contacts')
          .select('email')
          .eq('prospect_activity_id', prospectId);

        const existingEmails = new Set(existingContacts?.map(c => c.email.toLowerCase()) || []);

        // Insert new contacts
        let insertedCount = 0;
        for (const contact of contacts) {
          if (existingEmails.has(contact.email.toLowerCase())) {
            console.log(`Skipping duplicate email: ${contact.email}`);
            continue;
          }

          const { error: insertError } = await supabase
            .from('prospect_contacts')
            .insert({
              prospect_activity_id: prospectId,
              contact_type: contact.contact_type,
              first_name: contact.first_name,
              last_name: contact.last_name || null,
              email: contact.email,
              job_title: contact.job_title || null,
              phone: contact.phone || null,
              street_address: contact.street_address || null,
              facebook_url: contact.facebook_url || null,
              linkedin_url: contact.linkedin_url || null,
              source: contact.source,
              confidence_score: contact.confidence_score,
              is_decision_maker: contact.is_decision_maker,
              enriched_by: user.id,
            });

          if (insertError) {
            console.error(`Error inserting contact for ${domain}:`, insertError);
          } else {
            insertedCount++;
          }
        }

        // Update prospect status
        await supabase
          .from('prospect_activities')
          .update({
            enrichment_status: 'completed',
            enrichment_completed_at: new Date().toISOString(),
            total_contacts_found: insertedCount,
          })
          .eq('id', prospectId);

        results.push({
          prospectId,
          success: true,
          contactsFound: insertedCount,
          domain,
        });

      } catch (error) {
        console.error(`Error processing prospect ${prospectId}:`, error);
        await supabase
          .from('prospect_activities')
          .update({ enrichment_status: 'failed' })
          .eq('id', prospectId);
        results.push({
          prospectId,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      totalProcessed: prospectIds.length,
      successCount: results.filter(r => r.success).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enrich-contacts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
