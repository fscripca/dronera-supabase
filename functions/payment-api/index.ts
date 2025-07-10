import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get user bank accounts
    if (req.method === "GET" && path === "accounts") {
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, message: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get user bank accounts
      const { data, error } = await supabaseClient.rpc(
        "get_user_bank_accounts",
        { p_user_id: userId }
      );

      if (error) {
        console.error("Error fetching user bank accounts:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to fetch user bank accounts" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify(data),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add bank account
    if (req.method === "POST" && path === "account") {
      const { 
        userId, 
        accountName, 
        accountNumber, 
        bankName, 
        bankCode, 
        iban, 
        swiftBic, 
        accountType, 
        currency, 
        isPrimary 
      } = await req.json();

      // Validate required fields
      if (!userId || !accountName || !accountNumber || !bankName) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Add bank account
      const { data, error } = await supabaseClient.rpc(
        "add_bank_account",
        {
          p_user_id: userId,
          p_account_name: accountName,
          p_account_number: accountNumber,
          p_bank_name: bankName,
          p_bank_code: bankCode,
          p_iban: iban,
          p_swift_bic: swiftBic,
          p_account_type: accountType || "personal",
          p_currency: currency || "EUR",
          p_is_primary: isPrimary || false
        }
      );

      if (error) {
        console.error("Error adding bank account:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to add bank account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          accountId: data,
          message: "Bank account added successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process bank transaction
    if (req.method === "POST" && path === "transaction") {
      const { 
        userId, 
        bankAccountId, 
        transactionType, 
        amount, 
        currency, 
        referenceNumber, 
        description 
      } = await req.json();

      // Validate required fields
      if (!userId || !bankAccountId || !transactionType || !amount) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Process bank transaction
      const { data, error } = await supabaseClient.rpc(
        "process_bank_transaction",
        {
          p_user_id: userId,
          p_bank_account_id: bankAccountId,
          p_transaction_type: transactionType,
          p_amount: amount,
          p_currency: currency || "EUR",
          p_reference_number: referenceNumber,
          p_description: description
        }
      );

      if (error) {
        console.error("Error processing bank transaction:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to process bank transaction" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          transactionId: data,
          message: "Bank transaction processed successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});