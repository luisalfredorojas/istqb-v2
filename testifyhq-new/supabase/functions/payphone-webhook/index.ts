import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PayphoneWebhookPayload {
  id: number // Transaction ID from Payphone
  clientTransactionId: string
  transactionStatus: number // 3 = approved
  amount: number
  currency?: string
  paymentMethod?: string
  // Add other fields as Payphone sends them
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Webhook received from Payphone')
    
    // Get request body
    const payload: PayphoneWebhookPayload = await req.json()
    console.log('Payload:', JSON.stringify(payload, null, 2))

    // Validate required fields
    if (!payload.clientTransactionId || !payload.id) {
      console.error('Missing required fields:', payload)
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Validate webhook signature/secret
    // const webhookSecret = Deno.env.get('PAYPHONE_WEBHOOK_SECRET')
    // Implement signature validation here

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract user ID from clientTransactionId
    // Format: TESTIFYHQ-{userId}-{timestamp}-{random}
    const userId = extractUserIdFromClientTxId(payload.clientTransactionId)
    
    if (!userId) {
      console.error('Could not extract user ID from:', payload.clientTransactionId)
      return new Response(
        JSON.stringify({ error: 'Invalid clientTransactionId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Extracted user ID:', userId)

    // Determine status
    const status = payload.transactionStatus === 3 ? 'approved' : 
                   payload.transactionStatus === 2 ? 'rejected' : 'pending'

    // Insert or update payment history
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_history')
      .upsert({
        user_id: userId,
        transaction_id: payload.id.toString(),
        client_transaction_id: payload.clientTransactionId,
        amount: payload.amount || 899, // Default to $8.99 if not provided
        currency: payload.currency || 'USD',
        status: status,
        payment_method: payload.paymentMethod,
        payphone_response: payload,
      }, {
        onConflict: 'client_transaction_id',
      })
      .select()

    if (paymentError) {
      console.error('Error inserting payment history:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Failed to record payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Payment history recorded:', paymentData)

    // If payment is approved, activate premium subscription
    if (status === 'approved') {
      console.log('Payment approved, activating premium for user:', userId)
      
      const { data: userData, error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'premium',
          subscription_expires_at: null, // Lifetime access
        })
        .eq('id', userId)
        .select()

      if (updateError) {
        console.error('Error updating user subscription:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to activate subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Premium subscription activated:', userData)
    }

    // Return 200 OK to Payphone
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        status: status,
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

/**
 * Extract user ID from clientTransactionId
 * Format: TESTIFYHQ-{userId}-{timestamp}-{random}
 */
function extractUserIdFromClientTxId(clientTxId: string): string | null {
  try {
    const parts = clientTxId.split('-')
    if (parts.length >= 2 && parts[0] === 'TESTIFYHQ') {
      return parts[1] // User ID is the second part
    }
    return null
  } catch (error) {
    console.error('Error extracting user ID:', error)
    return null
  }
}
