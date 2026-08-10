import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { createCheckout, PLANS, type PlanId } from '@/lib/payments';
import { Check, Sparkles, Loader2, Crown } from 'lucide-react';

const PREMIUM_BENEFITS = [
  'Exámenes ilimitados',
  'Acceso a todos los simulacros (A, B, C, D y extra)',
  'Explicaciones y vídeos de cada pregunta',
  'Sin anuncios',
  'Soporte prioritario',
];

export function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (plan: PlanId) => {
    setError(null);

    if (!user) {
      // Guarda la intención y manda a login.
      navigate('/login', { state: { redirectTo: '/pricing' } });
      return;
    }

    try {
      setLoadingPlan(plan);
      const url = await createCheckout(plan);
      // Redirige al checkout hospedado de la pasarela.
      window.location.assign(url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo iniciar el pago. Inténtalo de nuevo.'
      );
      setLoadingPlan(null);
    }
  };

  const isPremium = subscription?.isPremium ?? false;

  return (
    <div
      className="min-h-screen bg-bg py-20 px-4 transition-colors"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, var(--primary-soft) 0%, transparent 50%),
          var(--bg)
        `,
      }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-ds-text mb-4">
            Hazte Premium
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Prepara tu certificación ISTQB sin límites. Impuestos incluidos según tu país.
          </p>
        </div>

        {isPremium && (
          <div className="max-w-2xl mx-auto mb-10">
            <Card className="border-success">
              <CardContent className="flex items-center gap-3 py-6">
                <Crown className="w-8 h-8 text-success" />
                <div>
                  <p className="font-semibold text-ds-text">Ya eres Premium 🎉</p>
                  <p className="text-sm text-muted">
                    {subscription?.isLifetime
                      ? 'Tienes acceso de por vida.'
                      : 'Tu suscripción está activa.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlight ? 'border-primary shadow-2xl md:scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white rounded-full text-xs font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-ds-text">{plan.price}</span>
                  <span className="text-muted ml-1">{plan.period}</span>
                </div>
                <CardDescription className="mt-3 min-h-[3rem]">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-end pb-8">
                <Button
                  onClick={() => handleSelect(plan.id)}
                  disabled={loadingPlan !== null || isPremium}
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full"
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirigiendo...
                    </>
                  ) : isPremium ? (
                    'Ya tienes Premium'
                  ) : (
                    'Elegir plan'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <p className="text-center text-danger mb-8" role="alert">
            {error}
          </p>
        )}

        {/* Benefits */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Todos los planes incluyen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-3">
              {PREMIUM_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-ds-text">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center mt-10">
          <p className="text-sm text-muted">
            Pago seguro gestionado por Lemon Squeezy. Aceptamos tarjeta y PayPal.
          </p>
          <p className="text-sm text-muted mt-1">
            ¿Dudas? Escríbenos a support@testifyhq.com
          </p>
        </div>
      </div>
    </div>
  );
}
