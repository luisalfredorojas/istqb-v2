-- =====================================================================
-- Limpieza de exámenes antes de reimportar los JSON corregidos
--
-- ⚠️  DESTRUCTIVO Y SIN VUELTA ATRÁS.
--
-- `user_exam_attempts.exam_id` tiene una FK hacia `exams`. Si es
-- ON DELETE CASCADE, borrar los exámenes **borra también el historial de
-- intentos de todos los usuarios**: puntajes, aprobados y fechas.
--
-- Ejecuta los pasos EN ORDEN en el SQL Editor de Supabase, leyendo el
-- resultado de cada uno antes de pasar al siguiente. No corras el archivo
-- completo de una sola vez.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASO 1 — Ver qué se va a perder. Solo lectura, no borra nada.
-- ---------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM public.exams)                AS examenes,
  (SELECT COUNT(*) FROM public.questions)            AS preguntas,
  (SELECT COUNT(*) FROM public.user_exam_attempts)   AS intentos_de_usuarios,
  (SELECT COUNT(DISTINCT user_id)
     FROM public.user_exam_attempts)                 AS usuarios_afectados;


-- ---------------------------------------------------------------------
-- PASO 2 — Confirmar si la FK realmente arrastra los intentos.
--
-- Si `delete_rule` dice CASCADE, el PASO 4 borra el historial completo.
-- ---------------------------------------------------------------------
SELECT tc.constraint_name, rc.delete_rule
  FROM information_schema.table_constraints tc
  JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
 WHERE tc.table_name = 'user_exam_attempts'
   AND tc.constraint_type = 'FOREIGN KEY';


-- ---------------------------------------------------------------------
-- PASO 3 — Respaldo del historial (recomendado si el PASO 2 dio CASCADE).
--
-- Deja una copia intacta fuera del alcance del CASCADE. Si después
-- decides que no la necesitas: DROP TABLE public.backup_intentos_2026_08;
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.backup_intentos_2026_08 AS
  SELECT a.*, e.title AS exam_title
    FROM public.user_exam_attempts a
    LEFT JOIN public.exams e ON e.id = a.exam_id;

-- Verifica que el respaldo tenga las filas esperadas antes de seguir:
SELECT COUNT(*) AS filas_respaldadas FROM public.backup_intentos_2026_08;


-- ---------------------------------------------------------------------
-- PASO 4 — El borrado.
--
-- `questions` cae por su propia FK ON DELETE CASCADE hacia `exams`.
-- Ejecuta esto solo cuando los pasos anteriores te hayan cuadrado.
-- ---------------------------------------------------------------------
-- DELETE FROM public.exams;


-- ---------------------------------------------------------------------
-- PASO 5 — Después de reimportar los JSON desde el panel de administración,
-- marca cuáles exámenes son gratuitos (todos entran como premium).
-- ---------------------------------------------------------------------
-- UPDATE public.exams
--    SET is_free = TRUE
--  WHERE title ILIKE '%Exam A%'
--    AND title NOT ILIKE '%Extra%';

-- Comprobación final del estado de la importación:
-- SELECT e.id, e.title, e.difficulty, e.total_questions, e.passing_score,
--        e.is_free, COUNT(q.id) AS preguntas_reales,
--        COUNT(*) FILTER (WHERE q.correct_answer LIKE '%,%') AS multi_respuesta
--   FROM public.exams e
--   LEFT JOIN public.questions q ON q.exam_id = e.id
--  GROUP BY e.id
--  ORDER BY e.id;
