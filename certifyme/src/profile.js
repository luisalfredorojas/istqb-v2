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
          Mejorar a Premium ($7.99)
        </button>
      </div>
    `;
    
    document.getElementById('upgrade-btn').addEventListener('click', async () => {
      if (confirm('¿Confirmar suscripción por $7.99? (Simulación)')) {
        const success = await activateSubscription(user.uid);
        if (success) {
          alert('¡Suscripción activada con éxito!');
          renderSubscription(user); // Re-render
        } else {
          alert('Error al activar la suscripción.');
        }
      }
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
