const { admin, db } = require('./utils/firebase-admin');
const { verifyPayPhoneTransaction } = require('./utils/verify-payphone');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { userId, transactionId, clientTransactionId } = JSON.parse(event.body);

    // Validar parámetros
    if (!userId || !transactionId || !clientTransactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameters',
          required: ['userId', 'transactionId', 'clientTransactionId']
        })
      };
    }

    // Verificar transacción con PayPhone
    const payPhoneToken = process.env.PAYPHONE_TOKEN;
    
    if (!payPhoneToken) {
      console.error('PAYPHONE_TOKEN not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const isValid = await verifyPayPhoneTransaction(
      transactionId, 
      clientTransactionId,
      payPhoneToken
    );

    if (!isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid or unapproved transaction',
          transactionId 
        })
      };
    }

    // Verificar que no se haya usado antes esta transacción (prevenir doble uso)
    const existingSubscription = await db
      .collection('users')
      .where('subscription.transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (!existingSubscription.empty) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Transaction already used',
          transactionId 
        })
      };
    }

    // Activar Premium en Firestore usando Admin SDK
    await db.collection('users').doc(userId).update({
      subscription: {
        type: 'premium',
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        transactionId: transactionId,
        clientTransactionId: clientTransactionId,
        amount: 1199, // $11.99
        currency: 'USD'
      }
    });

    console.log(`Premium activated for user ${userId}, transaction ${transactionId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Premium subscription activated successfully',
        userId,
        transactionId
      })
    };

  } catch (error) {
    console.error('Error activating premium:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
