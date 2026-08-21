-- =====================================================================
-- Exámenes en dos idiomas (inglés / español)
--
-- Cada examen existe como una fila independiente por idioma: los JSON
-- traducidos se importan igual que los originales y quedan como exámenes
-- separados. Se eligió esto en vez de columnas traducidas dentro de la
-- misma fila porque las preguntas ya se guardan en `questions` con su
-- propio texto y opciones: duplicar la fila del examen no obliga a tocar
-- ni el modelo de preguntas ni las consultas existentes, y los intentos
-- históricos siguen apuntando al examen que el usuario realmente hizo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columna de idioma. Todo lo que ya existe está en inglés.
-- ---------------------------------------------------------------------
ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_language_check;

UPDATE public.exams
   SET language = 'en'
 WHERE language IS NULL
    OR language NOT IN ('en', 'es');

ALTER TABLE public.exams
  ADD CONSTRAINT exams_language_check CHECK (language IN ('en', 'es'));

COMMENT ON COLUMN public.exams.language IS
  'Idioma del contenido del examen (enunciados y opciones): "en" o "es". El listado filtra por esta columna.';

-- El listado siempre filtra por idioma sobre exámenes activos.
CREATE INDEX IF NOT EXISTS exams_language_active_idx
  ON public.exams (language, is_active);

-- ---------------------------------------------------------------------
-- 2. Identidad del examen = (título, idioma).
--
--    Antes el importador buscaba por título exacto. Una traducción tiene
--    un título distinto, así que en la práctica ya no colisionaría; pero
--    dejarlo dependiendo solo del título haría que dos idiomas con el
--    mismo título se pisaran entre sí. La clave incluye el idioma.
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS exams_title_language_key
  ON public.exams (title, language);

-- ---------------------------------------------------------------------
-- 3. Regla del plan gratuito, en un solo sitio.
--
--    OJO con la regla original de 20260810_001_free_exams.sql: era
--    `title ILIKE '%Exam A%'` a secas. Cuando se escribió, los únicos
--    exámenes eran los de Foundation, así que funcionaba. Hoy ya no: el
--    CTAL-TA se llama "... (CTAL-TA) v4.1 - Exam A" y el de automatización
--    "... v2.0 - Exam A", de modo que re-ejecutar aquella regla convertiría
--    en gratuitos dos exámenes Advanced de pago. Ambos se importaron
--    después de aquella migración, y por eso hoy siguen correctamente en
--    is_free = FALSE.
--
--    Acotada a Foundation y encapsulada para que la usen tanto esta
--    migración como `import_exam`: así una traducción recién importada
--    nace con el mismo is_free que su original, sin depender de que
--    alguien se acuerde de marcarla a mano.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.exam_is_free_by_default(
  p_title      TEXT,
  p_difficulty TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT COALESCE(p_difficulty, 'Foundation') = 'Foundation'
     AND (p_title ILIKE '%Exam A%' OR p_title ILIKE '%Examen A%')
     AND p_title NOT ILIKE '%Extra%';
$$;

COMMENT ON FUNCTION public.exam_is_free_by_default(TEXT, TEXT) IS
  'Regla del plan gratuito: solo el Examen A de Foundation, en cualquier idioma. Excluye la variante "Extra" y todos los exámenes Advanced.';


-- ---------------------------------------------------------------------
-- 4. `import_exam` acepta y respeta el idioma del payload.
--    Sin `language` en el payload asume 'en', que es lo que había.
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
  v_language    TEXT := LOWER(COALESCE(NULLIF(TRIM(p_exam ->> 'language'), ''), 'en'));
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

  IF v_language NOT IN ('en', 'es') THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: idioma inválido "%"', v_language;
  END IF;

  -- Buscar por título e idioma: la versión traducida de un examen es un
  -- examen distinto y nunca debe sobrescribir al original.
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

-- ---------------------------------------------------------------------
-- 5. Aplicar la regla a los exámenes que ya existen.
--    Solo marca gratuitos; no revoca nada. Un examen liberado a mano
--    desde el panel sigue siéndolo, que es lo que se esperaría.
-- ---------------------------------------------------------------------
UPDATE public.exams
   SET is_free = TRUE
 WHERE public.exam_is_free_by_default(title, difficulty)
   AND is_free IS DISTINCT FROM TRUE;
