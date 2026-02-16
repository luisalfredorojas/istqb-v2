import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { authHelpers } from '@/lib/supabase';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/utils/validation';

export function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setErrors({});
      await authHelpers.loginWithGoogle();
    } catch (error: any) {
      console.error('Error signing up with Google:', error);
      setErrors({ general: 'Error al registrarse con Google. Intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});

    // Validate
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const matchValidation = validatePasswordMatch(password, confirmPassword);

    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }

    if (!matchValidation.isValid) {
      newErrors.confirmPassword = matchValidation.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await authHelpers.signUp(email, password, displayName);
      
      // Check if signup was successful but user already exists
      // Supabase returns user but NO session when email already exists (for security)
      if (result.user && !result.session) {
        setErrors({ email: 'Este email ya está registrado. Por favor inicia sesión.' });
        setLoading(false);
        return;
      }
      
      // Redirect to verification page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error('Error signing up:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      
      // Handle specific error messages from Supabase
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (
        errorMessage.includes('already') || 
        errorMessage.includes('registered') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('exists') ||
        error.code === '23505' ||
        error.status === 400
      ) {
        setErrors({ email: 'Este email ya está registrado. Por favor inicia sesión.' });
      } else {
        // Show the actual error for debugging
        setErrors({ email: `Error: ${error.message}` });
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
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tu información para registrarte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-11"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </Button>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O regístrate con email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 6 caracteres"
                showStrength
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Debe contener al menos 6 caracteres, letras y números
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirma tu contraseña"
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
