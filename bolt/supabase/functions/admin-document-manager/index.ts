import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

interface DocumentData {
  id?: string;
  title: string;
  description?: string;
  category: 'Financial' | 'Legal' | 'Reports' | 'Other';
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'Active' | 'Inactive';
  visibility: 'all' | 'accredited' | 'institutional';
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('Admin Document Manager - Processing request');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing',
      keyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 20) + '...' : 'missing'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error - missing environment variables',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    console.log('Supabase client initialized successfully');

    // Handle GET requests (fetch documents)
    if (req.method === 'GET') {
      console.log('Processing GET request for documents');
      
      try {
        const { data, error } = await supabaseClient.rpc('get_admin_documents');
        
        if (error) {
          console.error('Database RPC error:', error);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Database error: ${error.message}`,
              details: error,
              timestamp: new Date().toISOString()
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Parse the JSON result from the RPC function
        const documents = Array.isArray(data) ? data : [];
        console.log(`Documents fetched successfully: ${documents.length} documents`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: documents,
            action: 'get',
            timestamp: new Date().toISOString()
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (dbError) {
        console.error('Database operation error during GET:', dbError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Database operation failed: ${dbError.message}`,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Parse request body for POST/PUT/DELETE requests
    let requestData;
    try {
      const bodyText = await req.text();
      console.log('Request body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error('Empty request body');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Empty request body',
            timestamp: new Date().toISOString()
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      requestData = JSON.parse(bodyText);
      console.log('Request data parsed successfully:', { 
        action: requestData.action,
        hasDocument: !!requestData.document,
        hasId: !!requestData.id
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action, document, id } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing action parameter',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing action: ${action}`);

    // Log admin action for audit purposes
    const logAction = async (adminId: string, actionType: string, details: string) => {
      try {
        console.log('Logging admin action:', { adminId, actionType, details });
        
        const { error } = await supabaseClient
          .from('admin_audit_logs')
          .insert({
            admin_id: adminId,
            action: actionType,
            details: details,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'admin-document-manager'
          });
        
        if (error) {
          console.error('Failed to log admin action:', error);
        } else {
          console.log('Admin action logged successfully');
        }
      } catch (logError) {
        console.error('Error logging admin action:', logError);
      }
    };

    // Handle different actions using RPC functions
    let result;
    
    try {
      switch (action.toLowerCase()) {
        case 'create':
          console.log('Creating new document via RPC');
          
          if (!document) {
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'Missing document data for create action',
                timestamp: new Date().toISOString()
              }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Validate required fields
          if (!document.title || !document.category || !document.file_path) {
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'Missing required document fields: title, category, file_path',
                timestamp: new Date().toISOString()
              }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          console.log('Calling create_admin_document RPC:', { 
            title: document.title, 
            category: document.category 
          });

          const { data: createData, error: createError } = await supabaseClient.rpc('create_admin_document', {
            p_title: document.title,
            p_description: document.description || '',
            p_category: document.category,
            p_file_path: document.file_path,
            p_file_size: parseInt(document.file_size) || 0,
            p_file_type: document.file_type || 'application/octet-stream',
            p_status: document.status || 'Active',
            p_visibility: document.visibility || 'all',
            p_created_by: document.created_by || 'admin'
          });
          
          if (createError) {
            console.error('Create document RPC error:', createError);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: `Failed to create document: ${createError.message}`,
                details: createError,
                timestamp: new Date().toISOString()
              }),
              { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          result = { data: createData };
          console.log('Document created successfully via RPC:', createData?.id);
          await logAction(document.created_by || 'admin', 'CREATE_DOCUMENT', `Created document: ${document.title}`);
          break;

        case 'update':
          console.log('Updating document via RPC');
          
          if (!document || !document.id) {
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'Missing document data or ID for update action',
                timestamp: new Date().toISOString()
              }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          console.log('Calling update_admin_document RPC:', { 
            id: document.id, 
            title: document.title 
          });

          const { data: updateData, error: updateError } = await supabaseClient.rpc('update_admin_document', {
            p_id: document.id,
            p_title: document.title,
            p_description: document.description || '',
            p_category: document.category,
            p_file_path: document.file_path,
            p_file_size: parseInt(document.file_size) || 0,
            p_file_type: document.file_type || 'application/octet-stream',
            p_status: document.status || 'Active',
            p_visibility: document.visibility || 'all'
          });
          
          if (updateError) {
            console.error('Update document RPC error:', updateError);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: `Failed to update document: ${updateError.message}`,
                details: updateError,
                timestamp: new Date().toISOString()
              }),
              { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          result = { data: updateData };
          console.log('Document updated successfully via RPC:', updateData?.id);
          await logAction(document.created_by || 'admin', 'UPDATE_DOCUMENT', `Updated document: ${document.title}`);
          break;

        case 'delete':
          console.log('Deleting document via RPC');
          
          const deleteId = id || document?.id;
          if (!deleteId) {
            return new Response(
              JSON.stringify({ 
                success: false,
                error: 'Missing document ID for delete action',
                timestamp: new Date().toISOString()
              }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          console.log('Calling delete_admin_document RPC:', { id: deleteId });

          const { data: deleteData, error: deleteError } = await supabaseClient.rpc('delete_admin_document', {
            p_id: deleteId
          });
          
          if (deleteError) {
            console.error('Delete document RPC error:', deleteError);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: `Failed to delete document: ${deleteError.message}`,
                details: deleteError,
                timestamp: new Date().toISOString()
              }),
              { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          result = { data: deleteData };
          console.log('Document deleted successfully via RPC:', deleteId);
          const docTitle = deleteData?.title || 'Unknown';
          await logAction('admin', 'DELETE_DOCUMENT', `Deleted document: ${docTitle} (ID: ${deleteId})`);
          break;

        case 'get':
          console.log('Fetching all documents via RPC');
          
          const { data: getAllData, error: getAllError } = await supabaseClient.rpc('get_admin_documents');
          
          if (getAllError) {
            console.error('Get documents RPC error:', getAllError);
            return new Response(
              JSON.stringify({ 
                success: false,
                error: `Failed to fetch documents: ${getAllError.message}`,
                details: getAllError,
                timestamp: new Date().toISOString()
              }),
              { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          const documents = Array.isArray(getAllData) ? getAllData : [];
          result = { data: documents };
          console.log(`Documents fetched successfully via RPC: ${documents.length} documents`);
          break;

        default:
          console.error('Invalid action:', action);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Invalid action: ${action}`,
              details: 'Valid actions are: create, update, delete, get',
              timestamp: new Date().toISOString()
            }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }
    } catch (dbError) {
      console.error('Database RPC operation error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Database RPC operation failed: ${dbError.message}`,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('RPC operation completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result.data,
        action: action,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});