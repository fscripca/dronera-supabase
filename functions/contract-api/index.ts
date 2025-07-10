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

    // Get user contracts
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

      // Get user contracts
      const { data, error } = await supabaseClient.rpc(
        "get_user_contracts",
        { p_user_id: userId }
      );

      if (error) {
        console.error("Error fetching user contracts:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to fetch user contracts" }),
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

    // Create contract agreement
    if (req.method === "POST" && path === "create") {
      const { userId, templateId, title, agreementType, metadata } = await req.json();

      // Validate required fields
      if (!userId || !templateId || !title || !agreementType) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create contract agreement
      const { data, error } = await supabaseClient.rpc(
        "create_contract_agreement",
        {
          p_user_id: userId,
          p_template_id: templateId,
          p_title: title,
          p_agreement_type: agreementType,
          p_metadata: metadata || {}
        }
      );

      if (error) {
        console.error("Error creating contract agreement:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to create contract agreement" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          agreementId: data,
          message: "Contract agreement created successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sign contract
    if (req.method === "POST" && path === "sign") {
      const { agreementId, userId, signatureData, ipAddress, userAgent } = await req.json();

      // Validate required fields
      if (!agreementId || !userId || !signatureData) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Sign contract
      const { data, error } = await supabaseClient.rpc(
        "sign_contract",
        {
          p_agreement_id: agreementId,
          p_user_id: userId,
          p_signature_data: signatureData,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        }
      );

      if (error) {
        console.error("Error signing contract:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to sign contract" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Contract signed successfully"
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