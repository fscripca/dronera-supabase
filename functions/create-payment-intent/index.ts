import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'npm:stripe@13.2.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // ✅ Check secrets
  if (!stripeSecretKey || stripeSecretKey.startsWith('pk_')) {
    console.error("❌ STRIPE_SECRET_KEY is missing or invalid");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: Invalid Stripe secret key" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ SUPABASE_URL or SERVICE_ROLE_KEY is missing");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: Supabase keys missing" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const { amount, user_id } = await req.json();

    if (!amount || amount <= 0 || !user_id) {
      return new Response(
        JSON.stringify({ error: "Invalid request: amount and user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });

    // ✅ Example: Save payment record to Supabase (optional)
    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: user_id,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }),
    });

    if (!supabaseRes.ok) {
      const supabaseError = await supabaseRes.text();
      console.error("❌ Failed to insert into Supabase:", supabaseError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create payment intent" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
