import { supabase } from '@/lib/supabase';

/**
 * Derecho de acceso y portabilidad (arts. 15 y 20 RGPD): reúne todos los
 * datos del usuario y los descarga como JSON legible por máquina.
 */
export async function exportUserData(userId: string): Promise<void> {
  const [profile, attempts, orders, withdrawals] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_exam_attempts').select('*').eq('user_id', userId),
    supabase.from('payment_orders').select('*').eq('user_id', userId),
    supabase.from('withdrawal_requests').select('*').eq('user_id', userId),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    format: 'JSON',
    description:
      'Datos personales asociados a tu cuenta de TestifyHQ (art. 20 RGPD).',
    profile: profile.data ?? null,
    exam_attempts: attempts.data ?? [],
    payment_orders: orders.data ?? [],
    withdrawal_requests: withdrawals.data ?? [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `testifyhq-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Derecho de supresión (art. 17 RGPD). Cancela la suscripción activa y
 * elimina la cuenta. Es irreversible.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {
    body: { confirm: true },
  });

  if (error) {
    let detail = error.message || 'No se pudo eliminar la cuenta';
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json();
        if (body?.error) detail = body.error;
      }
    } catch {
      // Sin cuerpo JSON: mensaje genérico.
    }
    throw new Error(detail);
  }

  await supabase.auth.signOut();
}
