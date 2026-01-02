import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check subscription status periodically
    // Webhook might take a few seconds to process
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds total

    const checkInterval = setInterval(async () => {
      attempts++;

      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if ((data as any)?.subscription_tier === 'premium') {
        setIsPremium(true);
        setChecking(false);
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        // Timeout - stop checking
        setChecking(false);
        clearInterval(checkInterval);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [user, navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (checking) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Procesando tu pago...
            </CardTitle>
            <CardDescription>
              Estamos confirmando tu suscripción premium.
              <br />
              Por favor espera un momento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              ¡Pago exitoso!
            </CardTitle>
            <CardDescription>
              Ya eres miembro Premium de TestifyHQ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Ahora puedes disfrutar de:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Exámenes ilimitados</li>
                <li>Sin anuncios</li>
                <li>Acceso a todos los temas</li>
                <li>Soporte prioritario</li>
              </ul>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment not confirmed yet
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Gracias por tu pago
          </CardTitle>
          <CardDescription>
            Estamos procesando tu suscripción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Recibirás un email de confirmación pronto.
            <br />
            Si tu suscripción no se activa en los próximos minutos,
            por favor contacta soporte.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleContinue}
              className="flex-1"
            >
              Volver al Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Verificar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
