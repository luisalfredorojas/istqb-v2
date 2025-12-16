import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers, supabase } from '@/lib/supabase';

export function Header() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if ((data as any)?.subscription_tier === 'premium') {
            setIsPremium(true);
          }
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await authHelpers.signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900">TestifyHQ</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/exams"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Exámenes
          </Link>
          {!isPremium && (
            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Planes
            </Link>
          )}
          {user && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sm"
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
