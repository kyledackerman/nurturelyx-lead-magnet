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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

    const { data: isAdmin } = await supabase.rpc('is_admin', { user_uuid: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 Finding stuck prospects with all enrichment criteria...');

    // Find prospects stuck in "enriching" that have all 3 criteria
    const { data: stuckProspects, error: queryError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        status,
        icebreaker_text,
        enrichment_locked_at,
        enrichment_locked_by,
        reports!inner (
          domain,
          extracted_company_name
        )
      `)
      .eq('status', 'enriching');

    if (queryError) {
      console.error('Error querying prospects:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${stuckProspects?.length || 0} prospects in 'enriching' status`);

    // Filter prospects that have all 3 criteria
    const prospectsToPromote = [];
    
    for (const prospect of stuckProspects || []) {
      // Check if has company name
      const hasCompanyName = prospect.reports?.extracted_company_name != null;
      
      // Check if has icebreaker
      const hasIcebreaker = prospect.icebreaker_text != null && prospect.icebreaker_text.trim() !== '';
      
      // Check if has valid sales emails
      const { data: contacts } = await supabase
        .from('prospect_contacts')
        .select('email')
        .eq('prospect_activity_id', prospect.id)
        .not('email', 'is', null);
      
      const hasValidEmail = contacts && contacts.length > 0 && contacts.some(c => {
        const email = c.email?.toLowerCase() || '';
        const localPart = email.split('@')[0] || '';
        const domain = email.split('@')[1] || '';
        
        // Filter out legal/compliance emails and .gov/.edu domains
        const isLegalEmail = /legal|privacy|compliance|counsel|attorney|law|dmca/.test(localPart);
        const isGovEdu = /\.gov$|\.edu$|\.mil$/.test(domain);
        
        return !isLegalEmail && !isGovEdu;
      });

      if (hasCompanyName && hasIcebreaker && hasValidEmail) {
        prospectsToPromote.push({
          id: prospect.id,
          domain: prospect.reports?.domain,
          hasCompanyName,
          hasIcebreaker,
          emailCount: contacts?.length || 0
        });
      }
    }

    console.log(`✅ Found ${prospectsToPromote.length} prospects ready for promotion`);

    if (prospectsToPromote.length === 0) {
      return new Response(JSON.stringify({
        message: 'No stuck prospects found',
        promoted: 0,
        details: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch promote prospects
    const promotedIds = [];
    const errors = [];

    for (const prospect of prospectsToPromote) {
      try {
        const { error: updateError } = await supabase
          .from('prospect_activities')
          .update({
            status: 'enriched',
            enrichment_locked_at: null,
            enrichment_locked_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.id);

        if (updateError) {
          console.error(`❌ Error promoting ${prospect.domain}:`, updateError);
          errors.push({ domain: prospect.domain, error: updateError.message });
        } else {
          promotedIds.push(prospect.id);
          
          // Log audit trail
          await supabase
            .from('audit_logs')
            .insert({
              table_name: 'prospect_activities',
              record_id: prospect.id,
              action_type: 'UPDATE',
              field_name: 'status',
              old_value: 'enriching',
              new_value: 'enriched',
              business_context: `Cleanup: Auto-promoted stuck prospect with all criteria (${prospect.domain})`,
              changed_by: user.id
            });

          console.log(`✅ Promoted ${prospect.domain} to enriched`);
        }
      } catch (err) {
        console.error(`❌ Exception promoting ${prospect.domain}:`, err);
        errors.push({ domain: prospect.domain, error: String(err) });
      }
    }

    console.log(`🎉 Successfully promoted ${promotedIds.length} prospects`);
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors encountered`);
    }

    return new Response(JSON.stringify({
      message: `Successfully promoted ${promotedIds.length} prospects to enriched`,
      promoted: promotedIds.length,
      total_found: prospectsToPromote.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in promote-complete-prospects:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      promoted: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
