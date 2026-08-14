-- =====================================================================
-- Importación de exámenes atómica + soporte de respuesta múltiple
--
-- Problemas que resuelve:
--
-- 1. La importación desde el panel hacía update -> delete -> insert en
--    tres viajes separados desde el navegador, sin transacción. Si el
--    borrado de preguntas fallaba, el código seguía igual e insertaba
--    encima: el examen quedaba con preguntas duplicadas. Y si fallaba a
--    mitad de camino, quedaba un examen sin preguntas.
--
-- 2. `exams.difficulty` tenía un CHECK con valores capitalizados
--    ('Foundation'...) mientras el importador escribía minúsculas
--    ('foundation'). Según si se había ejecutado o no `drop_constraint.sql`
--    la importación fallaba, o entraban datos inconsistentes según la
--    ruta por la que se hubiera cargado el examen.
--
-- 3. `correct_answer` guardaba una sola letra, así que las preguntas de
--    respuesta múltiple ("Which TWO of the following...") se guardaban
--    truncadas a la primera opción correcta y se calificaban mal.
--    Ahora admite varias letras separadas por coma: 'a,e'.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Normalizar `difficulty` y restaurar el CHECK con el valor canónico
--    (capitalizado, que es lo que usa el formulario del panel y lo que
--    se muestra tal cual al usuario en el listado de exámenes).
-- ---------------------------------------------------------------------
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_difficulty_check;

UPDATE public.exams
   SET difficulty = INITCAP(difficulty)
 WHERE difficulty IS NOT NULL
   AND difficulty <> INITCAP(difficulty);

-- Cualquier valor fuera del dominio pasa a 'Foundation' para que el
-- constraint pueda crearse sin fallar sobre datos heredados.
UPDATE public.exams
   SET difficulty = 'Foundation'
 WHERE difficulty IS NOT NULL
   AND difficulty NOT IN ('Foundation', 'Advanced', 'Expert');

ALTER TABLE public.exams
  ADD CONSTRAINT exams_difficulty_check
  CHECK (difficulty IN ('Foundation', 'Advanced', 'Expert'));

-- ---------------------------------------------------------------------
-- 2. `correct_answer` con formato de lista de letras.
--    Formato canónico: letras minúsculas, ordenadas, separadas por coma
--    y sin espacios. Una sola respuesta sigue siendo 'c' — las filas
--    existentes ya cumplen el formato, no hace falta migrar datos.
-- ---------------------------------------------------------------------
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_correct_answer_format;

ALTER TABLE public.questions
  ADD CONSTRAINT questions_correct_answer_format
  CHECK (correct_answer ~ '^[a-z](,[a-z])*$');

COMMENT ON COLUMN public.questions.correct_answer IS
  'Letras de las opciones correctas, minúsculas, ordenadas y separadas por coma. Una sola: "c". Varias: "a,e".';

-- ---------------------------------------------------------------------
-- 3. Importación atómica de un examen completo.
--
--    Todo ocurre dentro de la transacción implícita de la función: si
--    algo falla, no queda nada a medias. Reemplaza por completo las
--    preguntas del examen cuando el título ya existe.
--
--    SECURITY DEFINER para poder escribir sin depender de que el RLS
--    del llamador cubra cada tabla, pero con el chequeo de admin
--    explícito como primera instrucción.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.import_exam(
  p_exam      JSONB,
  p_questions JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_exam_id     INTEGER;
  v_action      TEXT;
  v_title       TEXT := TRIM(p_exam ->> 'title');
  v_difficulty  TEXT := INITCAP(COALESCE(p_exam ->> 'difficulty', 'Foundation'));
  v_count       INTEGER;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'NOT_ADMIN: solo un administrador puede importar exámenes';
  END IF;

  IF v_title IS NULL OR v_title = '' THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: el examen no tiene título';
  END IF;

  IF p_questions IS NULL OR jsonb_typeof(p_questions) <> 'array'
     OR jsonb_array_length(p_questions) = 0 THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: el examen "%" no trae preguntas', v_title;
  END IF;

  IF v_difficulty NOT IN ('Foundation', 'Advanced', 'Expert') THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: dificultad inválida "%"', v_difficulty;
  END IF;

  -- Buscar por título exacto (misma regla que usaba el importador).
  SELECT id INTO v_exam_id
    FROM public.exams
   WHERE title = v_title;

  IF v_exam_id IS NULL THEN
    INSERT INTO public.exams (
      title, description, category, difficulty,
      duration_minutes, passing_score, total_questions, is_active
    )
    VALUES (
      v_title,
      p_exam ->> 'description',
      COALESCE(p_exam ->> 'category', 'ISTQB'),
      v_difficulty,
      (p_exam ->> 'duration_minutes')::INTEGER,
      (p_exam ->> 'passing_score')::INTEGER,
      jsonb_array_length(p_questions),
      TRUE
    )
    RETURNING id INTO v_exam_id;

    v_action := 'created';
  ELSE
    UPDATE public.exams
       SET description      = p_exam ->> 'description',
           category         = COALESCE(p_exam ->> 'category', 'ISTQB'),
           difficulty       = v_difficulty,
           duration_minutes = (p_exam ->> 'duration_minutes')::INTEGER,
           passing_score    = (p_exam ->> 'passing_score')::INTEGER,
           total_questions  = jsonb_array_length(p_questions),
           is_active        = TRUE
     WHERE id = v_exam_id;

    -- Si esto falla, la excepción aborta toda la función: nunca se
    -- insertan preguntas nuevas encima de las viejas.
    DELETE FROM public.questions WHERE exam_id = v_exam_id;

    v_action := 'updated';
  END IF;

  INSERT INTO public.questions (
    exam_id, question_type, question_text, question_image_url,
    options, correct_answer, explanation, explanation_video_url, order_index
  )
  SELECT
    v_exam_id,
    COALESCE(q ->> 'question_type', 'text'),
    q ->> 'question_text',
    NULLIF(q ->> 'question_image_url', ''),
    q -> 'options',
    q ->> 'correct_answer',
    q ->> 'explanation',
    NULLIF(q ->> 'explanation_video_url', ''),
    (q ->> 'order_index')::INTEGER
  FROM jsonb_array_elements(p_questions) AS q;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'exam_id',   v_exam_id,
    'action',    v_action,
    'questions', v_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_exam(JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_exam(JSONB, JSONB) TO authenticated;
