-- =====================================================================
-- Solicitudes de desistimiento (Directiva UE 2023/2673)
-- Obligatorio desde el 19/06/2026: el consumidor debe poder desistir con
-- un botón permanente y recibir un acuse de recibo automático con fecha,
-- hora y contenido de la solicitud.
--
-- Esta tabla es el registro probatorio de esas solicitudes.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Puede ser NULL: la ley no permite exigir que el consumidor
  -- inicie sesión para ejercer el desistimiento.
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  order_reference  TEXT,
  message          TEXT,
  -- Momento exacto del acuse de recibo (fecha y hora).
  acknowledged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Copia literal de lo enviado, como prueba del "contenido" acusado.
  content_snapshot JSONB,
  status           TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'processing', 'completed', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user
  ON public.withdrawal_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_email
  ON public.withdrawal_requests (email);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede enviar una solicitud (no se puede exigir login).
DROP POLICY IF EXISTS "Anyone can submit a withdrawal request" ON public.withdrawal_requests;
CREATE POLICY "Anyone can submit a withdrawal request"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (
    -- Si se envía autenticado, el user_id debe ser el suyo.
    user_id IS NULL OR user_id = auth.uid()
  );

-- El usuario puede consultar sus propias solicitudes; el admin, todas.
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
