import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables are not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { 
      paymentIntentId, 
      amount, 
      currency, 
      userId, 
      status 
    } = await req.json();

    if (!paymentIntentId || !amount || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate token amount (1 EUR = 2/3 DRONE token)
    const tokenAmount = Math.floor(amount / 150); // amount is in cents

    // Record the payment in the database
    const { data, error } = await supabase.rpc("update_user_investment", {
      p_user_id: userId,
      p_amount: amount / 100, // Convert cents to EUR
      p_token_amount: tokenAmount
    });

    if (error) {
      console.error("Error updating user investment:", error);
      return new Response(
        JSON.stringify({ error: "Failed to record payment" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record the payment in wallet_transactions
    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        type: "deposit",
        amount: amount / 100, // Convert cents to EUR
        token_type: "EUR",
        status: "completed",
        description: "Investment payment via Stripe",
        transaction_hash: paymentIntentId
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Continue anyway since the investment was already recorded
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Payment recorded successfully",
        data
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error recording payment:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to record payment" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});