/**
 * Historial de simulacros guardado en el propio navegador.
 *
 * La plataforma es pública y sin cuentas, así que no hay ningún usuario al
 * que asociar los intentos en la base de datos. El progreso vive en
 * localStorage: es privado del dispositivo, no requiere registro y se pierde
 * si el usuario limpia el navegador, que es el compromiso asumido al quitar
 * el login.
 */

const STORAGE_KEY = 'testifyhq:attempts';
/** Tope de intentos conservados; evita que el almacenamiento crezca sin fin. */
const MAX_ATTEMPTS = 100;

export interface LocalAttempt {
  id: string;
  examId: number;
  examTitle: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpentSeconds: number;
}

/** Lee el historial completo, del más reciente al más antiguo. */
export function getAttempts(): LocalAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalAttempt[]) : [];
  } catch {
    // Almacenamiento bloqueado o JSON corrupto: se trata como historial vacío.
    return [];
  }
}

export function getAttempt(id: string | null): LocalAttempt | null {
  if (!id) return null;
  return getAttempts().find((a) => a.id === id) ?? null;
}

/** Guarda un intento terminado y devuelve el registro creado. */
export function saveAttempt(
  attempt: Omit<LocalAttempt, 'id'>
): LocalAttempt | null {
  const record: LocalAttempt = { ...attempt, id: newId() };
  try {
    const next = [record, ...getAttempts()].slice(0, MAX_ATTEMPTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return record;
  } catch {
    // Sin almacenamiento disponible (modo privado, cuota llena): el examen
    // se corrige igual, solo que no queda en el historial.
    return null;
  }
}

export function clearAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
