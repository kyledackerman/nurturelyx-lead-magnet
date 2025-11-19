import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email validation (same logic as frontend)
const AVOID_PREFIXES = [
  'legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca',
  'noreply', 'no-reply', 'devnull', 'bounce', 'unsubscribe'
];

const PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com',
  'mail.com', 'yandex.com', 'gmx.com', 'live.com', 'msn.com', 'me.com', 'mac.com'
];

const EXCLUDED_DOMAINS = ['edu', 'gov', 'mil'];

function isValidSalesEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.toLowerCase())) return false;
  
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Check excluded domains
  if (EXCLUDED_DOMAINS.some(tld => domain.endsWith(`.${tld}`) || domain === tld)) {
    return false;
  }
  
  // Check avoided prefixes
  if (AVOID_PREFIXES.some(prefix => 
    localPart === prefix || localPart.startsWith(`${prefix}.`) || localPart.startsWith(`${prefix}-`)
  )) {
    return false;
  }
  
  return true;
}

function extractEmailsFromText(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches.filter(isValidSalesEmail))];
}

// Check if an email belongs to the target domain
function isEmailForDomain(email: string, targetDomain: string): boolean {
  const emailDomain = email.toLowerCase().split('@')[1];
  const cleanTarget = targetDomain.toLowerCase().replace(/^www\./, '');
  
  // Exact domain match
  if (emailDomain === cleanTarget) {
    return true;
  }
  
  // Subdomain match
  if (emailDomain.endsWith(`.${cleanTarget}`)) {
    return true;
  }
  
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job_id from request
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch job record
    const { data: job, error: jobError } = await supabase
      .from('re_enrichment_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check job status
    if (job.status === 'paused') {
      return new Response(
        JSON.stringify({ message: 'Job is paused', job_status: 'paused' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.status === 'completed') {
      return new Response(
        JSON.stringify({ message: 'Job already completed', job_status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update job to running if queued
    if (job.status === 'queued') {
      await supabase
        .from('re_enrichment_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', job_id);
    }

    // Check if we've hit the max
    if (job.processed_count >= job.max_domains_to_process) {
      await supabase
        .from('re_enrichment_jobs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          stopped_reason: 'completed'
        })
        .eq('id', job_id);
      
      return new Response(
        JSON.stringify({ 
          message: 'Job completed - max domains reached', 
          job_status: 'completed',
          job_progress: {
            total: job.total_count,
            processed: job.processed_count,
            enriched: job.enriched_count,
            notFound: job.not_found_count,
            errors: job.error_count
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ONE review prospect at current offset
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        status,
        enrichment_retry_count,
        reports!inner (
          domain,
          extracted_company_name,
          industry,
          city,
          state
        )
      `)
      .eq('status', 'review')
      .lt('enrichment_retry_count', 3)
      .is('purchased_by_ambassador', null)
      .order('created_at', { ascending: true })
      .range(job.current_offset, job.current_offset)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!prospects || prospects.length === 0) {
      // No more prospects - mark job as completed
      await supabase
        .from('re_enrichment_jobs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          stopped_reason: 'no_more_prospects'
        })
        .eq('id', job_id);
      
      return new Response(
        JSON.stringify({ 
          message: 'No more review prospects available', 
          job_status: 'completed',
          job_progress: {
            total: job.total_count,
            processed: job.processed_count,
            enriched: job.enriched_count,
            notFound: job.not_found_count,
            errors: job.error_count
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prospect = prospects[0];
    const report = prospect.reports as any;
    const domain = report.domain;
    const companyName = report.extracted_company_name || domain;
    const industry = report.industry || 'general business';
    const city = report.city || '';
    const state = report.state || '';

    // Create job item
    const { data: jobItem } = await supabase
      .from('re_enrichment_job_items')
      .insert({
        job_id: job_id,
        prospect_activity_id: prospect.id,
        domain: domain,
        report_id: prospect.report_id,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log(`[Re-Enrich V2] Processing: ${domain}`);

    let foundEmails: string[] = [];
    let ownerName: string | null = null;
    let stage = 'Stage 1';

    // STAGE 1: Find Owner/Founder Name (15-20 queries)
    const stage1Queries = [
      `"${companyName}" owner OR founder name ${city} ${state}`,
      `"${domain}" business license owner ${state}`,
      `site:linkedin.com/in "owner at ${companyName}"`,
      `site:linkedin.com/in "founder ${companyName}"`,
      `site:linkedin.com/in "CEO ${companyName}"`,
      `"${companyName}" owner interview ${city}`,
      `"${companyName}" founder spotlight ${city}`,
      `site:facebook.com/${domain.replace(/\./g, '')} about owner`,
      `"${companyName}" "founded by" OR "owner" ${state}`,
      `site:opencorporates.com "${companyName}" director OR officer`,
      `site:chamberofcommerce.com "${companyName}" owner ${city}`,
      `"${companyName}" license holder ${state} ${industry}`,
      `"${companyName}" testimonial owner name`,
      `"${companyName}" case study owner`,
      `"${domain}" "meet the team" OR "our team"`,
    ];

    console.log(`[Stage 1] Searching for owner name with ${stage1Queries.length} queries...`);

    for (const query of stage1Queries) {
      try {
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
                content: `You are an expert at extracting owner/founder names from search results. Extract ONLY the person's name if found. Return just the name or "NOT_FOUND".`
              },
              {
                role: 'user',
                content: `Search for: ${query}\n\nExtract the owner/founder name if present in results.`
              }
            ],
            tools: [{ type: 'google_search_retrieval', google_search_retrieval: {} }],
          }),
        });

        if (aiResponse.status === 429) {
          console.log('[Rate Limit] Stopping immediately');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded', code: 429 }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (aiResponse.status === 402) {
          console.log('[Credits] Stopping immediately');
          return new Response(
            JSON.stringify({ error: 'Credits exhausted', code: 402 }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        
        if (content && content !== 'NOT_FOUND' && !content.toLowerCase().includes('not found')) {
          ownerName = content.trim();
          console.log(`[Stage 1] Found owner: ${ownerName}`);
          break;
        }
      } catch (error) {
        console.error(`[Stage 1] Query error:`, error);
      }
    }

    // STAGE 2: Find Owner's Contact (strict domain-only with context verification)
    if (ownerName) {
      stage = 'Stage 2';
      const stage2Queries = [
        `"${ownerName}" "@${domain}"`, // Priority: owner's email at business domain
        `"${ownerName}" "${companyName}" email`,
        `site:${domain} "${ownerName}" email OR contact`,
        `site:linkedin.com/in "${ownerName}" "${companyName}" email`,
        `"${ownerName}" "${companyName}" press release email`,
        `"${ownerName}" "${companyName}" contact ${city}`,
        `"${companyName}" "${ownerName}" ${industry} contact`,
      ];

      console.log(`[Stage 2] Searching for ${ownerName}'s contact with ${stage2Queries.length} queries...`);

      for (const query of stage2Queries) {
        try {
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
                  content: `Extract email addresses that belong to ${ownerName} at ${companyName}. ONLY return emails if you can verify they are mentioned in the same context as the company. Return valid email addresses one per line, or "NONE" if not found.`
                },
                {
                  role: 'user',
                  content: `Search for: ${query}\n\nExtract any email addresses found.`
                }
              ],
              tools: [{ type: 'google_search_retrieval', google_search_retrieval: {} }],
            }),
          });

          if (aiResponse.status === 429 || aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'Credits exhausted', code: aiResponse.status }),
              { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          const emails = extractEmailsFromText(content);
          
          if (emails.length > 0) {
            foundEmails.push(...emails);
            console.log(`[Stage 2] Found ${emails.length} emails`);
          }
        } catch (error) {
          console.error(`[Stage 2] Query error:`, error);
        }
      }

      // Validate emails with strict context awareness
      if (foundEmails.length > 0) {
        const domainEmails = foundEmails.filter(e => isEmailForDomain(e, domain));
        
        console.log(`[Stage 2 Validation] Total: ${foundEmails.length}, Domain: ${domainEmails.length}`);
        
        // Only keep domain emails - reject unverified personal emails
        // Personal emails are only valid if they appear alongside domain emails (same source/context)
        if (domainEmails.length > 0) {
          foundEmails = domainEmails;
          console.log(`[Stage 2 Validation] Keeping ${domainEmails.length} domain emails`);
        } else {
          // If no domain emails found, likely a different person with same name
          foundEmails = [];
          console.log(`[Stage 2 Validation] No domain emails found, rejecting all results (likely wrong person)`);
        }
      }
    }

    // STAGE 3: Domain-Wide Email Discovery (if still no emails)
    if (foundEmails.length === 0) {
      stage = 'Stage 3A';
      const stage3AQueries = [
        `"@${domain}" email contact`,
        `"@${domain}" -site:${domain}`,
        `"@${domain}" site:linkedin.com`,
        `"@${domain}" site:facebook.com`,
        `"@${domain}" site:bbb.org OR site:yelp.com`,
        `"@${domain}" press release`,
        `"@${domain}" ${industry} directory`,
        `"@${domain}" chamber of commerce`,
      ];

      console.log(`[Stage 3A] Boolean domain search with ${stage3AQueries.length} queries...`);

      for (const query of stage3AQueries) {
        try {
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
                  content: `Extract all email addresses from search results. Return ONLY valid email addresses, one per line. If none found, return "NONE".`
                },
                {
                  role: 'user',
                  content: `Search for: ${query}\n\nExtract any email addresses found.`
                }
              ],
              tools: [{ type: 'google_search_retrieval', google_search_retrieval: {} }],
            }),
          });

          if (aiResponse.status === 429 || aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'Credits exhausted', code: aiResponse.status }),
              { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          const emails = extractEmailsFromText(content);
          
          // Only accept emails from target domain
          const validEmails = emails.filter(e => isEmailForDomain(e, domain));
          
          if (validEmails.length > 0) {
            foundEmails.push(...validEmails);
            console.log(`[Stage 3A] Found ${validEmails.length} domain emails (${emails.length} total filtered)`);
          }
        } catch (error) {
          console.error(`[Stage 3A] Query error:`, error);
        }
      }

      // STAGE 3B: Targeted Role Emails
      if (foundEmails.length === 0) {
        stage = 'Stage 3B';
        const stage3BQueries = [
          `owner@${domain}`,
          `sales@${domain}`,
          `marketing@${domain}`,
          `"${companyName}" sales email`,
          `"${companyName}" marketing contact`,
        ];

        console.log(`[Stage 3B] Targeted role emails with ${stage3BQueries.length} queries...`);

        for (const query of stage3BQueries) {
          try {
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
                    content: `Extract all email addresses from search results. Return ONLY valid email addresses, one per line. If none found, return "NONE".`
                  },
                  {
                    role: 'user',
                    content: `Search for: ${query}\n\nExtract any email addresses found.`
                  }
                ],
                tools: [{ type: 'google_search_retrieval', google_search_retrieval: {} }],
              }),
            });

            if (aiResponse.status === 429 || aiResponse.status === 402) {
              return new Response(
                JSON.stringify({ error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'Credits exhausted', code: aiResponse.status }),
                { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            const emails = extractEmailsFromText(content);
            
            // Filter to only domain emails
            const validEmails = emails.filter(e => isEmailForDomain(e, domain));
            
            if (validEmails.length > 0) {
              foundEmails.push(...validEmails);
              console.log(`[Stage 3B] Found ${validEmails.length} domain emails (${emails.length} total filtered)`);
            }
          } catch (error) {
            console.error(`[Stage 3B] Query error:`, error);
          }
        }
      }

      // STAGE 3C: Last Resort Generic Emails
      if (foundEmails.length === 0) {
        stage = 'Stage 3C';
        const genericEmails = [
          `info@${domain}`,
          `contact@${domain}`,
          `sales@${domain}`,
          `marketing@${domain}`,
          `hello@${domain}`,
        ];

        console.log(`[Stage 3C] Testing ${genericEmails.length} generic emails...`);

        for (const email of genericEmails) {
          try {
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
                    content: `Check if this email address appears anywhere on the web. Return "FOUND" if it exists publicly, "NOT_FOUND" otherwise.`
                  },
                  {
                    role: 'user',
                    content: `Search for: "${email}"\n\nDoes this email appear in search results?`
                  }
                ],
                tools: [{ type: 'google_search_retrieval', google_search_retrieval: {} }],
              }),
            });

            if (aiResponse.status === 429 || aiResponse.status === 402) {
              return new Response(
                JSON.stringify({ error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'Credits exhausted', code: aiResponse.status }),
                { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            
            if (content.includes('FOUND')) {
              foundEmails.push(email);
              console.log(`[Stage 3C] Confirmed generic email: ${email}`);
            }
          } catch (error) {
            console.error(`[Stage 3C] Query error:`, error);
          }
        }
      }
    }

    // Final verification: deduplicate and ensure strict domain match
    foundEmails = [...new Set(foundEmails)]; // Remove duplicates
    
    const verifiedEmails = foundEmails.filter(email => {
      const emailDomain = email.toLowerCase().split('@')[1];
      const targetDomain = domain.toLowerCase().replace(/^www\./, '');
      
      // Accept if exact domain match or subdomain
      const isDomainMatch = emailDomain === targetDomain || emailDomain.endsWith(`.${targetDomain}`);
      
      if (!isDomainMatch) {
        console.log(`[Final Verification] Rejecting ${email} - domain mismatch for ${domain}`);
      }
      
      return isDomainMatch;
    });
    
    foundEmails = verifiedEmails;
    console.log(`[Final Verification] ${verifiedEmails.length}/${foundEmails.length + (foundEmails.length - verifiedEmails.length)} emails passed strict domain verification`);
    console.log(`[Result] Found ${foundEmails.length} total valid emails for ${domain}`);

    // Update job item with results
    const emailsFound = foundEmails.length > 0;
    await supabase
      .from('re_enrichment_job_items')
      .update({
        status: emailsFound ? 'enriched' : 'not_found',
        owner_name_found: ownerName,
        stage_reached: stage,
        contacts_found: foundEmails.length,
        emails_extracted: foundEmails,
        completed_at: new Date().toISOString(),
        search_queries_used: stage === 'Stage 1' ? 15 : stage === 'Stage 2' ? 30 : 45
      })
      .eq('id', jobItem!.id);

    // Insert contacts and update status
    if (foundEmails.length > 0) {
      // Insert contacts (max 25) - only use owner name for domain emails
      for (const email of foundEmails.slice(0, 25)) {
        const emailDomain = email.split('@')[1];
        
        // Only use owner name if email is from target domain (not personal emails)
        const useOwnerName = isEmailForDomain(email, domain);
        
        const nameParts = useOwnerName && ownerName ? ownerName.split(' ') : ['', ''];
        const notes = useOwnerName && ownerName ? 'Owner/Founder' : 'Found via domain search';
        
        await supabase.from('prospect_contacts').insert({
          prospect_activity_id: prospect.id,
          report_id: prospect.report_id,
          email: email,
          first_name: nameParts[0] || 'Contact',
          last_name: nameParts.slice(1).join(' ') || '',
          is_primary: foundEmails.indexOf(email) === 0,
          notes: notes,
        });
      }

      // Update prospect to enriched
      await supabase
        .from('prospect_activities')
        .update({
          status: 'enriched',
          contact_count: foundEmails.length,
          enrichment_locked_at: null,
          enrichment_locked_by: null,
          last_enrichment_attempt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', prospect.id);

      // Log to audit
      await supabase.from('audit_logs').insert({
        table_name: 'prospect_activities',
        record_id: prospect.id,
        action_type: 'UPDATE',
        field_name: 'status',
        old_value: 'review',
        new_value: 'enriched',
        business_context: `Re-enrichment V2: Found ${foundEmails.length} emails via ${stage} (${domain})`,
      });

      console.log(`[Re-Enrich V2] ✅ Enriched ${domain} with ${foundEmails.length} emails`);
    } else {
      // No emails found, increment retry count
      const newRetryCount = (prospect.enrichment_retry_count || 0) + 1;
      const newStatus = newRetryCount >= 3 ? 'not_viable' : 'review';

      await supabase
        .from('prospect_activities')
        .update({
          enrichment_retry_count: newRetryCount,
          status: newStatus,
          last_enrichment_attempt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', prospect.id);

      console.log(`[Re-Enrich V2] ❌ No emails found for ${domain} (Retry: ${newRetryCount}/3)`);
    }

    // Update job progress
    const { data: updatedJob } = await supabase
      .from('re_enrichment_jobs')
      .update({
        processed_count: job.processed_count + 1,
        enriched_count: emailsFound ? job.enriched_count + 1 : job.enriched_count,
        not_found_count: !emailsFound ? job.not_found_count + 1 : job.not_found_count,
        current_offset: job.current_offset + 1,
        last_processed_at: new Date().toISOString()
      })
      .eq('id', job_id)
      .select()
      .single();

    // Server-side delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        ownerName,
        emailsFound: foundEmails.length,
        stage,
        processed: 1,
        job_status: updatedJob?.status || 'running',
        job_progress: {
          total: updatedJob?.total_count || 0,
          processed: updatedJob?.processed_count || 0,
          enriched: updatedJob?.enriched_count || 0,
          notFound: updatedJob?.not_found_count || 0,
          errors: updatedJob?.error_count || 0,
          currentOffset: updatedJob?.current_offset || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Re-Enrich V2] Error:', error);
    
    // If we have a job_id, update error count
    try {
      const body = await req.json();
      const job_id = body.job_id;
      if (job_id) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        
        const { data: job } = await supabase
          .from('re_enrichment_jobs')
          .select('error_count, processed_count, current_offset')
          .eq('id', job_id)
          .single();
        
        if (job) {
          await supabase
            .from('re_enrichment_jobs')
            .update({
              error_count: (job.error_count || 0) + 1,
              processed_count: job.processed_count + 1,
              current_offset: job.current_offset + 1,
              last_processed_at: new Date().toISOString()
            })
            .eq('id', job_id);
        }
      }
    } catch {}
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
