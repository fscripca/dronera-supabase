
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, url } = req
    const urlPath = new URL(url).pathname

    if (method === 'POST' && urlPath === '/kyc-webhook') {
      // Handle generic KYC webhook
      const payload = await req.json()
      
      // Process the webhook
      const { data, error } = await supabaseClient
        .rpc('handle_kyc_webhook', {
          p_session_id: payload.session_id,
          p_status: payload.status,
          p_verification_data: payload.verification_data || {}
        })

      if (error) {
        console.error('Error processing webhook:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to process webhook' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'POST' && urlPath === '/kyc-status') {
      // Handle KYC status check
      const { email, sessionId } = await req.json()

      if (!email && !sessionId) {
        return new Response(
          JSON.stringify({ error: 'Email or session ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      let query = supabaseClient
        .from('kyc_verifications')
        .select('*')

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      } else {
        query = query.eq('email', email).order('created_at', { ascending: false }).limit(1)
      }

      const { data, error } = await query.single()

      if (error) {
        return new Response(
          JSON.stringify({ 
            status: 'success', 
            kycStatus: 'unverified',
            message: 'No KYC record found' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          status: 'success', 
          kycStatus: data.status,
          session: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'POST' && urlPath === '/kyc-update') {
      // Handle KYC status update
      const { sessionId, status, verificationData } = await req.json()

      if (!sessionId || !status) {
        return new Response(
          JSON.stringify({ error: 'Session ID and status required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { data, error } = await supabaseClient
        .rpc('update_kyc_status', {
          p_session_id: sessionId,
          p_status: status,
          p_verification_data: verificationData || {}
        })

      if (error) {
        console.error('Error updating KYC status:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update KYC status' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          status: 'success', 
          kycStatus: data.status,
          session: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})