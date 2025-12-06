const { db } = require('./utils/firebase-admin');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId, examSlug } = JSON.parse(event.body);

    if (!userId || !examSlug) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId or examSlug' })
      };
    }

    // Verificar si es Premium
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const userData = userDoc.data();
    const isPremium = userData.subscription?.type === 'premium';

    if (isPremium) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          allowed: true, 
          reason: 'premium' 
        })
      };
    }

    // Verificar límite diario para usuarios free
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const historySnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('history')
      .where('slug', '==', examSlug)
      .where('date', '>=', todayStart.toISOString())
      .limit(1)
      .get();

    if (!historySnapshot.empty) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          allowed: false, 
          reason: 'daily_limit' 
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        allowed: true,
        reason: 'daily_limit_not_reached'
      })
    };

  } catch (error) {
    console.error('Error checking exam access:', error);
    
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
