import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'paused'
    | 'cancelled'
    | 'expired'
    | null;
  plan: 'monthly' | 'yearly' | 'lifetime' | null;
  isLifetime: boolean;
  currentPeriodEnd: string | null;
  /** true si el usuario tiene acceso premium vigente ahora mismo */
  isPremium: boolean;
}

/**
 * Lee el estado de suscripción del usuario actual desde public.users.
 * El acceso premium se calcula igual que la función SQL has_premium_access:
 * lifetime, o suscripción no expirada dentro de su periodo vigente.
 */
export function useSubscription() {
  const { user } = useAuth();

  return useQuery<SubscriptionInfo>({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    // Refresca al volver a la pestaña para reflejar cambios tras un pago.
    refetchOnWindowFocus: true,
    staleTime: 30_000,
    queryFn: async () => {
      const { data: raw, error } = await supabase
        .from('users')
        .select(
          'subscription_tier, subscription_status, subscription_plan, is_lifetime, subscription_current_period_end'
        )
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      const data = raw as {
        subscription_tier: 'free' | 'premium';
        subscription_status: SubscriptionInfo['status'];
        subscription_plan: SubscriptionInfo['plan'];
        is_lifetime: boolean;
        subscription_current_period_end: string | null;
      };

      const periodEnd = data.subscription_current_period_end;
      const withinPeriod = !periodEnd || new Date(periodEnd) > new Date();
      const activeStatuses = ['active', 'trialing', 'cancelled', 'past_due'];

      const isPremium =
        data.is_lifetime ||
        (data.subscription_tier === 'premium' &&
          !!data.subscription_status &&
          activeStatuses.includes(data.subscription_status) &&
          withinPeriod);

      return {
        tier: data.subscription_tier,
        status: data.subscription_status,
        plan: data.subscription_plan,
        isLifetime: data.is_lifetime,
        currentPeriodEnd: periodEnd,
        isPremium,
      };
    },
  });
}
