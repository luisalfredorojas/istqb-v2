import { subscribeToAuthChanges } from '../src/auth.js';
import { checkSubscriptionStatus, getTodaysAttempts } from '../src/subscription.js';
import { PremiumModal } from '../src/components/premium-modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.exams-container');
  let premiumModal = null;

  subscribeToAuthChanges(async (user) => {
    container.innerHTML = ''; // Clear previous content

    if (!user) {
      container.innerHTML = `
        <div class="login-required" style="text-align: center; padding: 2rem;">
          <h2>Acceso Restringido</h2>
          <p>Debes iniciar sesión para ver y practicar los exámenes.</p>
          <button id="login-trigger" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">Iniciar Sesión</button>
        </div>
      `;
      
      const trigger = document.getElementById('login-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const loginBtn = document.getElementById('login-btn');
          if (loginBtn) loginBtn.click();
        });
      }
      return;
    }

    // User is logged in
    try {
      container.innerHTML = '<p>Cargando exámenes...</p>';
      
      // Initialize Premium Modal
      premiumModal = new PremiumModal(user.uid, () => {
        // On success, reload the list to update logic (though logic is client-side checked on click too)
        // But we want to refresh the 'attempts' list or just refresh the page?
        // Refreshing the page is easiest to ensure everything syncs.
        window.location.reload();
      });

      const [res, isPremium, attempts] = await Promise.all([
        fetch('../data/index.json'),
        checkSubscriptionStatus(user.uid),
        getTodaysAttempts(user.uid)
      ]);
      
      const exams = await res.json();
      container.innerHTML = ''; // Clear loading

      // REMOVED: Banner "Plan Gratuito" as per user request to be less invasive.

      exams.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'exam-card';
        
        // Logic: Button is ALWAYS "Practicar" and enabled.
        // We check restrictions on click.
        
        card.innerHTML = `
          <h2>${exam.titulo}</h2>
          <p class="desc">${exam.descripcion}</p>
          <p>Min score to pass: <strong>${exam.minimo_aprobacion}</strong></p>
          <button data-slug="${exam.slug}">Practicar</button>
        `;
        container.appendChild(card);
      });

      // Event delegation for buttons
      const buttons = container.querySelectorAll('button[data-slug]');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
           const slug = e.target.dataset.slug;
           
           // Check restrictions
           const isTaken = !isPremium && attempts.includes(slug);
           
           if (isTaken) {
             // Show Premium Modal
             premiumModal.open();
           } else {
             // Go to exam
             window.location.href = `../preguntas/preguntas.html?slug=${slug}`;
           }
        });
      });

    } catch (err) {
      console.error('Error loading exams:', err);
      container.innerHTML = '<p>Error cargando los exámenes.</p>';
    }
  });
});