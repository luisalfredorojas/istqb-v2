/**
 * Avisos anónimos de uso de los exámenes.
 *
 * Sin cuentas, la base de datos no sabe qué exámenes se practican. Al
 * empezar y al terminar un simulacro se envía un aviso con el examen y, al
 * terminar, la nota y el tiempo. Nunca las respuestas ni un identificador
 * del visitante: el historial detallado sigue solo en el navegador.
 *
 * Son estadísticas, no parte del examen: si el envío falla (sin red, un
 * bloqueador), el simulacro sigue igual y el error se descarta.
 */
import { supabase } from '@/lib/supabase';
import { getAttempts } from '@/lib/localAttempts';

/** Simulacros que este navegador ya había terminado, de cualquier examen. */
function priorAttempts(): number {
  return Math.min(getAttempts().length, 1000);
}

export function trackExamStarted(examId: number): void {
  void supabase
    .from('exam_events')
    .insert({ exam_id: examId, event: 'started', prior_attempts: priorAttempts() })
    .then(() => undefined, () => undefined);
}

/** Llamar antes de guardar el intento en local, para no contarlo a él mismo. */
export function trackExamCompleted(
  examId: number,
  result: { score: number; passed: boolean; timeSpentSeconds: number }
): void {
  void supabase
    .from('exam_events')
    .insert({
      exam_id: examId,
      event: 'completed',
      score: result.score,
      passed: result.passed,
      time_spent_seconds: Math.max(0, Math.round(result.timeSpentSeconds)),
      prior_attempts: priorAttempts(),
    })
    .then(() => undefined, () => undefined);
}
