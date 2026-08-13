import { supabase } from '@/lib/supabase';

export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  badge?: string;
}

// Catálogo de planes mostrado en el frontend. Los precios reales (con
// impuestos por país) los calcula Lemon Squeezy en el checkout; esto es
// solo el precio de referencia que se enseña al usuario.
export const PLANS: PlanInfo[] = [
  {
    id: 'monthly',
    name: 'Mensual',
    price: '4,99 €',
    period: '/mes',
    description: 'Acceso premium mes a mes. Cancela cuando quieras.',
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: '39,99 €',
    period: '/año',
    description: 'Dos meses gratis frente al plan mensual.',
    highlight: true,
    badge: 'Más popular',
  },
  {
    id: 'lifetime',
    name: 'De por vida',
    price: '79,99 €',
    period: 'pago único',
    description: 'Un solo pago, acceso premium para siempre.',
  },
];

/**
 * Crea un checkout en la pasarela y devuelve la URL a la que redirigir.
 * Requiere que el usuario tenga sesión iniciada.
 */
export async function createCheckout(plan: PlanId): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>(
    'create-checkout',
    { body: { plan } }
  );

  if (error) {
    // supabase-js oculta el cuerpo real en un error genérico; lo extraemos
    // de error.context (la Response) para ver el motivo concreto.
    let detail = error.message || 'No se pudo iniciar el pago';
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        if (body?.error) detail = body.error;
      }
    } catch {
      // Sin cuerpo JSON: nos quedamos con el mensaje genérico.
    }
    console.error('create-checkout error:', detail);
    throw new Error(detail);
  }
  if (!data?.url) {
    throw new Error('La pasarela no devolvió una URL de pago');
  }
  return data.url;
}
