-- =====================================================================
-- Corrige los exámenes en español que quedaron marcados como inglés
--
-- Qué pasó: la importación se hizo desde una pestaña que todavía tenía el
-- bundle anterior al despliegue. Ese JavaScript no conocía el campo
-- `language`, así que lo omitió del payload e `import_exam` aplicó su valor
-- por defecto ('en'). Las preguntas se importaron perfectamente en español;
-- lo único incorrecto es la columna `language` de los 7 exámenes, que los
-- dejaba fuera del listado en español y mezclados con los ingleses.
--
-- No hace falta reimportar: basta con corregir la columna.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Reclasificar los exámenes traducidos.
--    El sufijo "(Español)" del título es la marca que llevan las siete
--    traducciones y ningún examen original.
-- ---------------------------------------------------------------------
UPDATE public.exams
   SET language = 'es'
 WHERE title LIKE '%(Español)%'
   AND language IS DISTINCT FROM 'es';

-- ---------------------------------------------------------------------
-- 2. Que un cliente desactualizado no pueda volver a colar exámenes en el
--    idioma equivocado.
--
--    Hasta ahora un payload sin `language` caía en el default 'en'. Esa
--    tolerancia solo puede dispararla un bundle viejo: el importador actual
--    siempre manda el campo, porque `buildExam` lo resuelve a 'en' cuando el
--    JSON no trae `idioma`. Por tanto rechazarlo no rompe ningún flujo
--    legítimo y convierte un fallo silencioso —datos mal archivados que
--    parecen correctos— en un error visible en el acto.
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
  v_language    TEXT := LOWER(NULLIF(TRIM(p_exam ->> 'language'), ''));
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

  IF v_language IS NULL THEN
    RAISE EXCEPTION
      'STALE_CLIENT: el importador no envió el idioma. Recarga la página con Cmd+Shift+R y vuelve a intentarlo.';
  END IF;

  IF v_language NOT IN ('en', 'es') THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: idioma inválido "%"', v_language;
  END IF;

  SELECT id INTO v_exam_id
    FROM public.exams
   WHERE title = v_title
     AND language = v_language;

  IF v_exam_id IS NULL THEN
    -- `is_free` solo se fija al crear. En una reimportación se respeta lo
    -- que haya decidido el panel, que manda sobre la regla por defecto.
    INSERT INTO public.exams (
      title, description, category, difficulty, language,
      duration_minutes, passing_score, total_questions, is_active, is_free
    )
    VALUES (
      v_title,
      p_exam ->> 'description',
      COALESCE(p_exam ->> 'category', 'ISTQB'),
      v_difficulty,
      v_language,
      (p_exam ->> 'duration_minutes')::INTEGER,
      (p_exam ->> 'passing_score')::INTEGER,
      jsonb_array_length(p_questions),
      TRUE,
      public.exam_is_free_by_default(v_title, v_difficulty)
    )
    RETURNING id INTO v_exam_id;

    v_action := 'created';
  ELSE
    UPDATE public.exams
       SET description      = p_exam ->> 'description',
           category         = COALESCE(p_exam ->> 'category', 'ISTQB'),
           difficulty       = v_difficulty,
           language         = v_language,
           duration_minutes = (p_exam ->> 'duration_minutes')::INTEGER,
           passing_score    = (p_exam ->> 'passing_score')::INTEGER,
           total_questions  = jsonb_array_length(p_questions),
           is_active        = TRUE
     WHERE id = v_exam_id;

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
    'language',  v_language,
    'questions', v_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_exam(JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_exam(JSONB, JSONB) TO authenticated;
