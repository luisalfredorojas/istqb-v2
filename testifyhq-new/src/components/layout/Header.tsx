import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTheme } from '@/hooks/useTheme';
import { authHelpers } from '@/lib/supabase';

export function Header() {
  const { user } = useAuth();
  const { data: roleData } = useUserRole(user?.id);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await authHelpers.signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ds-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60 transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <span className="text-lg font-semibold text-ds-text">TestifyHQ</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/exams"
            className="text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            Exámenes
          </Link>
          {user && (
            <Link
              to="/donate"
              className="text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              Contribuye
            </Link>
          )}
          {user && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
          )}
          {roleData?.isAdmin && (
            <Link
              to="/admin/exams"
              className="text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              ⚙️ Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-14 h-8 rounded-full bg-surface-alt border border-ds-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-surface border border-ds-border shadow-sm transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          </button>

          {user ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {(user.user_metadata?.display_name || user.email)?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-muted">
                    {user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
