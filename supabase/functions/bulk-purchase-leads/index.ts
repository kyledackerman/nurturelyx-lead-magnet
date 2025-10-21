import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { generateBulkPurchaseConfirmationEmail } from "../_shared/emailTemplates.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify user is an ambassador
    const { data: isAmbassador } = await supabase.rpc('is_ambassador', { user_uuid: user.id });
    if (!isAmbassador) {
      throw new Error("User is not an active ambassador");
    }

    const { prospect_activity_ids } = await req.json();

    if (!Array.isArray(prospect_activity_ids) || prospect_activity_ids.length === 0) {
      throw new Error("prospect_activity_ids must be a non-empty array");
    }

    console.log(`Bulk purchase request: ${prospect_activity_ids.length} leads by ${user.email}`);

    // Fetch and validate all prospects
    const { data: prospects, error: fetchError } = await supabase
      .from('prospect_activities')
      .select(`
        id,
        report_id,
        purchased_by_ambassador,
        assigned_to,
        lead_source,
        reports!inner(domain, extracted_company_name)
      `)
      .in('id', prospect_activity_ids);

    if (fetchError) throw fetchError;

    // Filter out invalid prospects
    const validProspects = prospects?.filter(p => 
      p.purchased_by_ambassador === null &&
      p.assigned_to === null &&
      p.lead_source !== 'warm_inbound'
    ) || [];

    const invalidCount = prospect_activity_ids.length - validProspects.length;
    
    if (validProspects.length === 0) {
      throw new Error("No valid leads available for purchase");
    }

    const LEAD_PRICE = 0.05;
    const totalCost = validProspects.length * LEAD_PRICE;
    const purchaseTime = new Date().toISOString();

    // Get current credit balance
    const { data: profileData } = await supabase
      .from('ambassador_profiles')
      .select('credit_balance')
      .eq('user_id', user.id)
      .single();
    
    const currentBalance = profileData?.credit_balance || 0;
    const newBalance = Number(currentBalance) + totalCost;

    // Insert lead purchases
    const leadPurchases = validProspects.map(p => ({
      ambassador_id: user.id,
      prospect_activity_id: p.id,
      report_id: p.report_id,
      domain: p.reports.domain,
      purchase_price: LEAD_PRICE,
      purchased_at: purchaseTime,
      source: 'marketplace',
      payment_method: 'credit',
      payment_status: 'pending_settlement'
    }));

    const { error: insertError } = await supabase
      .from('lead_purchases')
      .insert(leadPurchases);

    if (insertError) throw insertError;

    // Update prospect activities
    const { error: updateError } = await supabase
      .from('prospect_activities')
      .update({
        purchased_by_ambassador: user.id,
        purchased_at: purchaseTime,
        assigned_to: user.id,
        assigned_by: user.id,
        assigned_at: purchaseTime,
        updated_at: purchaseTime
      })
      .in('id', validProspects.map(p => p.id));

    if (updateError) throw updateError;

    // Create credit transactions
    const creditTransactions = validProspects.map(p => ({
      ambassador_id: user.id,
      transaction_type: 'charge',
      amount: LEAD_PRICE,
      balance_after: currentBalance + (LEAD_PRICE * (validProspects.indexOf(p) + 1)),
      description: `Bulk purchase: ${p.reports.domain}`,
      related_purchase_id: p.id
    }));

    const { error: creditError } = await supabase
      .from('credit_transactions')
      .insert(creditTransactions);

    if (creditError) throw creditError;

    // Update ambassador profile with new credit balance
    const { error: profileError } = await supabase
      .from('ambassador_profiles')
      .update({
        total_domains_purchased: supabase.raw(`total_domains_purchased + ${validProspects.length}`),
        total_spent_on_leads: supabase.raw(`total_spent_on_leads + ${totalCost}`),
        active_domains_count: supabase.raw(`active_domains_count + ${validProspects.length}`),
        credit_balance: newBalance,
        updated_at: purchaseTime
      })
      .eq('user_id', user.id);

    if (profileError) throw profileError;

    // Log to audit trail
    await supabase.from('audit_logs').insert([
      {
        table_name: 'lead_purchases',
        record_id: user.id,
        action_type: 'INSERT',
        field_name: 'bulk_purchase',
        new_value: `${validProspects.length} leads`,
        business_context: `Bulk purchased ${validProspects.length} leads for $${totalCost.toFixed(2)} (credit)`,
        changed_by: user.id
      },
      {
        table_name: 'ambassador_profiles',
        record_id: user.id,
        action_type: 'UPDATE',
        field_name: 'credit_balance',
        old_value: currentBalance.toString(),
        new_value: newBalance.toString(),
        business_context: `Credit charged for bulk purchase: ${validProspects.length} leads`,
        changed_by: user.id
      }
    ]);

    // Send confirmation email
    const domains = validProspects.map(p => p.reports.domain);
    const emailHtml = generateBulkPurchaseConfirmationEmail(domains, totalCost, validProspects.length, newBalance);
    
    // Use Mailgun to send email (optional - only if Mailgun is configured)
    if (Deno.env.get("MAILGUN_API_KEY")) {
      try {
        const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN") || "";
        const mailgunRegion = Deno.env.get("MAILGUN_REGION") || "us";
        const mailgunUrl = mailgunRegion === "eu" 
          ? `https://api.eu.mailgun.net/v3/${mailgunDomain}/messages`
          : `https://api.mailgun.net/v3/${mailgunDomain}/messages`;

        const formData = new FormData();
        formData.append("from", `Ambassador Program <noreply@${mailgunDomain}>`);
        formData.append("to", user.email!);
        formData.append("subject", `Lead Purchase Confirmation - ${validProspects.length} Leads`);
        formData.append("html", emailHtml);

        await fetch(mailgunUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`api:${Deno.env.get("MAILGUN_API_KEY")}`)}`,
          },
          body: formData,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the purchase if email fails
      }
    }

    console.log(`Successfully purchased ${validProspects.length} leads for ${user.email}`);

    return new Response(
      JSON.stringify({
        success: true,
        purchased: validProspects.length,
        failed: invalidCount,
        totalCost: totalCost,
        domains: domains,
        message: invalidCount > 0 
          ? `Purchased ${validProspects.length} leads. ${invalidCount} were no longer available.`
          : `Successfully purchased ${validProspects.length} leads for $${totalCost.toFixed(2)}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in bulk-purchase-leads:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
