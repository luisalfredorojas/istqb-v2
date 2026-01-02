import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    console.log('Webhook received:', req.method, req.url);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get 2Checkout credentials
    const secretWord = Deno.env.get('2CO_SECRET_WORD') || '';

    // Parse form data from 2Checkout INS webhook
    const contentType = req.headers.get('content-type') || '';
    let data: Record<string, string> = {};
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        data[key] = value.toString();
      }
    } else if (contentType.includes('application/json')) {
      data = await req.json();
    } else {
      // For validation requests, just return success
      console.log('Validation request - returning success');
      return new Response(
        'OK',
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    console.log('Received data keys:', Object.keys(data));

    // Extract key fields
    const refNo = data.REFNO || data.REFNOEXT;
    const orderStatus = data.IPN_ORDER_STATUS || data.ORDERSTATUS;
    const hash = data.HASH;
    const customReference = data.CUSTOM_USER_ID || data['x-cust-id'];
    
    console.log('Processing webhook:', { refNo, orderStatus, customReference });

    // If no order data, it's probably a validation request
    if (!refNo && !orderStatus) {
      console.log('No order data - validation request');
      return new Response(
        'OK',
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      );
    }

    // Process based on order status
    if (orderStatus === 'COMPLETE' || orderStatus === 'APPROVED') {
      const userId = customReference;

      if (!userId) {
        console.error('No user ID found in webhook data');
        // Still return 200 to acknowledge receipt
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Update user subscription tier
      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'premium',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        // Still return 200 to prevent retries
      } else {
        console.log(`Updated user ${userId} to premium`);
      }

      // Record payment in history
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          amount: parseFloat(data.IPN_TOTALGENERAL || data.PRICE_TOTAL || '9.99'),
          currency: data.CURRENCY || 'USD',
          status: 'completed',
          payment_method: '2checkout',
          transaction_id: refNo,
          refno: refNo,
          external_reference: data.ORDERNO || data.ORDER_REF,
          raw_response: data,
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
      } else {
        console.log(`Payment recorded for user ${userId}`);
      }
    }

    // Always return 200 OK to 2Checkout
    return new Response(
      'OK',
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    // Even on error, return 200 to prevent 2Checkout from retrying
    return new Response(
      'OK',
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      }
    );
  }
});
