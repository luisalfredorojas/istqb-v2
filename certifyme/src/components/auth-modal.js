import { loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } from "../auth.js";

export class AuthModal {
  constructor() {
    this.modal = null;
    this.isLoginMode = true;
    this.render();
    this.attachEvents();
  }

  render() {
    const modalHtml = `
      <div id="auth-modal" class="auth-modal hidden">
        <div class="auth-modal-content">
          <span class="close-modal">&times;</span>
          <h2 id="auth-title">Iniciar Sesión</h2>
          
          <form id="auth-form">
            <div class="form-group">
              <label for="auth-email">Email</label>
              <input type="email" id="auth-email" required>
            </div>
            <div class="form-group">
              <label for="auth-password">Contraseña</label>
              <input type="password" id="auth-password" required>
            </div>
            <button type="submit" class="btn-primary" id="auth-submit-btn">Entrar</button>
          </form>

          <div class="auth-divider">o continúa con</div>

          <div class="social-auth">
            <button id="google-login" class="btn-social google">
              Google
            </button>
            <button id="github-login" class="btn-social github">
              GitHub
            </button>
          </div>

          <p class="auth-switch">
            <span id="auth-switch-text">¿No tienes cuenta?</span>
            <a href="#" id="auth-switch-link">Regístrate</a>
          </p>
          <p id="auth-error" class="error-message"></p>
        </div>
      </div>
    `;

    // Append to body if not exists
    if (!document.getElementById('auth-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    this.modal = document.getElementById('auth-modal');
  }

  attachEvents() {
    const closeBtn = this.modal.querySelector('.close-modal');
    const switchLink = this.modal.querySelector('#auth-switch-link');
    const form = this.modal.querySelector('#auth-form');
    const googleBtn = this.modal.querySelector('#google-login');
    const githubBtn = this.modal.querySelector('#github-login');

    closeBtn.onclick = () => this.close();
    
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    };

    switchLink.onclick = (e) => {
      e.preventDefault();
      this.toggleMode();
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = this.modal.querySelector('#auth-email').value;
      const password = this.modal.querySelector('#auth-password').value;
      this.handleEmailAuth(email, password);
    };

    googleBtn.onclick = () => this.handleSocialLogin(loginWithGoogle);
    githubBtn.onclick = () => this.handleSocialLogin(loginWithGithub);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    const title = this.modal.querySelector('#auth-title');
    const submitBtn = this.modal.querySelector('#auth-submit-btn');
    const switchText = this.modal.querySelector('#auth-switch-text');
    const switchLink = this.modal.querySelector('#auth-switch-link');
    const errorMsg = this.modal.querySelector('#auth-error');

    errorMsg.textContent = '';

    if (this.isLoginMode) {
      title.textContent = 'Iniciar Sesión';
      submitBtn.textContent = 'Entrar';
      switchText.textContent = '¿No tienes cuenta?';
      switchLink.textContent = 'Regístrate';
    } else {
      title.textContent = 'Crear Cuenta';
      submitBtn.textContent = 'Registrarse';
      switchText.textContent = '¿Ya tienes cuenta?';
      switchLink.textContent = 'Inicia sesión';
    }
  }

  async handleEmailAuth(email, password) {
    const errorMsg = this.modal.querySelector('#auth-error');
    errorMsg.textContent = '';
    
    try {
      if (this.isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      this.close();
    } catch (error) {
      errorMsg.textContent = this.mapErrorMessage(error.code);
    }
  }

  async handleSocialLogin(loginMethod) {
    const errorMsg = this.modal.querySelector('#auth-error');
    errorMsg.textContent = '';
    try {
      await loginMethod();
      this.close();
    } catch (error) {
      errorMsg.textContent = 'Error al iniciar sesión. Intenta nuevamente.';
    }
  }

  mapErrorMessage(code) {
    switch (code) {
      case 'auth/invalid-email': return 'Email inválido.';
      case 'auth/user-disabled': return 'Usuario deshabilitado.';
      case 'auth/user-not-found': return 'Usuario no encontrado.';
      case 'auth/wrong-password': return 'Contraseña incorrecta.';
      case 'auth/email-already-in-use': return 'El email ya está en uso.';
      case 'auth/weak-password': return 'La contraseña es muy débil.';
      default: return 'Ocurrió un error. Intenta nuevamente.';
    }
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
