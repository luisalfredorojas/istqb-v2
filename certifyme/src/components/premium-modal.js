// ⚠️ premium-modal.js - DEPRECATED
// Este modal ya NO activa Premium directamente (inseguro)
// Ahora redirige al usuario a la página de perfil para usar PayPhone

export class PremiumModal {
  constructor(userId, onUpgradeSuccess) {
    this.userId = userId;
    this.onUpgradeSuccess = onUpgradeSuccess;
    this.modal = null;
    this.render();
    this.attachEvents();
  }

  render() {
    const modalHtml = `
      <div id="premium-modal" class="auth-modal hidden" style="display: none;">
        <div class="auth-modal-content" style="text-align: center;">
          <span class="close-modal">&times;</span>
          <h2 style="color: #d97706; margin-bottom: 1rem;">¡Límite Diario Alcanzado!</h2>
          <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.6;">
            Has alcanzado tu límite diario para este examen en el Plan Gratuito.
            <br>
            <strong>Mejora a Premium para practicar sin límites.</strong>
          </p>
          
          <div style="background: #fffbeb; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid #fcd34d;">
            <h3 style="margin: 0 0 0.5rem 0; color: #92400e;">Plan Premium</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #b45309; text-align: left; display: inline-block;">
              <li>✅ Intentos ilimitados</li>
              <li>✅ Acceso a todos los exámenes</li>
              <li>✅ Historial detallado</li>
            </ul>
          </div>

          <button id="premium-upgrade-btn" class="btn-primary" style="background: #d97706; border: none; width: 100%; padding: 1rem; font-size: 1.1rem;">
            Ir a Premium - $11.99
          </button>
          
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #888;">
            Pago único. Acceso de por vida.
          </p>
        </div>
      </div>
    `;

    if (!document.getElementById('premium-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    this.modal = document.getElementById('premium-modal');
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector('.close-modal');
    const upgradeBtn = this.modal.querySelector('#premium-upgrade-btn');

    const closeModal = () => this.close();

    closeBtn.onclick = closeModal;
    
    window.onclick = (event) => {
      if (event.target === this.modal) {
        closeModal();
      }
    };

    // ✅ NUEVO: Redirigir a página de perfil donde está PayPhone
    upgradeBtn.onclick = () => {
      window.location.href = '/profile/';
    };
  }

  open() {
    this.modal.classList.remove('hidden');
    this.modal.style.display = 'block';
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.style.display = 'none';
  }
}
