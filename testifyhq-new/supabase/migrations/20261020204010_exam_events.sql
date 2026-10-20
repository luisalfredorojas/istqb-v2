-- =====================================================================
-- Estadísticas anónimas de uso de los exámenes
--
-- Sin cuentas, el progreso vive en el navegador de cada persona y la base
-- no sabe qué exámenes se practican. Esta tabla recibe un aviso anónimo
-- cuando alguien empieza o termina un simulacro: qué examen, y al terminar,
-- la nota y el tiempo. No guarda respuestas, IP ni ningún identificador del
-- visitante, así que no se puede saber quién hizo qué.
--
-- Los visitantes solo pueden insertar; leer es cosa del administrador.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.exam_events (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exam_id            integer NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  event              text    NOT NULL CHECK (event IN ('started', 'completed')),
  -- Solo en 'completed'.
  score              smallint CHECK (score BETWEEN 0 AND 100),
  passed             boolean,
  time_spent_seconds integer CHECK (time_spent_seconds BETWEEN 0 AND 86400),
  -- Simulacros que este navegador ya había terminado antes (de cualquier
  -- examen). Distingue a quien prueba una vez de quien vuelve a practicar.
  prior_attempts     smallint CHECK (prior_attempts BETWEEN 0 AND 1000),
  created_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (event = 'started'   AND score IS NULL AND passed IS NULL AND time_spent_seconds IS NULL)
    OR
    (event = 'completed' AND score IS NOT NULL AND passed IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS exam_events_exam_created_idx
  ON public.exam_events (exam_id, created_at);

ALTER TABLE public.exam_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone records exam events" ON public.exam_events;
CREATE POLICY "Anyone records exam events"
  ON public.exam_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read exam events" ON public.exam_events;
CREATE POLICY "Admins read exam events"
  ON public.exam_events FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

GRANT INSERT ON public.exam_events TO anon, authenticated;
GRANT SELECT ON public.exam_events TO authenticated;

-- ---------------------------------------------------------------------
-- Resumen por examen para el panel de administración.
-- security_invoker hace que la vista respete el RLS de quien consulta:
-- un visitante anónimo obtiene cero filas.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.exam_event_stats
WITH (security_invoker = true) AS
SELECT
  e.id                                                         AS exam_id,
  e.title,
  e.language,
  count(ev.id) FILTER (WHERE ev.event = 'started')             AS started,
  count(ev.id) FILTER (WHERE ev.event = 'completed')           AS completed,
  count(ev.id) FILTER (WHERE ev.event = 'started'
                        AND ev.created_at > now() - interval '7 days')  AS started_7d,
  count(ev.id) FILTER (WHERE ev.event = 'started'
                        AND ev.created_at > now() - interval '30 days') AS started_30d,
  round(avg(ev.score) FILTER (WHERE ev.event = 'completed'))   AS avg_score,
  round(100.0 * count(ev.id) FILTER (WHERE ev.passed)
        / nullif(count(ev.id) FILTER (WHERE ev.event = 'completed'), 0)) AS pass_rate,
  count(ev.id) FILTER (WHERE ev.event = 'completed'
                        AND ev.prior_attempts >= 2)            AS completed_by_returning,
  max(ev.created_at)                                           AS last_event_at
FROM public.exams e
LEFT JOIN public.exam_events ev ON ev.exam_id = e.id
GROUP BY e.id, e.title, e.language;

GRANT SELECT ON public.exam_event_stats TO authenticated;
