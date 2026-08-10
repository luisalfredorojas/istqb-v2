-- =====================================================================
-- Refuerzo del freemium a nivel de API (defensa en profundidad)
-- El gating de la UI no es suficiente: las preguntas eran de lectura
-- pública. Aquí lo movemos a la base de datos con RLS + trigger, de modo
-- que ningún cliente pueda saltárselo llamando directamente a la API.
--
-- Reglas:
--   1. Sin Premium solo se pueden LEER preguntas de exámenes is_free.
--   2. Sin Premium solo se pueden GUARDAR intentos de exámenes is_free
--      y como máximo FREE_ATTEMPT_LIMIT (2) en total.
-- Premium y administradores no tienen restricciones.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: ¿es admin el usuario?
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id AND u.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- 1. RLS en questions: restringe la lectura por entitlement
--    Reemplaza la política pública "USING (true)".
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
DROP POLICY IF EXISTS "Questions readable by entitlement" ON public.questions;

CREATE POLICY "Questions readable by entitlement"
  ON public.questions
  FOR SELECT
  USING (
    -- Preguntas de exámenes gratuitos: visibles para cualquiera.
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = questions.exam_id AND e.is_free
    )
    -- Usuarios Premium (o de por vida) ven todo.
    OR public.has_premium_access(auth.uid())
    -- Los administradores gestionan todo el contenido.
    OR public.is_admin(auth.uid())
  );

-- ---------------------------------------------------------------------
-- 2. Trigger en user_exam_attempts: refuerza plan gratuito al escribir
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_free_plan_on_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_attempt_limit CONSTANT INTEGER := 2;
  exam_is_free BOOLEAN;
  existing_attempts INTEGER;
BEGIN
  -- Premium/lifetime y admins: sin restricciones.
  IF public.has_premium_access(NEW.user_id) OR public.is_admin(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  -- Regla 1: sin Premium solo exámenes gratuitos.
  SELECT e.is_free INTO exam_is_free
  FROM public.exams e
  WHERE e.id = NEW.exam_id;

  IF exam_is_free IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'PREMIUM_REQUIRED: este examen requiere una suscripción Premium'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Regla 2: máximo FREE_ATTEMPT_LIMIT simulacros en total.
  SELECT COUNT(*) INTO existing_attempts
  FROM public.user_exam_attempts a
  WHERE a.user_id = NEW.user_id;

  IF existing_attempts >= free_attempt_limit THEN
    RAISE EXCEPTION 'FREE_LIMIT_REACHED: has alcanzado el máximo de % simulacros gratuitos', free_attempt_limit
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_plan ON public.user_exam_attempts;
CREATE TRIGGER trg_enforce_free_plan
  BEFORE INSERT ON public.user_exam_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_plan_on_attempt();
