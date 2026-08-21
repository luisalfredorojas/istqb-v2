/* eslint-disable @typescript-eslint/no-explicit-any --
 * La entrada es un JSON arbitrario que sube un administrador desde su disco:
 * su forma es justamente lo que estas funciones verifican. Tiparla como algo
 * más estrecho que `any` obligaría a castear en cada acceso sin ganar ninguna
 * garantía, porque en tiempo de ejecución puede venir cualquier cosa.
 */
import { formatAnswer } from '@/lib/answers';

/**
 * Traducción del JSON de examen (formato del PDF original, en español) al
 * payload que consume la función `import_exam` de Postgres.
 *
 * Es lógica pura y sin dependencias de red a propósito: la importación es
 * destructiva cuando el título ya existe —reemplaza todas las preguntas del
 * examen—, así que un archivo incompleto o mal formado tiene que rebotar
 * aquí, antes de que se escriba nada.
 */

// `type` y no `interface`: los payloads viajan como argumentos `Json` del RPC,
// y solo los alias de tipo obtienen la index signature implícita que exige
// ese tipo. Con `interface` el envío al RPC no compila.
export type ExamPayload = {
  title: string;
  description: string;
  category: string;
  difficulty: 'Foundation' | 'Advanced' | 'Expert';
  language: ExamLanguage;
  duration_minutes: number;
  passing_score: number;
};

/** Idioma del contenido del examen. Los JSON lo declaran en `idioma`. */
export type ExamLanguage = 'en' | 'es';

const LANGUAGES: ExamLanguage[] = ['en', 'es'];

export type QuestionPayload = {
  question_type: string;
  question_text: string;
  question_image_url: string | null;
  options: { id: string; content: string; type: string }[];
  correct_answer: string;
  explanation: string;
  explanation_video_url: string | null;
  order_index: number;
};

/** Un JSON rechazado antes de llegar a la base. */
export class ValidationError extends Error {}

const letterFor = (index: number) => String.fromCharCode(97 + index);

const DECLARED_COUNTS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
};

export function buildQuestions(data: any): QuestionPayload[] {
  const rawQuestions = data?.examen;

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new ValidationError('el archivo no contiene preguntas ("examen" vacío o ausente)');
  }

  return rawQuestions.map((q: any, index: number) => {
    const position = q?.numero ?? index + 1;
    const fail = (reason: string): never => {
      throw new ValidationError(`pregunta ${position}: ${reason}`);
    };

    const text = Array.isArray(q?.pregunta) ? q.pregunta.join(' ') : q?.pregunta;
    if (typeof text !== 'string' || text.trim() === '') {
      fail('el enunciado está vacío');
    }

    if (!Array.isArray(q.opciones) || q.opciones.length < 2) {
      fail('necesita al menos 2 opciones');
    }

    const options = q.opciones.map((opt: unknown, i: number) => {
      if (typeof opt !== 'string' || opt.trim() === '') {
        fail(`la opción ${letterFor(i)} está vacía`);
      }
      return {
        id: letterFor(i),
        // Las opciones vienen etiquetadas desde el PDF ("a) texto"); la web
        // pinta la letra por su cuenta, así que aquí se quita el prefijo.
        content: (opt as string).replace(/^[a-z]\)\s*/i, '').trim(),
        type: 'text',
      };
    });

    // Índice base 0 sobre `opciones`; array cuando hay varias correctas.
    const rawCorrect = q.respuesta_correcta;
    const indices: unknown[] = Array.isArray(rawCorrect) ? rawCorrect : [rawCorrect];

    if (indices.length === 0) {
      fail('no tiene respuesta correcta');
    }

    const letters = indices.map((value) => {
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        fail(`la respuesta correcta "${String(value)}" no es un índice válido`);
      }
      const idx = value as number;
      if (idx < 0 || idx >= options.length) {
        fail(
          `la respuesta correcta (${idx}) está fuera del rango de opciones (0-${options.length - 1})`
        );
      }
      return letterFor(idx);
    });

    const correctAnswer = formatAnswer(letters);
    if (correctAnswer.split(',').length !== letters.length) {
      fail('la respuesta correcta tiene índices repetidos');
    }

    // `numero_respuestas` viene del PDF y es independiente de los índices:
    // si no coinciden, una de las dos fuentes está mal y hay que revisarla.
    const declared = DECLARED_COUNTS[String(q.numero_respuestas || '').toUpperCase()];
    if (declared && declared !== letters.length) {
      fail(`declara ${q.numero_respuestas} (${declared}) respuestas pero marca ${letters.length}`);
    }

    return {
      question_type: 'text',
      question_text: (text as string).trim(),
      question_image_url: q.imageUrl?.trim() || null,
      options,
      correct_answer: correctAnswer,
      explanation: q.explicacion ?? '',
      explanation_video_url: q.video_explicacion?.trim() || null,
      order_index: index + 1,
    };
  });
}

export function buildExam(data: any, questionCount: number): ExamPayload {
  const title = (data?.titulo || data?.title || '').trim();
  if (!title) {
    throw new ValidationError('el examen no tiene título');
  }

  const isAdvanced = title.toLowerCase().includes('advanced');
  const passingScoreRaw = data.minimo_aprobacion || Math.ceil(questionCount * 0.65);

  // El idioma decide en qué listado aparece el examen. Los archivos previos
  // a la traducción no lo traen, y son los originales en inglés.
  const rawLanguage = String(data?.idioma ?? data?.language ?? 'en').trim().toLowerCase();
  if (!LANGUAGES.includes(rawLanguage as ExamLanguage)) {
    throw new ValidationError(
      `idioma inválido "${rawLanguage}" (se esperaba ${LANGUAGES.join(' o ')})`
    );
  }

  return {
    title,
    description: data.descripcion || data.description || 'Sin descripción',
    category: 'ISTQB',
    language: rawLanguage as ExamLanguage,
    // Capitalizado: es el valor que exige el CHECK de la tabla, el que usa
    // el formulario del panel y el que se muestra tal cual en el listado.
    difficulty: isAdvanced ? 'Advanced' : 'Foundation',
    duration_minutes: isAdvanced ? 120 : 60,
    passing_score: Math.round((passingScoreRaw / questionCount) * 100),
  };
}
