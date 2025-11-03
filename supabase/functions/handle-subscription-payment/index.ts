import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { sendEmail } from "../_shared/emailService.ts";
import { generateSubscriptionWelcomeEmail } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Credit tiers based on subscription products
const CREDIT_TIERS: Record<string, { credits: number; name: string }> = {
  "prod_starter": { credits: 1000, name: "Starter" },
  "prod_growth": { credits: 3000, name: "Growth" },
  "prod_scale": { credits: 10000, name: "Scale" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`📨 Webhook event: ${event.type}`);

    // Only handle subscription payment success
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      // Only process if this is a subscription invoice (not one-time payment)
      if (!invoice.subscription) {
        console.log("⊘ Skipping non-subscription invoice");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;

      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      const customerEmail =
        typeof customer !== "string" && !customer.deleted ? customer.email : null;
      const customerName =
        typeof customer !== "string" && !customer.deleted ? customer.name : null;

      if (!customerEmail) {
        throw new Error("Customer email not found");
      }

      // Get subscription details to find the product
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const productId = subscription.items.data[0]?.price.product as string;
      const tierInfo = CREDIT_TIERS[productId] || { credits: 1000, name: "Starter" };

      console.log(`💰 Processing subscription payment for ${customerEmail}`);
      console.log(`📦 Product: ${productId}, Credits: ${tierInfo.credits}`);

      // Initialize Supabase client
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find user by email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) throw authError;

      const user = authData.users.find((u) => u.email === customerEmail);
      if (!user) {
        throw new Error(`User not found for email: ${customerEmail}`);
      }

      // Check if subscriber_profiles record exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from("subscriber_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProfile) {
        // Update existing profile - add credits and update subscription
        const { error: updateError } = await supabaseAdmin
          .from("subscriber_profiles")
          .update({
            credit_balance: existingProfile.credit_balance + tierInfo.credits,
            subscription_status: "active",
            stripe_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
        console.log(`✅ Updated profile for ${customerEmail}: +${tierInfo.credits} credits`);
      } else {
        // Create new subscriber_profiles record
        const { error: insertError } = await supabaseAdmin
          .from("subscriber_profiles")
          .insert({
            user_id: user.id,
            credit_balance: tierInfo.credits,
            subscription_status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            monthly_platform_fee: tierInfo.credits,
          });

        if (insertError) throw insertError;
        console.log(`✅ Created new profile for ${customerEmail}: ${tierInfo.credits} credits`);

        // Send welcome email for new subscribers
        await sendEmail({
          to: customerEmail,
          subject: "🎉 Welcome to Nurturely - Your Account is Ready!",
          html: generateSubscriptionWelcomeEmail(
            customerName || customerEmail,
            tierInfo.credits,
            tierInfo.name
          ),
        });
        console.log(`📧 Sent welcome email to ${customerEmail}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
