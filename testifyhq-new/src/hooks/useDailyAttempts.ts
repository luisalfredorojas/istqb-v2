import { useQuery } from '@tanstack/react-query';

interface DailyAttemptsData {
  todayAttempts: number;
  remaining: 'unlimited';
  canTakeExam: boolean;
}

/**
 * Hook simplificado - todos los usuarios tienen acceso ilimitado
 * Las restricciones de intentos diarios han sido removidas
 */
export function useDailyAttempts(userId: string | undefined): {
  data: DailyAttemptsData | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  return useQuery({
    queryKey: ['daily_attempts', userId],
    queryFn: async (): Promise<DailyAttemptsData> => {
      // Todos los usuarios tienen acceso ilimitado
      return {
        todayAttempts: 0,
        remaining: 'unlimited',
        canTakeExam: true,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes - no need to refresh often
  });
}
