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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting reconciliation of stuck enriching prospects...');

    // Get all prospects stuck in enriching status
    const { data: prospects, error: fetchError } = await supabaseClient
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        status,
        contact_count,
        icebreaker_text,
        enrichment_retry_count,
        enrichment_locked_at,
        enrichment_locked_by,
        reports!inner(
          domain,
          extracted_company_name
        )
      `)
      .eq('status', 'enriching')
      .lt('enrichment_retry_count', 3);

    if (fetchError) {
      console.error('Error fetching prospects:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${prospects?.length || 0} prospects in enriching status`);

    let promoted = 0;
    let movedToReview = 0;
    let legalEmailsOnly = 0;
    let noEmails = 0;
    let contactCountFixed = 0;

    // Pattern to detect legal/compliance emails
    const legalPattern = /^(legal|privacy|compliance|counsel|attorney|law|dmca|abuse|security)@/i;
    const govEduMilPattern = /\.(gov|edu|mil)$/i;

    for (const prospect of prospects || []) {
      // Get all contacts for this prospect
      const { data: contacts } = await supabaseClient
        .from('prospect_contacts')
        .select('email')
        .eq('prospect_activity_id', prospect.id);

      // Analyze emails
      const allEmails = contacts?.filter(c => c.email && c.email.trim() !== '') || [];
      const validSalesEmails = allEmails.filter(c => {
        const email = c.email.toLowerCase();
        const localPart = email.split('@')[0];
        const domain = email.split('@')[1];
        
        // Exclude legal/compliance emails
        if (legalPattern.test(email)) return false;
        if (govEduMilPattern.test(domain)) return false;
        
        return true;
      });

      const hasOnlyLegalEmails = allEmails.length > 0 && validSalesEmails.length === 0;
      const hasNoEmails = allEmails.length === 0;
      const hasValidEmails = validSalesEmails.length > 0;

      const hasCompanyName = prospect.reports?.extracted_company_name;
      const hasIcebreaker = prospect.icebreaker_text && prospect.icebreaker_text.trim() !== '';

      // Calculate correct contact count
      const correctContactCount = validSalesEmails.length;
      
      let newStatus = prospect.status;
      let businessContext = '';

      // Determine what to do with this prospect
      if (hasValidEmails && hasCompanyName && hasIcebreaker) {
        // Has all 3 criteria - promote to enriched
        newStatus = 'enriched';
        businessContext = `Auto-promoted: company name + valid emails (${validSalesEmails.length}) + icebreaker (${prospect.reports?.domain})`;
        promoted++;
      } else if (hasOnlyLegalEmails) {
        // Has emails but only legal/compliance ones
        newStatus = 'review';
        businessContext = `Only compliance/legal emails found (${allEmails.length} total) - needs manual review (${prospect.reports?.domain})`;
        legalEmailsOnly++;
        movedToReview++;
      } else if (hasNoEmails && prospect.contact_count > 0) {
        // Contact count says there are contacts but no emails
        newStatus = 'review';
        businessContext = `Contacts added (count: ${prospect.contact_count}) but no email addresses found - needs manual review (${prospect.reports?.domain})`;
        noEmails++;
        movedToReview++;
      }
      // If missing company name or icebreaker but has emails, leave in enriching (genuine enrichment needed)

      // Update prospect if status changed or contact count needs fixing
      if (newStatus !== prospect.status || correctContactCount !== prospect.contact_count) {
        const updates: any = {
          contact_count: correctContactCount,
          updated_at: new Date().toISOString()
        };

        if (newStatus !== prospect.status) {
          updates.status = newStatus;
          updates.enrichment_locked_at = null;
          updates.enrichment_locked_by = null;
        }

        const { error: updateError } = await supabaseClient
          .from('prospect_activities')
          .update(updates)
          .eq('id', prospect.id);

        if (updateError) {
          console.error(`Error updating prospect ${prospect.id}:`, updateError);
          continue;
        }

        if (correctContactCount !== prospect.contact_count) {
          contactCountFixed++;
        }

        // Log to audit trail if status changed
        if (newStatus !== prospect.status && businessContext) {
          await supabaseClient
            .from('audit_logs')
            .insert({
              table_name: 'prospect_activities',
              record_id: prospect.id,
              action_type: 'UPDATE',
              field_name: 'status',
              old_value: prospect.status,
              new_value: newStatus,
              business_context: businessContext,
              changed_by: user.id
            });

          console.log(`Updated ${prospect.reports?.domain}: ${prospect.status} → ${newStatus}`);
        }
      }
    }

    const summary = {
      total: prospects?.length || 0,
      promoted,
      movedToReview,
      legalEmailsOnly,
      noEmails,
      contactCountFixed
    };

    console.log('Reconciliation complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in reconcile-enriching-prospects:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
