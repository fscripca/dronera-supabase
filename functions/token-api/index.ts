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

    // Get token balance
    if (req.method === "GET" && path === "balance") {
      const walletAddress = url.searchParams.get("address");
      const contractAddress = url.searchParams.get("contract");

      if (!walletAddress) {
        return new Response(
          JSON.stringify({ success: false, message: "Wallet address is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get token balance from database
      const { data, error } = await supabaseClient
        .from("token_holders")
        .select("balance, last_updated")
        .eq("wallet_address", walletAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching token balance:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to fetch token balance" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // If no balance found, return 0
      if (!data) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            balance: 0,
            lastUpdated: new Date().toISOString()
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          balance: data.balance,
          lastUpdated: data.last_updated
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record token transaction
    if (req.method === "POST" && path === "transaction") {
      const { 
        contractId, 
        transactionHash, 
        blockNumber, 
        fromAddress, 
        toAddress, 
        amount, 
        transactionType,
        gasPrice,
        gasUsed,
        metadata
      } = await req.json();

      // Validate required fields
      if (!contractId || !transactionHash || !blockNumber || !fromAddress || !toAddress || !amount || !transactionType) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Record transaction
      const { data, error } = await supabaseClient.rpc(
        "record_token_transaction",
        {
          p_contract_id: contractId,
          p_transaction_hash: transactionHash,
          p_block_number: blockNumber,
          p_from_address: fromAddress,
          p_to_address: toAddress,
          p_amount: amount,
          p_transaction_type: transactionType,
          p_gas_price: gasPrice,
          p_gas_used: gasUsed,
          p_metadata: metadata || {}
        }
      );

      if (error) {
        console.error("Error recording token transaction:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to record transaction" }),
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
          message: "Transaction recorded successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user token data
    if (req.method === "GET" && path === "user") {
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

      // Get user token data
      const { data, error } = await supabaseClient.rpc(
        "get_user_token_balance",
        { p_user_id: userId }
      );

      if (error) {
        console.error("Error fetching user token data:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to fetch user token data" }),
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