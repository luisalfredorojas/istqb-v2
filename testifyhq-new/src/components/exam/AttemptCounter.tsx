import { Crown, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AttemptCounterProps {
  remaining: number | 'unlimited';
  todayAttempts?: number;
  isPremium: boolean;
}

export function AttemptCounter({ remaining, todayAttempts = 0, isPremium }: AttemptCounterProps) {
  if (isPremium) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Acceso Premium</h3>
              <p className="text-sm text-gray-600">Intentos ilimitados de exámenes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const numRemaining = typeof remaining === 'number' ? remaining : 0;
  const isLow = numRemaining === 1;
  const isOut = numRemaining === 0;

  return (
    <Card className={`border-2 ${isOut ? 'border-red-200 bg-red-50' : isLow ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isOut ? 'bg-red-100' : isLow ? 'bg-orange-100' : 'bg-blue-100'}`}>
            {isOut ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle className={`w-6 h-6 ${isLow ? 'text-orange-600' : 'text-blue-600'}`} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {isOut ? 'Sin intentos disponibles' : `${numRemaining} intento${numRemaining !== 1 ? 's' : ''} restante${numRemaining !== 1 ? 's' : ''}`}
            </h3>
            <p className="text-sm text-gray-600">
              {isOut 
                ? `Has usado ${todayAttempts} intentos hoy. Vuelve mañana o actualiza a Premium.`
                : `Has usado ${todayAttempts} de 2 intentos hoy`
              }
            </p>
          </div>
          {isOut && (
            <Link to="/pricing">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Crown className="w-4 h-4 mr-2" />
                Ver Premium
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
