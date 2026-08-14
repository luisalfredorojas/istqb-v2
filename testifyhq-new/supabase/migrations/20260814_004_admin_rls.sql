-- =====================================================================
-- Gestión de contenido por administradores mediante RLS
--
-- Motivo: el panel de administración usaba la clave service_role desde el
-- navegador (VITE_SUPABASE_SERVICE_ROLE_KEY), que Vite incrusta en el
-- bundle público. Eso exponía una clave capaz de saltarse todo el RLS.
--
-- Con estas políticas, un administrador autenticado puede gestionar el
-- contenido con su propia sesión, sin necesidad de la clave service_role.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Eliminar las políticas permisivas heredadas de la migración inicial
--    ("WITH CHECK (true)" permitía a cualquiera insertar exámenes o
--    preguntas, incluso sin ser administrador).
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all inserts for exams"            ON public.exams;
DROP POLICY IF EXISTS "Allow all inserts for questions"        ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can insert exams"   ON public.exams;
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON public.questions;

-- ---------------------------------------------------------------------
-- 2. Los administradores gestionan todo el contenido (CRUD completo).
--    Las políticas de SELECT existentes se mantienen, así que la lectura
--    pública de exámenes y el gating por entitlement de las preguntas
--    siguen funcionando igual (las políticas se combinan con OR).
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage exams" ON public.exams;
CREATE POLICY "Admins manage exams"
  ON public.exams FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
CREATE POLICY "Admins manage questions"
  ON public.questions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
