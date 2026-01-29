import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Sparkles, Check } from 'lucide-react';

export function PricingPage() {
  // URL placeholder para PayPal - actualizar con la URL real
  const paypalDonateUrl = import.meta.env.VITE_PAYPAL_DONATE_URL || '#';

  const handleDonate = () => {
    if (paypalDonateUrl && paypalDonateUrl !== '#') {
      window.open(paypalDonateUrl, '_blank');
    } else {
      alert('El botón de donación estará disponible próximamente. ¡Gracias por tu interés en apoyarnos!');
    }
  };

  const benefits = [
    'Acceso ilimitado a todos los exámenes',
    'Práctica sin restricciones de tiempo',
    'Explicaciones detalladas de respuestas',
    'Seguimiento completo de progreso',
    'Exámenes actualizados constantemente',
    'Soporte de la comunidad',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contribuye a TestifyHQ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            TestifyHQ es <strong>100% gratuito</strong> para todos. 
            Tu contribución nos ayuda a mantener y mejorar la plataforma.
          </p>
        </div>

        {/* Donation Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl mb-12">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              CONTRIBUCIÓN VOLUNTARIA
            </div>
            <CardTitle className="text-3xl mb-2">Contribuye al Proyecto</CardTitle>
            <CardDescription className="text-lg">
              Cualquier monto es apreciado
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8">
            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Lo que obtienes GRATIS:
              </h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Donate */}
            <div className="border rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-600" />
                ¿Por qué contribuir?
              </h3>
              <p className="text-gray-600 mb-4">
                Tu contribución nos ayuda a:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Mantener los servidores funcionando</li>
                <li>• Agregar nuevos exámenes y preguntas</li>
                <li>• Mejorar la experiencia de usuario</li>
                <li>• Mantener la plataforma gratuita para todos</li>
              </ul>
            </div>

            {/* Donate Button */}
            <Button 
              onClick={handleDonate}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Contribuir con PayPal
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Serás redirigido a PayPal para completar tu contribución de forma segura
            </p>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            ¿Ya has contribuido? ¡Muchas gracias por tu apoyo!
          </p>
          <p className="text-sm text-gray-500">
            Si tienes preguntas, escríbenos a support@testifyhq.com
          </p>
        </div>
      </div>
    </div>
  );
}

