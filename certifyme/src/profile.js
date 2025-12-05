import { auth } from "./firebase-config";
import { getUserHistory } from "./db";
import { checkSubscriptionStatus, activateSubscription } from "./subscription";
import { onAuthStateChanged } from "firebase/auth";

const renderHistory = (history) => {
  const tbody = document.getElementById('history-list');
  const noHistory = document.getElementById('no-history');

  if (!history || history.length === 0) {
    tbody.innerHTML = '';
    noHistory.style.display = 'block';
    return;
  }

  noHistory.style.display = 'none';
  tbody.innerHTML = history.map(attempt => {
    const date = new Date(attempt.date).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Determine pass/fail (assuming 65% is pass, can be adjusted)
    const isPass = attempt.percentage >= 65;
    const badgeClass = isPass ? 'score-pass' : 'score-fail';
    const badgeText = isPass ? 'Aprobado' : 'Reprobado';
    const examName = attempt.slug ? attempt.slug.replace(/-/g, ' ').toUpperCase() : 'EXAMEN';

    return `
      <tr>
        <td><strong>${examName}</strong></td>
        <td>${date}</td>
        <td>${attempt.score} / ${attempt.totalQuestions} (${attempt.percentage}%)</td>
        <td><span class="score-badge ${badgeClass}">${badgeText}</span></td>
      </tr>
    `;
  }).join('');
};

// Success Modal Functions
const showSuccessModal = () => {
  document.getElementById('success-overlay').style.display = 'block';
  document.getElementById('success-modal').style.display = 'block';
};

const closeSuccessModal = () => {
  document.getElementById('success-overlay').style.display = 'none';
  document.getElementById('success-modal').style.display = 'none';
  // Limpiar URL parameters
  window.history.replaceState({}, document.title, window.location.pathname);
};

// PayPhone Payment Modal Functions
let currentUser = null; // Store current user for payment callbacks

const showPaymentModal = (user) => {
  currentUser = user;
  document.getElementById('payment-overlay').style.display = 'block';
  document.getElementById('payment-popup').style.display = 'block';
  initPayPhoneBox(user);
};

const closePaymentModal = () => {
  document.getElementById('payment-overlay').style.display = 'none';
  document.getElementById('payment-popup').style.display = 'none';
};

const initPayPhoneBox = async (user) => {
  // Generate unique transaction ID
  const clientTransactionId = `CERTIFYME-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const ppb = new PPaymentButtonBox({
    token: '5rDff4Dujq2aM6rqUPLFMRh2H933vKVGthSlumsGZRe-rmvz-ntuA_lwaYpqLCXI4OpsoufvYnYpujaMLGvq-QBOIEy4ogx1bnhugvCz8xkxgPKzKgXwulSA9vhNc_PG5V4zANzZTFRn3oNjH5uKA_tPkWkWqmeNHt47f56f1Z13HbNZz8pW2E_csIhpgYu92sUzyELGe9uklHFJbnp8CQogBP00FW7Hx4MwMaOK83Zq8zzNhntdB4tpJdPtuD5Ak19Inh_YZiSj2W9r3p5F0hXzrkXc1sPOBddTf_3b0JH0KGhF28yVnHYLJjyAwt4DT16s5g',
    clientTransactionId: clientTransactionId,
    amount: 1199, // $11.99 USD total
    amountWithoutTax: 1199, // Monto sin impuestos (todo el monto en este caso)
    amountWithTax: 0, // Monto con impuestos (0 porque el impuesto ya está incluido)
    tax: 0,
    service: 0,
    tip: 0,
    currency: 'USD',
    storeId: '55d1b2a9-204a-46a7-bfe1-229a153d08ca',
    reference: 'Suscripción Premium CertifyMe',
    backgroundColor: '#123458',
    // Callbacks de PayPhone
    onPayment: async (response) => {
      console.log('PayPhone Response:', response);
      
      // Verificar si el pago fue exitoso
      if (response && response.transactionStatus === 'Approved') {
        try {
          // Activar suscripción en Firebase
          const success = await activateSubscription(user.uid);
          
          if (success) {
            closePaymentModal();
            // Actualizar la UI
            await renderSubscription(user);
            alert('🎉 ¡Suscripción Premium activada con éxito! Ahora tienes acceso ilimitado a todos los exámenes.');
          } else {
            alert('❌ Error al activar la suscripción. Por favor, contacta a soporte.');
          }
        } catch (error) {
          console.error('Error activating subscription:', error);
          alert('❌ Error al activar la suscripción. Por favor, contacta a soporte.');
        }
      } else if (response && response.transactionStatus === 'Declined') {
        alert('❌ Pago rechazado. Por favor, verifica tu información de pago e intenta nuevamente.');
      }
    },
    onCancel: () => {
      console.log('Payment cancelled by user');
      // El usuario cerró el formulario de pago sin completar
    }
  }).render('pp-button');
};

// Detectar retorno de PayPhone y activar suscripción
const handlePayPhoneReturn = async (user) => {
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id');
  const clientTransactionId = urlParams.get('clientTransactionId');
  
  // Si hay parámetros de PayPhone, es un retorno de pago
  if (transactionId && clientTransactionId) {
    console.log('PayPhone return detected:', { transactionId, clientTransactionId });
    
    try {
      // Activar suscripción
      const success = await activateSubscription(user.uid);
      
      if (success) {
        // Actualizar UI
        await renderSubscription(user);
        // Mostrar modal de éxito
        showSuccessModal();
      } else {
        alert('❌ Error al activar la suscripción. Por favor, contacta a soporte.');
      }
    } catch (error) {
      console.error('Error activating subscription on return:', error);
      alert('❌ Error al activar la suscripción. Por favor, contacta a soporte.');
    }
  }
};

const renderSubscription = async (user) => {
  const container = document.getElementById('subscription-section');
  if (!container) return;

  const isPremium = await checkSubscriptionStatus(user.uid);
  
  container.style.display = 'block';
  if (isPremium) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="color: #123458; margin-bottom: 0.5rem;">Tu Plan: Premium 🌟</h2>
          <p style="color: #666;">Tienes acceso ilimitado a todos los exámenes.</p>
        </div>
        <div style="background: #dcfce7; color: #166534; padding: 0.5rem 1rem; border-radius: 999px; font-weight: bold;">
          Activo
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="color: #123458; margin-bottom: 0.5rem;">Tu Plan: Gratuito</h2>
          <p style="color: #666;">Tienes un límite de 1 intento por examen al día.</p>
        </div>
        <button id="upgrade-btn" style="background: #d97706; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem;">
          Mejorar a Premium ($11.99)
        </button>
      </div>
    `;
    
    document.getElementById('upgrade-btn').addEventListener('click', () => {
      showPaymentModal(user);
    });
  }
};

const initProfile = async (user) => {
  const loading = document.getElementById('profile-loading');
  const content = document.getElementById('profile-content');
  
  // Update User Info
  const name = user.displayName || user.email.split('@')[0];
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-avatar').textContent = name.charAt(0).toUpperCase();
  
  if (user.metadata.creationTime) {
    const joined = new Date(user.metadata.creationTime).toLocaleDateString('es-ES');
    document.getElementById('profile-joined').textContent = `Miembro desde: ${joined}`;
  }

  // Fetch History
  try {
    const history = await getUserHistory(user.uid);
    renderHistory(history);
    await renderSubscription(user);
    
    // Verificar si es retorno de PayPhone
    await handlePayPhoneReturn(user);
  } catch (error) {
    console.error("Error loading history", error);
  } finally {
    loading.style.display = 'none';
    content.style.display = 'block';
  }
};

// Wait for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    initProfile(user);
  } else {
    // Redirect if not logged in
    window.location.href = '/index.html';
  }
});

// Setup modal close listeners
document.getElementById('btn-cerrar-payment').addEventListener('click', closePaymentModal);
document.getElementById('payment-overlay').addEventListener('click', closePaymentModal);

// Setup success modal close listeners
document.getElementById('btn-cerrar-success').addEventListener('click', closeSuccessModal);
document.getElementById('success-overlay').addEventListener('click', closeSuccessModal);
