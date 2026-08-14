/**
 * Representación de respuestas de examen.
 *
 * Una respuesta —tanto la correcta como la que marca el usuario— se guarda
 * como letras de opción en minúscula, ordenadas y separadas por coma:
 *
 *   una sola opción   ->  "c"
 *   varias opciones   ->  "a,e"
 *
 * El formato de una sola letra es exactamente el que ya usaban las filas
 * y los intentos históricos, así que los datos anteriores siguen siendo
 * válidos sin migración.
 *
 * Calificación: todo o nada. Una pregunta de respuesta múltiple solo suma
 * si el usuario marcó exactamente el conjunto correcto, sin sobras ni
 * faltantes. Es la regla del examen oficial ISTQB.
 */

/** Convierte el valor almacenado en una lista de letras normalizada. */
export function parseAnswer(value: string | null | undefined): string[] {
  if (!value) return [];
  const seen = new Set<string>();
  for (const part of value.split(',')) {
    const id = part.trim().toLowerCase();
    if (id) seen.add(id);
  }
  return [...seen].sort();
}

/** Serializa una lista de letras al formato canónico de almacenamiento. */
export function formatAnswer(ids: string[]): string {
  return parseAnswer(ids.join(',')).join(',');
}

/** Cuántas opciones hay que marcar para responder la pregunta. */
export function expectedAnswerCount(correctAnswer: string | null | undefined): number {
  return parseAnswer(correctAnswer).length;
}

/** ¿La pregunta admite más de una opción? */
export function isMultipleChoice(correctAnswer: string | null | undefined): boolean {
  return expectedAnswerCount(correctAnswer) > 1;
}

/** ¿La opción `optionId` forma parte de la respuesta? */
export function answerIncludes(value: string | null | undefined, optionId: string): boolean {
  return parseAnswer(value).includes(optionId.trim().toLowerCase());
}

/** Agrega o quita una opción de una respuesta múltiple. */
export function toggleAnswer(value: string | null | undefined, optionId: string): string {
  const id = optionId.trim().toLowerCase();
  const current = parseAnswer(value);
  const next = current.includes(id)
    ? current.filter((existing) => existing !== id)
    : [...current, id];
  return formatAnswer(next);
}

/** ¿La respuesta del usuario coincide exactamente con la correcta? */
export function isAnswerCorrect(
  userAnswer: string | null | undefined,
  correctAnswer: string | null | undefined
): boolean {
  const user = parseAnswer(userAnswer);
  const correct = parseAnswer(correctAnswer);
  if (correct.length === 0 || user.length !== correct.length) return false;
  return user.every((id, index) => id === correct[index]);
}

/** Cuenta las respuestas correctas de un intento completo. */
export function countCorrect(
  questions: { id: string; correct_answer: string }[],
  answers: Record<string, string>
): number {
  return questions.reduce(
    (total, question) =>
      isAnswerCorrect(answers[question.id], question.correct_answer) ? total + 1 : total,
    0
  );
}
