import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { authHelpers } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña');
      return;
    }

    try {
      setLoading(true);
      await authHelpers.loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      if (error.message?.includes('Invalid')) {
        setError('Email o contraseña incorrectos');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Por favor verifica tu email primero');
      } else {
        setError('Error al iniciar sesión. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Bienvenido a TestifyHQ
          </CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">


          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600 pt-4">
            ¿No tienes una cuenta?{' '}
            <Link to="/signup" className="text-primary-600 hover:underline font-medium">
              Regístrate gratis
            </Link>
          </div>

          {/* Terms */}
          <div className="text-center text-sm text-gray-600 mt-6 pt-6 border-t">
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              Términos de servicio
            </Link>
            {' '}y{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              Política de privacidad
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
