import { AuthModal } from './components/auth-modal.js';
import { subscribeToAuthChanges, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Auth Modal
  const authModal = new AuthModal();

  // Handle Header UI
  // Since header might be loaded via include.js, we need to wait or delegate
  // But for now, let's assume we can find the elements or wait a bit
  
  const updateAuthUI = (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (!loginBtn || !userMenu) {
      // Elements not found, maybe header not loaded yet?
      // Retry in a bit if using include.js
      setTimeout(() => updateAuthUI(user), 100);
      return;
    }

    if (user) {
      loginBtn.style.display = 'none';
      userMenu.style.display = 'block';
      
      // Update user info
      const name = user.displayName || user.email.split('@')[0];
      const initial = name.charAt(0).toUpperCase();
      
      userAvatar.textContent = initial;
      if (userName) userName.textContent = name;
      if (userEmail) userEmail.textContent = user.email;

      // Dropdown toggle
      userAvatar.onclick = (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      };

      // Close dropdown when clicking outside
      window.addEventListener('click', () => {
        if (userDropdown.classList.contains('show')) {
          userDropdown.classList.remove('show');
        }
      });

      // Logout
      if (logoutBtn) {
        logoutBtn.onclick = async () => {
          try {
            await logout();
            userDropdown.classList.remove('show');
          } catch (error) {
            console.error('Logout failed', error);
          }
        };
      }

    } else {
      loginBtn.style.display = 'block';
      userMenu.style.display = 'none';
      
      loginBtn.onclick = () => {
        authModal.open();
      };
    }
  };

  // Subscribe to state changes
  subscribeToAuthChanges((user) => {
    console.log('Auth state changed:', user);
    updateAuthUI(user);
  });
});
