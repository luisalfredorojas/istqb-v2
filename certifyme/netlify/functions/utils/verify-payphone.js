// Verificar transacción con PayPhone API
async function verifyPayPhoneTransaction(transactionId, clientTransactionId, token) {
  try {
    const response = await fetch('https://pay.payphonetodoesposible.com/api/v1/Transaction/Confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: transactionId,
        clientTransactionId: clientTransactionId
      })
    });

    if (!response.ok) {
      console.error('PayPhone API error:', response.status, await response.text());
      return false;
    }

    const data = await response.json();
    
    // PayPhone retorna statusCode: 3 para transacciones aprobadas
    // transactionStatus: 'Approved'
    return data.transactionStatus === 'Approved' && data.statusCode === 3;
    
  } catch (error) {
    console.error('Error verifying PayPhone transaction:', error);
    return false;
  }
}

module.exports = { verifyPayPhoneTransaction };
