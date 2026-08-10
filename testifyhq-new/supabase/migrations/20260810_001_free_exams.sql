-- =====================================================================
-- Control de acceso por examen (freemium)
-- Marca qué exámenes son accesibles sin Premium. Por defecto ninguno lo es;
-- solo el "Exam A" queda gratuito. Cambiar qué exámenes son gratis es tan
-- simple como actualizar esta columna (o desde el panel de admin).
-- =====================================================================

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT FALSE;

-- El Examen A es el único gratuito (excluye la variante "Extra").
UPDATE public.exams
  SET is_free = TRUE
  WHERE title ILIKE '%Exam A%'
    AND title NOT ILIKE '%Extra%';

-- Asegura que el resto quede como premium (idempotente si se re-ejecuta).
UPDATE public.exams
  SET is_free = FALSE
  WHERE NOT (title ILIKE '%Exam A%' AND title NOT ILIKE '%Extra%');
