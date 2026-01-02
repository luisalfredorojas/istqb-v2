import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function PricingPage() {
  const { user } = useAuth();

  const handle2CheckoutPayment = () => {
    if (!user) {
      alert('Por favor inicia sesión para continuar.');
      return;
    }

    // 2Checkout Sandbox/Production configuration
    const merchantCode = import.meta.env.VITE_2CO_MERCHANT_CODE;
    const productCode = import.meta.env.VITE_2CO_SELLABLE_PRODUCT_CODE;
    const sandbox = import.meta.env.VITE_2CO_SANDBOX === 'true';
    
    // Base URL - sandbox vs production
    const baseUrl = sandbox 
      ? 'https://sandbox.2checkout.com/checkout/buy'
      : 'https://secure.2checkout.com/checkout/buy';

    // Build payment URL with parameters
    const params = new URLSearchParams({
      'merchant': merchantCode || '',
      'prod': productCode || '',
      'qty': '1',
      'return-url': `${window.location.origin}/payment-success`,
      'return-type': 'redirect',
      'tangible': '0', // Digital product
      'x-cust-email': user.email || '',
      'x-cust-id': user.id, // For webhook identification
      'CUSTOM_USER_ID': user.id, // Also send as custom field for webhook
    });

    const paymentUrl = `${baseUrl}?${params.toString()}`;
    
    console.log('Redirecting to 2Checkout:', {
      merchantCode,
      productCode,
      sandbox,
      userId: user.id,
    });

    // Redirect to 2Checkout hosted payment page
    window.location.href = paymentUrl;
  };

  const features = [
    { text: 'Acceso ilimitado a todos los exámenes', included: true },
    { text: 'Práctica sin restricciones de tiempo', included: true },
    { text: 'Explicaciones detalladas de respuestas', included: true },
    { text: 'Seguimiento completo de progreso', included: true },
    { text: 'Exámenes actualizados constantemente', included: true },
    { text: 'Soporte prioritario por email', included: true },
    { text: 'Certificado de finalización', included: true },
    { text: 'Acceso de por vida', included: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Acceso Premium Mensual
          </h1>
          <p className="text-xl text-gray-600">
            Suscripción mensual. Cancela cuando quieras.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              SUSCRIPCIÓN MENSUAL
            </div>
            <CardTitle className="text-3xl mb-2">Plan Premium</CardTitle>
            <CardDescription className="text-lg">
              Acceso completo e ilimitado
            </CardDescription>
            
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">$9.99</span>
                <span className="text-2xl text-gray-500">USD</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Por mes</p>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* 2Checkout Payment Button */}
            <Button 
              onClick={handle2CheckoutPayment}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Actualizar a Premium
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Pago seguro procesado por 2Checkout
            </p>

            {/* Guarantee */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-700">
                ✓ Pago seguro y encriptado
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Puedes cancelar tu suscripción en cualquier momento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Free vs Premium Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Plan Gratuito vs Premium
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Plan Gratuito</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span className="text-gray-600">2 intentos totales por día</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-success-500">✓</span>
                  <span className="text-gray-600">Acceso básico a exámenes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-error-500">✗</span>
                  <span className="text-gray-600">Explicaciones limit adas</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary-500">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  Plan Premium
                  <span className="text-sm font-normal text-primary-600">⭐ Recomendado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-success-500">✓</span>
                  <span className="text-gray-600">Intentos ilimitados</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-success-500">✓</span>
                  <span className="text-gray-600">Todos los exámenes desbloqueados</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-success-500">✓</span>
                  <span className="text-gray-600">Explicaciones completas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
