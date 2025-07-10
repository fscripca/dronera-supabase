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
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Handle file upload and contract linking
    if (req.method === "POST" && path === "upload") {
      // Parse request body
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const contractId = formData.get("contractId") as string;
      const fileName = formData.get("fileName") as string || file.name;
      const fileType = file.type;
      
      // Validate required fields
      if (!file || !contractId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "File and contract ID are required" 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Generate a unique file path
      const timestamp = Date.now();
      const fileExt = fileName.split('.').pop();
      const uniqueFileName = `${contractId}_${timestamp}.${fileExt}`;
      const filePath = `contracts/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from("documents")
        .upload(filePath, file, {
          contentType: fileType,
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to upload file: ${uploadError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabaseClient.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Update contract agreement with file path
      const { data: contractData, error: contractError } = await supabaseClient
        .from("contract_agreements")
        .update({
          file_path: filePath,
          file_url: publicUrl,
          updated_at: new Date().toISOString(),
          metadata: {
            ...formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : {},
            file_name: fileName,
            file_type: fileType,
            file_size: file.size,
            upload_date: new Date().toISOString()
          }
        })
        .eq("id", contractId)
        .select()
        .single();

      if (contractError) {
        console.error("Contract update error:", contractError);
        
        // Try to delete the uploaded file if contract update fails
        await supabaseClient.storage
          .from("documents")
          .remove([filePath]);
          
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to update contract: ${contractError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log the successful upload
      await supabaseClient.rpc("log_admin_audit_action", {
        p_admin_id: "system",
        p_action: "CONTRACT_DOCUMENT_UPLOAD",
        p_details: `Uploaded document for contract ${contractId}: ${fileName}`
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            filePath,
            publicUrl,
            contract: contractData
          },
          message: "Contract document uploaded successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle contract download
    if (req.method === "GET" && path === "download") {
      const contractId = url.searchParams.get("contractId");
      const userId = url.searchParams.get("userId");
      
      if (!contractId) {
        return new Response(
          JSON.stringify({ success: false, error: "Contract ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get contract details
      const { data: contract, error: contractError } = await supabaseClient
        .from("contract_agreements")
        .select("file_path, title, agreement_type, user_id")
        .eq("id", contractId)
        .single();

      if (contractError) {
        console.error("Contract fetch error:", contractError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to fetch contract: ${contractError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user has access to this contract
      if (userId && contract.user_id !== userId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "You do not have permission to access this contract" 
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!contract.file_path) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "No document attached to this contract" 
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create a signed URL for the file
      const { data: signedUrl, error: signedUrlError } = await supabaseClient.storage
        .from("documents")
        .createSignedUrl(contract.file_path, 60); // 60 seconds expiry

      if (signedUrlError) {
        console.error("Signed URL error:", signedUrlError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to generate download link: ${signedUrlError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log the download
      if (userId) {
        await supabaseClient.from("document_access_logs").insert({
          document_id: contractId,
          user_id: userId,
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown"
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            signedUrl: signedUrl.signedUrl,
            fileName: contract.title,
            contractType: contract.agreement_type
          },
          message: "Download link generated successfully"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle contract listing
    if (req.method === "GET" && path === "list") {
      const userId = url.searchParams.get("userId");
      
      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: "User ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get user's contracts
      const { data: contracts, error: contractsError } = await supabaseClient
        .from("contract_agreements")
        .select(`
          id,
          title,
          agreement_type,
          status,
          is_signed,
          signed_date,
          effective_date,
          expiry_date,
          file_path,
          created_at,
          updated_at,
          metadata
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (contractsError) {
        console.error("Contracts fetch error:", contractsError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to fetch contracts: ${contractsError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: contracts,
          message: "Contracts retrieved successfully"
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
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});