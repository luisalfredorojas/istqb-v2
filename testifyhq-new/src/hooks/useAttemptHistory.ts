import { useCallback, useMemo, useState } from 'react';
import {
  clearAttempts,
  getAttempt,
  getAttempts,
  type LocalAttempt,
} from '@/lib/localAttempts';

/**
 * Historial de simulacros del navegador. localStorage se lee de forma
 * síncrona, así que no hace falta ni react-query ni un estado de carga:
 * basta con leerlo al montar y refrescar el estado cuando algo lo cambie.
 */
export function useAttemptHistory() {
  const [attempts, setAttempts] = useState<LocalAttempt[]>(getAttempts);

  const clear = useCallback(() => {
    clearAttempts();
    setAttempts([]);
  }, []);

  return { attempts, clear };
}

/** Un intento concreto del historial local. */
export function useAttempt(attemptId: string | null): LocalAttempt | null {
  return useMemo(() => getAttempt(attemptId), [attemptId]);
}
