import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente simplificado que muestra mensaje de acceso gratuito
 * Ya no hay restricciones de intentos ni diferencia entre usuarios
 */
export function AttemptCounter() {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Acceso Gratuito</h3>
            <p className="text-sm text-gray-600">
              Practica todos los exámenes sin límites
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

