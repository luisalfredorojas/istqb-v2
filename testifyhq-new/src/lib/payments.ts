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
    price: '7,99 €',
    period: '/mes',
    description: 'Acceso premium ilimitado. Cancela cuando quieras.',
    highlight: true,
  },
];

/**
 * Crea un checkout en la pasarela y devuelve la URL a la que redirigir.
 * Requiere que el usuario tenga sesión iniciada.
 */
/** Extrae el mensaje de error real que devuelve una Edge Function. */
async function extractError(error: unknown, fallback: string): Promise<string> {
  let detail = (error as { message?: string })?.message || fallback;
  try {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = await ctx.json();
      if (body?.error) detail = body.error;
    }
  } catch {
    // Sin cuerpo JSON: nos quedamos con el mensaje genérico.
  }
  return detail;
}

/**
 * Cancela la suscripción del usuario. Sigue activa hasta el fin del periodo
 * ya pagado; devuelve esa fecha (si la pasarela la informa).
 */
export async function cancelSubscription(): Promise<{ endsAt: string | null }> {
  const { data, error } = await supabase.functions.invoke<{
    cancelled: boolean;
    endsAt: string | null;
  }>('manage-subscription', { body: { action: 'cancel' } });

  if (error) {
    throw new Error(await extractError(error, 'No se pudo cancelar la suscripción'));
  }
  return { endsAt: data?.endsAt ?? null };
}

/** Devuelve la URL del portal de cliente (facturas, método de pago). */
export async function getCustomerPortalUrl(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>(
    'manage-subscription',
    { body: { action: 'portal' } }
  );

  if (error) {
    throw new Error(await extractError(error, 'No se pudo abrir el portal'));
  }
  if (!data?.url) throw new Error('No se pudo abrir el portal');
  return data.url;
}

export async function createCheckout(plan: PlanId): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>(
    'create-checkout',
    { body: { plan } }
  );

  if (error) {
    // supabase-js oculta el cuerpo real en un error genérico.
    const detail = await extractError(error, 'No se pudo iniciar el pago');
    console.error('create-checkout error:', detail);
    throw new Error(detail);
  }
  if (!data?.url) {
    throw new Error('La pasarela no devolvió una URL de pago');
  }
  return data.url;
}
