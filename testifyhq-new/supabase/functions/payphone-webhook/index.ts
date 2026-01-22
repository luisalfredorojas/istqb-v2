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

    // SECURITY: Validate webhook signature/secret
    // TODO: Implement signature validation when Payphone provides documentation
    // Expected implementation:
    // 1. Get signature from header: const signature = req.headers.get('X-Payphone-Signature')
    // 2. Get webhook secret: const webhookSecret = Deno.env.get('PAYPHONE_WEBHOOK_SECRET')
    // 3. Compute expected signature: const expected = computeHMAC(payload, webhookSecret)
    // 4. Compare: if (signature !== expected) return 401
    // 
    // Without signature validation, this endpoint is vulnerable to spoofed webhook calls
    // Until implemented, ensure this URL is not publicly documented
    
    console.log('Processing webhook for transaction:', {
      transactionId: payload.id,
      clientTxId: payload.clientTransactionId,
      status: payload.transactionStatus,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
    })

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

    console.log('Extracted user ID (partial or full):', userId)

    // Resolve full user ID if we only have a partial ID (8 characters from new format)
    let fullUserId = userId
    
    if (userId.length === 8) {
      // New format - we only have first 8 chars, need to find the full UUID
      console.log('Resolving partial user ID to full UUID...')
      
      const { data: users, error: userLookupError } = await supabase
        .from('users')
        .select('id')
        .ilike('id', `${userId}%`) // Find user ID starting with these 8 characters
        .limit(1)
      
      if (userLookupError || !users || users.length === 0) {
        console.error('Could not resolve user ID:', userLookupError)
        return new Response(
          JSON.stringify({ error: 'User not found for transaction' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      fullUserId = users[0].id
      console.log('Resolved to full user ID:', fullUserId)
    }

    // Determine status
    const status = payload.transactionStatus === 3 ? 'approved' : 
                   payload.transactionStatus === 2 ? 'rejected' : 'pending'

    // Insert or update payment history
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_history')
      .upsert({
        user_id: fullUserId,
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
      console.log('Payment approved, activating premium for user:', fullUserId)
      
      const { data: userData, error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'premium',
          subscription_expires_at: null, // Lifetime access
        })
        .eq('id', fullUserId)
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
 * Supports both formats:
 * - New: TFY-{userId8}-{timestamp36}-{random4} (only first 8 chars of UUID)
 * - Old: TESTIFYHQ-{userId}-{timestamp}-{random} (full UUID)
 */
function extractUserIdFromClientTxId(clientTxId: string): string | null {
  try {
    const parts = clientTxId.split('-')
    
    // New format: TFY-{userId8}-...
    if (parts.length >= 2 && parts[0] === 'TFY') {
      // Return the 8-char user ID portion (second part)
      // Note: This is only the first 8 characters of the full UUID
      // We'll need to query the database using a LIKE pattern
      return parts[1]
    }
    
    // Old format: TESTIFYHQ-{fullUserId}-...
    if (parts.length >= 2 && parts[0] === 'TESTIFYHQ') {
      return parts[1] // Full user ID
    }
    
    return null
  } catch (error) {
    console.error('Error extracting user ID:', error)
    return null
  }
}
