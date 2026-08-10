import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserAttempts } from '@/hooks/useExamAttempts';
import type { Exam } from '@/types';

/** Nº máximo de simulacros de práctica para usuarios sin Premium. */
export const FREE_ATTEMPT_LIMIT = 2;

export type ExamLockReason = 'premium_exam' | 'attempts_exhausted' | null;

export interface ExamAccess {
  isPremium: boolean;
  isLoading: boolean;
  /** Simulacros completados por el usuario (cuentan para el límite gratis). */
  attemptsUsed: number;
  /** Intentos gratis restantes (0 si ya no le quedan). */
  freeAttemptsRemaining: number;
  /** ¿Puede el usuario iniciar este examen ahora mismo? */
  canStart: (exam: Pick<Exam, 'is_free'>) => boolean;
  /** Si no puede iniciarlo, por qué está bloqueado. */
  lockReason: (exam: Pick<Exam, 'is_free'>) => ExamLockReason;
}

/**
 * Reglas del plan gratuito:
 *  - Solo puede practicar exámenes marcados como `is_free` (el Examen A).
 *  - Máximo FREE_ATTEMPT_LIMIT simulacros completados en total.
 * Los usuarios Premium no tienen ninguna de estas restricciones.
 */
export function useExamAccess(): ExamAccess {
  const { user } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: attempts, isLoading: attemptsLoading } = useUserAttempts(user?.id);

  const isPremium = subscription?.isPremium ?? false;

  // Cuenta solo simulacros finalizados.
  const attemptsUsed = Array.isArray(attempts)
    ? attempts.filter((a: { completed_at?: string | null }) => !!a?.completed_at).length
    : 0;

  const freeAttemptsRemaining = Math.max(0, FREE_ATTEMPT_LIMIT - attemptsUsed);

  const lockReason = (exam: Pick<Exam, 'is_free'>): ExamLockReason => {
    if (isPremium) return null;
    if (!exam.is_free) return 'premium_exam';
    if (attemptsUsed >= FREE_ATTEMPT_LIMIT) return 'attempts_exhausted';
    return null;
  };

  const canStart = (exam: Pick<Exam, 'is_free'>): boolean => lockReason(exam) === null;

  return {
    isPremium,
    isLoading: subLoading || attemptsLoading,
    attemptsUsed,
    freeAttemptsRemaining,
    canStart,
    lockReason,
  };
}
