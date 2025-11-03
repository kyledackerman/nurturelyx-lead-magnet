import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { sendEmail } from "../_shared/emailService.ts";
import { generateCreditPurchaseConfirmationEmail } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Credit packages mapping
const CREDIT_PACKAGES: Record<string, number> = {
  "price_500_credits": 500,
  "price_1000_credits": 1000,
  "price_2500_credits": 2500,
  "price_5000_credits": 5000,
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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_CREDITS");
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`📨 Webhook event: ${event.type}`);

    // Handle successful one-time payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only process payment mode (not subscription)
      if (session.mode !== "payment") {
        console.log("⊘ Skipping non-payment checkout session");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = session.customer as string;
      const paymentIntentId = session.payment_intent as string;
      const amountPaid = (session.amount_total || 0) / 100; // Convert cents to dollars

      // Get line items to determine credits purchased
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      const creditsPurchased = priceId ? CREDIT_PACKAGES[priceId] || 500 : 500;

      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      const customerEmail =
        typeof customer !== "string" && !customer.deleted ? customer.email : null;
      const customerName =
        typeof customer !== "string" && !customer.deleted ? customer.name : null;

      if (!customerEmail) {
        throw new Error("Customer email not found");
      }

      console.log(`💰 Processing credit purchase for ${customerEmail}`);
      console.log(`💳 Credits: ${creditsPurchased}, Amount: $${amountPaid}`);

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

      // Get current subscriber profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("subscriber_profiles")
        .select("credit_balance")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const newBalance = profile.credit_balance + creditsPurchased;

      // Update credit balance
      const { error: updateError } = await supabaseAdmin
        .from("subscriber_profiles")
        .update({
          credit_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      console.log(`✅ Updated balance for ${customerEmail}: ${newBalance} credits`);

      // Record the purchase
      const { error: purchaseError } = await supabaseAdmin
        .from("credit_purchases")
        .insert({
          user_id: user.id,
          credits_purchased: creditsPurchased,
          amount_paid: amountPaid,
          stripe_payment_id: paymentIntentId,
        });

      if (purchaseError) throw purchaseError;
      console.log(`📝 Recorded purchase in database`);

      // Send confirmation email
      await sendEmail({
        to: customerEmail,
        subject: "💳 Credit Purchase Confirmed - Nurturely",
        html: generateCreditPurchaseConfirmationEmail(
          customerName || customerEmail,
          creditsPurchased,
          amountPaid,
          newBalance
        ),
      });
      console.log(`📧 Sent confirmation email to ${customerEmail}`);
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
