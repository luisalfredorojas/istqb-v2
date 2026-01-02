import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DailyAttemptsData {
  todayAttempts: number;
  remaining: number | 'unlimited';
  canTakeExam: boolean;
  isPremium: boolean;
}

const DAILY_LIMIT_FREE = 2;

export function useDailyAttempts(userId: string | undefined): {
  data: DailyAttemptsData | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  return useQuery({
    queryKey: ['daily_attempts', userId],
    queryFn: async (): Promise<DailyAttemptsData> => {
      if (!userId) {
        return {
          todayAttempts: 0,
          remaining: 0,
          canTakeExam: false,
          isPremium: false,
        };
      }

      // Get user subscription tier
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const isPremium = (userData as | { subscription_tier: string } | null)?.subscription_tier === 'premium';

      // If premium, return unlimited
      if (isPremium) {
        return {
          todayAttempts: 0,
          remaining: 'unlimited',
          canTakeExam: true,
          isPremium: true,
        };
      }

      // Count attempts from today (midnight to now)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('user_exam_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString());

      if (countError) throw countError;

      const todayAttempts = count || 0;
      const remaining = Math.max(0, DAILY_LIMIT_FREE - todayAttempts);

      return {
        todayAttempts,
        remaining,
        canTakeExam: remaining > 0,
        isPremium: false,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute - refresh frequently to stay accurate
  });
}
