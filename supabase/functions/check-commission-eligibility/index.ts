import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/emailService.ts";
import { generateCommissionEligibleEmail } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking for commissions eligible for payout...');

    // Calculate 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Find pending platform fee commissions where first lead was delivered 60+ days ago
    const { data: eligibleCommissions, error: fetchError } = await serviceClient
      .from('commissions')
      .select(`
        *,
        ambassador_profiles!inner(
          email,
          full_name,
          pending_commission,
          eligible_commission
        )
      `)
      .eq('commission_type', 'platform_fee')
      .eq('status', 'pending')
      .not('first_lead_delivered_at', 'is', null)
      .lte('first_lead_delivered_at', sixtyDaysAgo.toISOString());

    if (fetchError) {
      console.error('Error fetching eligible commissions:', fetchError);
      throw fetchError;
    }

    console.log(`✅ Found ${eligibleCommissions?.length || 0} commissions eligible for payout`);

    if (!eligibleCommissions || eligibleCommissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No commissions eligible for payout',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    let processed = 0;
    let errors = [];

    // Process each eligible commission
    for (const commission of eligibleCommissions) {
      try {
        const now = new Date().toISOString();

        // Update commission status to eligible
        const { error: updateError } = await serviceClient
          .from('commissions')
          .update({
            status: 'eligible',
            eligible_for_payout_at: now,
          })
          .eq('id', commission.id);

        if (updateError) {
          console.error(`Error updating commission ${commission.id}:`, updateError);
          errors.push({ commissionId: commission.id, error: updateError.message });
          continue;
        }

        // Update ambassador profile balances
        const newPending = commission.ambassador_profiles.pending_commission - commission.commission_amount;
        const newEligible = commission.ambassador_profiles.eligible_commission + commission.commission_amount;

        const { error: profileError } = await serviceClient
          .from('ambassador_profiles')
          .update({
            pending_commission: Math.max(0, newPending),
            eligible_commission: newEligible,
            updated_at: now,
          })
          .eq('user_id', commission.ambassador_id);

        if (profileError) {
          console.error(`Error updating ambassador profile for ${commission.ambassador_id}:`, profileError);
          errors.push({ commissionId: commission.id, error: profileError.message });
          continue;
        }

        // Send email notification
        try {
          await sendEmail({
            to: commission.ambassador_profiles.email,
            subject: 'Commission Now Eligible for Payout',
            html: generateCommissionEligibleEmail(
              commission.ambassador_profiles.full_name,
              commission.commission_amount,
              commission.domain
            ),
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${commission.ambassador_profiles.email}:`, emailError);
          // Don't fail the whole process if email fails
        }

        processed++;
        console.log(`✅ Processed commission ${commission.id} for ${commission.domain} ($${commission.commission_amount})`);

      } catch (error) {
        console.error(`Error processing commission ${commission.id}:`, error);
        errors.push({ commissionId: commission.id, error: error.message });
      }
    }

    console.log(`🎉 Completed: ${processed} commissions marked as eligible`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        total: eligibleCommissions.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Fatal error in check-commission-eligibility:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
