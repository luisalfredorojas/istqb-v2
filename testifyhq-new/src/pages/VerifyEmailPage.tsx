import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifica tu correo
          </CardTitle>
          <CardDescription>
            Te enviamos un enlace de confirmación a<br />
            <span className="font-semibold text-gray-700">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900">
                  Pasos para confirmar tu cuenta:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Revisa tu bandeja de entrada</li>
                  <li>Abre el correo de TestifyHQ</li>
                  <li>Haz clic en el enlace de confirmación</li>
                  <li>Automáticamente serás redirigido al dashboard</li>
                </ol>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No recibiste el correo?
              </p>
              <p className="text-xs text-gray-500">
                Revisa tu carpeta de spam o correo no deseado.
                El enlace expirará en 24 horas.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Ya confirmé mi correo - Iniciar sesión
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => navigate('/signup')}
            >
              ← Volver a crear cuenta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
