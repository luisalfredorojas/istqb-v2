import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  transactionId: string
  clientTransactionId: string
}

interface PayphoneConfirmResponse {
  transactionStatus: number
  transactionId: string
  clientTransactionId: string
  amount: number
  // Add other fields as needed
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { transactionId, clientTransactionId }: PaymentRequest = await req.json()

    if (!transactionId || !clientTransactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Payphone configuration from environment
    const payphoneToken = Deno.env.get('PAYPHONE_TOKEN')
    const payphoneApiUrl = Deno.env.get('PAYPHONE_API_URL') || 'https://pay.payphonetodoesposible.com'

    if (!payphoneToken) {
      console.error('PAYPHONE_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify transaction with Payphone API
    console.log('Verifying transaction:', { transactionId, clientTransactionId })
    
    const confirmResponse = await fetch(`${payphoneApiUrl}/api/button/v2/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${payphoneToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: transactionId,
        clientTxId: clientTransactionId,
      }),
    })

    if (!confirmResponse.ok) {
      console.error('Payphone API error:', confirmResponse.status, await confirmResponse.text())
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const confirmData: PayphoneConfirmResponse = await confirmResponse.json()
    console.log('Payphone response:', confirmData)

    // Check if transaction was approved (status 3 = approved)
    if (confirmData.transactionStatus !== 3) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment was not approved',
          status: confirmData.transactionStatus 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user subscription to premium
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: 'premium',
        subscription_expires_at: null, // Lifetime access
      })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to activate subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Subscription activated for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Premium subscription activated',
        user: data[0],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
