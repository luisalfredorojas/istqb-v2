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
            <div class="signup-fields hidden">
              <div class="form-row">
                <div class="form-group">
                  <label for="auth-firstname">Nombre</label>
                  <input type="text" id="auth-firstname">
                </div>
                <div class="form-group">
                  <label for="auth-lastname">Apellido</label>
                  <input type="text" id="auth-lastname">
                </div>
              </div>
              <div class="form-group">
                <label for="auth-dob">Fecha de nacimiento</label>
                <input type="date" id="auth-dob">
              </div>
              <div class="form-group">
                <label for="auth-profession">Profesión</label>
                <input type="text" id="auth-profession" placeholder="Ej. QA Engineer, Estudiante...">
              </div>
            </div>

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
    const signupFields = this.modal.querySelector('.signup-fields');

    errorMsg.textContent = '';

    if (this.isLoginMode) {
      title.textContent = 'Iniciar Sesión';
      submitBtn.textContent = 'Entrar';
      switchText.textContent = '¿No tienes cuenta?';
      switchLink.textContent = 'Regístrate';
      signupFields.classList.add('hidden');
      
      // Remove required attribute from signup fields
      this.modal.querySelector('#auth-firstname').removeAttribute('required');
      this.modal.querySelector('#auth-lastname').removeAttribute('required');
      this.modal.querySelector('#auth-dob').removeAttribute('required');
      this.modal.querySelector('#auth-profession').removeAttribute('required');
    } else {
      title.textContent = 'Crear Cuenta';
      submitBtn.textContent = 'Registrarse';
      switchText.textContent = '¿Ya tienes cuenta?';
      switchLink.textContent = 'Inicia sesión';
      signupFields.classList.remove('hidden');

      // Add required attribute to signup fields
      this.modal.querySelector('#auth-firstname').setAttribute('required', 'true');
      this.modal.querySelector('#auth-lastname').setAttribute('required', 'true');
      this.modal.querySelector('#auth-dob').setAttribute('required', 'true');
      this.modal.querySelector('#auth-profession').setAttribute('required', 'true');
    }
  }

  async handleEmailAuth(email, password) {
    const errorMsg = this.modal.querySelector('#auth-error');
    errorMsg.textContent = '';
    
    try {
      if (this.isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        const firstName = this.modal.querySelector('#auth-firstname').value;
        const lastName = this.modal.querySelector('#auth-lastname').value;
        const dob = this.modal.querySelector('#auth-dob').value;
        const profession = this.modal.querySelector('#auth-profession').value;

        const additionalData = {
          firstName,
          lastName,
          dob,
          profession,
          displayName: `${firstName} ${lastName}`
        };

        await registerWithEmail(email, password, additionalData);
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
