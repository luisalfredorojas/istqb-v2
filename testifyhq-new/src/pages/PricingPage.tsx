import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function PricingPage() {
  const { user } = useAuth();
  const [isPayphoneReady, setIsPayphoneReady] = useState(false);



  const handlePayment = () => {
    if (!user) {
      alert('Por favor inicia sesión para continuar.');
      return;
    }

    // Generate unique transaction ID
    const clientTransactionId = `TESTIFYHQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize Payphone Box (requires Payphone script loaded)
    if (typeof (window as any).PPaymentButtonBox !== 'undefined') {
      setIsPayphoneReady(true);
      new (window as any).PPaymentButtonBox({
        token: import.meta.env.VITE_PAYPHONE_TOKEN,
        clientTransactionId: clientTransactionId,
        amount: 899, // $8.99 USD (Payphone uses cents)
        amountWithoutTax: 899,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: 'USD',
        storeId: import.meta.env.VITE_PAYPHONE_STORE_ID,
        reference: 'Acceso Premium TestifyHQ',
        backgroundColor: '#2563eb',
        onPayment: async (response: any) => {
          console.log('Payment response:', response);
          if (response?.transactionStatus === 'Approved') {
            try {
              // Update user subscription in database
              const { error } = await (supabase
                .from('users') as any)
                .update({ 
                  subscription_tier: 'premium',
                  subscription_expires_at: null 
                })
                .eq('id', user.id);

              if (error) throw error;

              alert('✅ ¡Pago exitoso! Tu cuenta Premium ha sido activada.');
              window.location.href = '/dashboard';
            } catch (err) {
              console.error('Error updating subscription:', err);
              alert('El pago fue procesado pero hubo un error activando tu cuenta. Por favor contáctanos con tu comprobante.');
            }
          }
        },
        onCancel: () => {
          console.log('Payment cancelled');
        }
      }).render('payphone-button-container');
    } else {
      console.error('Payphone script not loaded');
      alert('Error: Sistema de pago no disponible. Intenta recargar la página.');
    }
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
            Acceso Premium de por Vida
          </h1>
          <p className="text-xl text-gray-600">
            Un solo pago. Acceso ilimitado para siempre.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              OFERTA ESPECIAL
            </div>
            <CardTitle className="text-3xl mb-2">Plan Premium</CardTitle>
            <CardDescription className="text-lg">
              Pago único - Sin renovaciones
            </CardDescription>
            
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">$8.99</span>
                <span className="text-2xl text-gray-500">USD</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Un solo pago</p>
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

            {/* Payment Button Container */}
            <div id="payphone-button-container" className="mb-4"></div>

            {/* Fallback Button */}
            {!isPayphoneReady && (
              <Button 
                onClick={handlePayment}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Comprar Acceso Premium
              </Button>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Pago seguro procesado por Payphone
            </p>

            {/* Guarantee */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-700">
                ✓ Garantía de devolución de dinero de 30 días
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Si no estás satisfecho, te devolvemos tu dinero sin preguntas
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
                  <span className="text-error-500">✗</span>
                  <span className="text-gray-600">1 intento por examen al día</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-success-500">✓</span>
                  <span className="text-gray-600">Acceso básico a exámenes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-error-500">✗</span>
                  <span className="text-gray-600">Explicaciones limitadas</span>
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
