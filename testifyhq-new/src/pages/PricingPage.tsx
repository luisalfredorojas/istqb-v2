import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';


export function PricingPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://donorbox.org/widget.js';
    script.setAttribute('paypalExpress', 'false');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
            TestifyHQ es <strong>100% gratuito</strong>.
          </p>
        </div>

        {/* Donation Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl mb-12">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              CONTRIBUCIÓN VOLUNTARIA
            </div>
            <CardTitle className="text-3xl mb-2">Apóyanos</CardTitle>
            <CardDescription className="text-lg">
              Si la plataforma te ha sido útil, considera hacer una donación.
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-8 flex flex-col items-center gap-8">
            <iframe
              src="https://donorbox.org/embed/colabora-con-nosotros-905182?amount=5"
              name="donorbox"
              allow="payment"
              seamless
              frameBorder="0"
              scrolling="no"
              height="900px"
              width="100%"
              style={{ maxWidth: '500px', minWidth: '250px', maxHeight: 'none' }} 
            />
            
            <div className="w-full flex justify-center">
              <iframe 
                src="https://donorbox.org/embed/colabora-con-nosotros-905182?donor_wall_color=%23128AED&only_donor_wall=true" 
                name="donorbox"
                allow="payment"
                seamless
                frameBorder="0"
                scrolling="no"
                height="93px" 
                width="100%" 
                style={{ width: '100%', maxWidth: '500px', minWidth: '310px', minHeight: '345px' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            ¡Muchas gracias por tu apoyo!
          </p>
          <p className="text-sm text-gray-500">
            Si tienes dudas, escríbenos a support@testifyhq.com
          </p>
        </div>
      </div>
    </div>
  );
}


