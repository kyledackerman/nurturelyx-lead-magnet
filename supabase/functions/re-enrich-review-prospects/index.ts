import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

// Email validation patterns
const AVOID_PREFIXES = [
  'legal', 'privacy', 'compliance', 'counsel', 'attorney', 'law', 'dmca',
  'noreply', 'no-reply', 'devnull', 'bounce', 'unsubscribe'
];

const EXCLUDED_DOMAINS = ['edu', 'gov', 'mil'];

interface EnhancedSearchStrategy {
  query: string;
  priority: number; // 1 = highest, 3 = lowest
}

function isValidEmail(email: string, domain: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const localPart = email.split('@')[0]?.toLowerCase() || '';
  const emailDomain = email.split('@')[1]?.toLowerCase() || '';
  
  // Check if it's from excluded domains
  if (EXCLUDED_DOMAINS.some(tld => emailDomain.endsWith(`.${tld}`) || emailDomain === tld)) {
    return false;
  }
  
  // Check if it has avoided prefixes
  if (AVOID_PREFIXES.some(prefix => 
    localPart === prefix || localPart.startsWith(`${prefix}.`) || localPart.startsWith(`${prefix}-`)
  )) {
    return false;
  }
  
  return true;
}

function generateEnhancedSearchQueries(
  domain: string, 
  companyName: string | null,
  city: string | null,
  state: string | null,
  retryCount: number
): EnhancedSearchStrategy[] {
  const queries: EnhancedSearchStrategy[] = [];
  const cleanDomain = domain.replace(/^www\./, '');
  const company = companyName || domain;
  
  // Retry 1: Enhanced Boolean searches (6 queries)
  if (retryCount === 0) {
    queries.push(
      { query: `"${company}" (owner OR founder OR CEO OR president) email -linkedin.com -facebook.com`, priority: 1 },
      { query: `site:${cleanDomain} ("@" AND (contact OR info OR sales OR hello OR team OR admin))`, priority: 1 },
      { query: `"${company}" contact firstname lastname email`, priority: 2 },
      { query: `"${company}" ${city || ''} ${state || ''} (phone OR email OR contact) site:*.com`, priority: 2 },
      { query: `site:linkedin.com "${company}" owner name`, priority: 2 },
      { query: `"${company}" press release contact email`, priority: 3 }
    );
  }
  
  // Retry 2: Owner/founder name searches (4 queries)
  else if (retryCount === 1) {
    queries.push(
      { query: `"${company}" founder email site:${cleanDomain}`, priority: 1 },
      { query: `"${domain}" CEO OR president email contact`, priority: 1 },
      { query: `site:twitter.com "${company}" email OR contact`, priority: 2 },
      { query: `"${company}" site:google.com/maps "owner response" OR "business owner"`, priority: 2 }
    );
  }
  
  // Retry 3: Email pattern matching + industry directories (8 queries)
  else if (retryCount === 2) {
    queries.push(
      { query: `site:${cleanDomain} "firstname@" OR "lastname@" OR "admin@" OR "office@"`, priority: 1 },
      { query: `info@${cleanDomain} OR contact@${cleanDomain} OR sales@${cleanDomain} OR hello@${cleanDomain}`, priority: 1 },
      { query: `site:chamberofcommerce.com "${company}" contact`, priority: 2 },
      { query: `site:local.com OR site:manta.com "${company}" email`, priority: 2 },
      { query: `site:yelp.com "${company}" business email`, priority: 2 },
      { query: `"${company}" directory (email OR phone OR contact) inurl:profile`, priority: 3 },
      { query: `site:instagram.com "${company}" business email`, priority: 3 },
      { query: `"${company}" ${city || ''} chamber of commerce contact`, priority: 3 }
    );
  }
  
  return queries.sort((a, b) => a.priority - b.priority);
}

async function searchGoogleForEmails(query: string): Promise<string[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    throw new Error('Google Search API credentials not configured');
  }
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Google Search API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const emails: string[] = [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    if (data.items) {
      for (const item of data.items) {
        // Extract from title
        const titleMatches = item.title?.match(emailRegex) || [];
        emails.push(...titleMatches);
        
        // Extract from snippet
        const snippetMatches = item.snippet?.match(emailRegex) || [];
        emails.push(...snippetMatches);
        
        // Extract from HTML snippet if available
        if (item.htmlSnippet) {
          const htmlMatches = item.htmlSnippet.match(emailRegex) || [];
          emails.push(...htmlMatches);
        }
      }
    }
    
    return [...new Set(emails)]; // Remove duplicates
  } catch (error) {
    console.error('Google Search error:', error);
    return [];
  }
}

function scoreEmail(email: string, domain: string): { score: number; tier: string } {
  const localPart = email.split('@')[0]?.toLowerCase() || '';
  const emailDomain = email.split('@')[1]?.toLowerCase() || '';
  const cleanDomain = domain.replace(/^www\./, '');
  
  // Tier 1 (Best): firstname@domain or firstname.lastname@domain
  if (emailDomain === cleanDomain && (
    /^[a-z]+$/.test(localPart) || // firstname only
    /^[a-z]+\.[a-z]+$/.test(localPart) // firstname.lastname
  )) {
    return { score: 100, tier: 'Tier 1 (Best)' };
  }
  
  // Tier 2 (Good): Common business emails on corporate domain
  if (emailDomain === cleanDomain && ['info', 'contact', 'sales', 'hello', 'team'].includes(localPart)) {
    return { score: 80, tier: 'Tier 2 (Good)' };
  }
  
  // Tier 3 (Acceptable): Personal emails or other business emails
  if (['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)) {
    return { score: 60, tier: 'Tier 3 (Acceptable)' };
  }
  
  if (['admin', 'office', 'support'].includes(localPart)) {
    return { score: 50, tier: 'Tier 3 (Acceptable)' };
  }
  
  return { score: 40, tier: 'Tier 3 (Acceptable)' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!userRole || (userRole.role !== 'admin' && userRole.role !== 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { batch_size = 500, offset = 0 } = await req.json();

    console.log(`🔄 Starting re-enrichment for review prospects (batch size: ${batch_size}, offset: ${offset})`);

    // Fetch review status prospects that need re-enrichment
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        enrichment_retry_count,
        contact_count,
        reports!inner(domain, extracted_company_name, city, state)
      `)
      .eq('status', 'review')
      .lt('enrichment_retry_count', 3)
      .order('created_at', { ascending: false })
      .range(offset, offset + batch_size - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch prospects: ${fetchError.message}`);
    }

    if (!prospects || prospects.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No prospects to re-enrich',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Processing ${prospects.length} review prospects`);

    let enriched = 0;
    let failed = 0;
    let markedNotViable = 0;

    for (const prospect of prospects) {
      const domain = prospect.reports.domain;
      const companyName = prospect.reports.extracted_company_name;
      const city = prospect.reports.city;
      const state = prospect.reports.state;
      const retryCount = prospect.enrichment_retry_count || 0;

      console.log(`🔍 Processing ${domain} (retry ${retryCount + 1}/3)`);

      try {
        // Generate search queries based on retry count
        const searchStrategies = generateEnhancedSearchQueries(domain, companyName, city, state, retryCount);
        
        const allEmails: Array<{ email: string; score: number; tier: string }> = [];

        // Execute searches with rate limiting
        for (const strategy of searchStrategies) {
          const foundEmails = await searchGoogleForEmails(strategy.query);
          
          for (const email of foundEmails) {
            if (isValidEmail(email, domain)) {
              const scoring = scoreEmail(email, domain);
              allEmails.push({ email: email.toLowerCase(), ...scoring });
            }
          }
          
          // Rate limiting: 100ms delay between searches
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Remove duplicates and sort by score
        const uniqueEmails = Array.from(
          new Map(allEmails.map(item => [item.email, item])).values()
        ).sort((a, b) => b.score - a.score);

        if (uniqueEmails.length > 0) {
          // Insert contacts (limit to top 10)
          const topEmails = uniqueEmails.slice(0, 10);
          
          for (const { email, tier } of topEmails) {
            await supabase.from('prospect_contacts').insert({
              prospect_activity_id: prospect.id,
              report_id: prospect.report_id,
              email: email,
              first_name: 'Contact',
              notes: `Found via re-enrichment (${tier})`
            });
          }

          // Update prospect status to enriched
          await supabase
            .from('prospect_activities')
            .update({
              status: 'enriched',
              contact_count: topEmails.length,
              enrichment_retry_count: retryCount + 1,
              enrichment_locked_at: null,
              enrichment_locked_by: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', prospect.id);

          // Log audit trail
          await supabase.from('audit_logs').insert({
            table_name: 'prospect_activities',
            record_id: prospect.id,
            action_type: 'UPDATE',
            field_name: 'status',
            old_value: 'review',
            new_value: 'enriched',
            business_context: `Re-enrichment successful: Found ${topEmails.length} valid emails (${domain})`,
            changed_by: user.id
          });

          enriched++;
          console.log(`✅ ${domain}: Found ${topEmails.length} emails, promoted to enriched`);
        } else {
          // No emails found, increment retry count
          const newRetryCount = retryCount + 1;
          
          if (newRetryCount >= 3) {
            // Mark as not_viable after 3 attempts
            await supabase
              .from('prospect_activities')
              .update({
                status: 'not_viable',
                enrichment_retry_count: newRetryCount,
                enrichment_locked_at: null,
                enrichment_locked_by: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', prospect.id);

            await supabase.from('audit_logs').insert({
              table_name: 'prospect_activities',
              record_id: prospect.id,
              action_type: 'UPDATE',
              field_name: 'status',
              old_value: 'review',
              new_value: 'not_viable',
              business_context: `Re-enrichment failed after 3 attempts: No valid emails found (${domain})`,
              changed_by: user.id
            });

            markedNotViable++;
            console.log(`❌ ${domain}: Marked as not_viable after 3 attempts`);
          } else {
            // Still in review, just increment retry count
            await supabase
              .from('prospect_activities')
              .update({
                enrichment_retry_count: newRetryCount,
                updated_at: new Date().toISOString()
              })
              .eq('id', prospect.id);

            failed++;
            console.log(`⚠️  ${domain}: No emails found (retry ${newRetryCount}/3)`);
          }
        }
      } catch (error) {
        console.error(`Error processing ${domain}:`, error);
        failed++;
      }
    }

    const summary = {
      success: true,
      batch_size: prospects.length,
      enriched,
      failed,
      marked_not_viable: markedNotViable,
      offset,
      next_offset: offset + batch_size
    };

    console.log(`✅ Re-enrichment batch complete:`, summary);

    return new Response(
      JSON.stringify(summary),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in re-enrich-review-prospects:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
