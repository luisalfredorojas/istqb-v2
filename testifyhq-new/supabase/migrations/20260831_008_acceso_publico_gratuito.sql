-- =====================================================================
-- Todo el contenido pasa a ser público y gratuito
--
-- Se retira el modelo freemium por completo: no hay planes, ni pasarela de
-- pago, ni cuentas de usuario en el sitio público. Cualquiera puede leer
-- todos los exámenes y sus preguntas sin iniciar sesión, y el progreso se
-- guarda en el navegador del visitante (localStorage), no en la base.
--
-- Lo único que sigue necesitando sesión es la administración del contenido,
-- que se mantiene tal cual: `is_admin()` + las políticas "Admins manage ...".
--
-- Es seguro re-ejecutarla.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Lectura pública de exámenes y preguntas
--    Revierte el gating por entitlement de 20260810_002_api_gating.sql.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Questions readable by entitlement" ON public.questions;
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Exams are viewable by everyone" ON public.exams;
CREATE POLICY "Exams are viewable by everyone"
  ON public.exams FOR SELECT
  USING (true);

-- Restos de fix_rls.sql: permitían insertar contenido a cualquiera.
-- No tienen nada que ver con el acceso gratuito y siguen sin deber existir.
DROP POLICY IF EXISTS "Allow all inserts for exams"     ON public.exams;
DROP POLICY IF EXISTS "Allow all inserts for questions" ON public.questions;

-- La lectura es anónima; asegúrate de que el rol anon puede llegar a la tabla.
GRANT SELECT ON public.exams     TO anon, authenticated;
GRANT SELECT ON public.questions TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Fuera el refuerzo del plan gratuito sobre los intentos
-- ---------------------------------------------------------------------
DROP TRIGGER  IF EXISTS trg_enforce_free_plan ON public.user_exam_attempts;
DROP FUNCTION IF EXISTS public.enforce_free_plan_on_attempt();

-- ---------------------------------------------------------------------
-- 3. `exams.is_free` deja de tener sentido: todos lo son
--    Se elimina la columna y la regla que decidía su valor. `import_exam`
--    se recrea sin ella (idéntica por lo demás a la de la migración 007).
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
    INSERT INTO public.exams (
      title, description, category, difficulty, language,
      duration_minutes, passing_score, total_questions, is_active
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
      TRUE
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

DROP FUNCTION IF EXISTS public.exam_is_free_by_default(TEXT, TEXT);
ALTER TABLE public.exams DROP COLUMN IF EXISTS is_free;

-- ---------------------------------------------------------------------
-- 4. Fuera suscripciones y pagos
--
--    La política de `users` bloqueaba las columnas de facturación, así que
--    hay que retirarla antes de poder eliminarlas. Se sustituye por la
--    regla llana: cada uno edita su propia fila.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile (no billing)" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile (limited)"    ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"              ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP FUNCTION IF EXISTS public.has_premium_access(UUID);

DROP INDEX IF EXISTS public.idx_users_provider_subscription;
DROP INDEX IF EXISTS public.idx_users_provider_customer;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_provider,
  DROP COLUMN IF EXISTS provider_customer_id,
  DROP COLUMN IF EXISTS provider_subscription_id,
  DROP COLUMN IF EXISTS subscription_plan,
  DROP COLUMN IF EXISTS subscription_current_period_end,
  DROP COLUMN IF EXISTS is_lifetime,
  DROP COLUMN IF EXISTS subscription_updated_at;

-- Histórico de pedidos: sin pasarela de pago no hay nada que registrar.
DROP TABLE IF EXISTS public.payment_orders;

-- Desistimiento (Directiva UE 2023/2673): solo aplica a contratos de pago.
DROP TABLE IF EXISTS public.withdrawal_requests;
