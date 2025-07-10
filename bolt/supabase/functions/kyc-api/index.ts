import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Generic KYC service configuration
const KYC_PROVIDER = "generic";

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

    // Handle KYC submission with Didit integration
    if (req.method === "POST" && (path === "submit" || path === "start")) {
      const { firstName, lastName, email, dateOfBirth, country, documentType, documentNumber, phoneNumber, walletAddress } = await req.json();

      // Validate required fields
      if (!firstName || !lastName || !email || !dateOfBirth || !country || !documentType || !documentNumber) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields for KYC submission" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        // Create verification session with Didit
        // Now using a generic approach instead of Didit
        const userId = walletAddress || `user-${Date.now()}`;
        const sessionId = `kyc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const verificationUrl = `https://kyc.dronera.com/verify/${sessionId}`;
        
        // Store the session information in Supabase
        const { error } = await supabaseClient
          .from("kyc_verifications")
          .insert({
            user_id: userId,
            email: email,
            session_id: sessionId,
            verification_url: verificationUrl,
            status: "pending",
            external_provider: KYC_PROVIDER,
            external_session_id: sessionId,
            verification_data: {
              firstName,
              lastName,
              dateOfBirth,
              country,
              documentType,
              documentNumber,
              phoneNumber,
              submissionDate: new Date().toISOString()
            }
          });
        
        if (error) {
          console.error("Error creating KYC verification record:", error);
          return new Response(
            JSON.stringify({ success: false, message: "Failed to create KYC verification" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "KYC verification initiated successfully",
            sessionId: sessionId,
            verificationUrl: verificationUrl,
            status: "pending"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error creating KYC verification session:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to create verification session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle KYC status check
    if (req.method === "POST" && path === "status") {
      const { email, sessionId } = await req.json();

      if (!email && !sessionId) {
        return new Response(
          JSON.stringify({ status: "error", message: "Email or session ID required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        // First, get the KYC record from our database
        let query = supabaseClient
          .from("kyc_verifications")
          .select("*");

        if (sessionId) {
          query = query.eq("session_id", sessionId);
        } else {
          query = query.eq("email", email).order("created_at", { ascending: false }).limit(1);
        }

        const { data, error } = await query.single();

        if (error) {
          return new Response(
            JSON.stringify({ 
              status: "success", 
              kycStatus: "not_started",
              message: "No KYC record found" 
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // If we have a session ID, check the status with Didit
        if (data.session_id) {
          // Return the current status from our database
          // In a real implementation, this would check with the KYC provider
          return new Response(
            JSON.stringify({ 
              status: "success", 
              kycStatus: data.status,
              session: data
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            status: "success", 
            kycStatus: data.status,
            session: data
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error checking KYC status:", error);
        return new Response(
          JSON.stringify({ status: "error", message: "Failed to check KYC status" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle KYC status update
    if (req.method === "POST" && path === "update") {
      const { sessionId, status, verificationData } = await req.json();

      if (!sessionId || !status) {
        return new Response(
          JSON.stringify({ error: "Session ID and status required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        // Update status in our database
        const { data, error } = await supabaseClient
          .rpc("update_kyc_status", {
            p_session_id: sessionId,
            p_status: status,
            p_verification_data: verificationData || {}
          });

        if (error) {
          console.error("Error updating KYC status:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update KYC status" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            status: "success", 
            kycStatus: data.status,
            session: data
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error updating KYC status:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update KYC status" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle retrieving session results
    if (req.method === "GET" && path === "results") {
      const sessionId = url.searchParams.get("sessionId");
      
      if (!sessionId) {
        return new Response(
          JSON.stringify({ success: false, message: "Session ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      try {
        // In a real implementation, this would retrieve results from the KYC provider
        // For now, we'll return a mock response
        const results = {
          status: 'pending',
          riskScore: 50,
          documents: [],
          biometrics: {
            faceMatch: { confidence: 0, verified: false },
            livenessCheck: { score: 0, passed: false }
          },
          complianceChecks: {
            amlScreening: { passed: false, riskLevel: 'low', matches: [] },
            sanctionsCheck: { passed: false, matches: [] },
            pepCheck: { passed: false, matches: [] }
          }
        };
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            results 
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error retrieving KYC session results:", error);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to retrieve session results", error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
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