-- =====================================================================
-- Suscripciones y pagos (Merchant of Record: Lemon Squeezy / Paddle)
-- Idempotente: seguro de re-ejecutar. La capa de datos es agnóstica al
-- proveedor; solo cambian las Edge Functions si se sustituye la MoR.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Campos de suscripción en public.users
--    (la tabla ya existe en producción; añadimos columnas de forma segura)
-- ---------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier   TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT
    CHECK (subscription_status IN (
      'active', 'trialing', 'past_due', 'paused', 'cancelled', 'expired'
    )),
  ADD COLUMN IF NOT EXISTS subscription_provider           TEXT,   -- 'lemonsqueezy' | 'paddle' | ...
  ADD COLUMN IF NOT EXISTS provider_customer_id            TEXT,
  ADD COLUMN IF NOT EXISTS provider_subscription_id        TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan               TEXT,   -- 'monthly' | 'yearly' | 'lifetime'
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_lifetime                     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_updated_at         TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_provider_subscription
  ON public.users (provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_provider_customer
  ON public.users (provider_customer_id);

-- ---------------------------------------------------------------------
-- 2. Tabla payment_orders (histórico de intentos y pagos)
--    Reemplaza el esquema antiguo específico de Payphone por campos
--    genéricos de proveedor.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type      TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  amount         NUMERIC(10, 2),                 -- importe base (sin impuestos), informativo
  currency       TEXT NOT NULL DEFAULT 'EUR',
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  provider              TEXT NOT NULL DEFAULT 'lemonsqueezy',
  provider_checkout_id  TEXT,                    -- id/URL del checkout creado
  provider_order_id     TEXT,                    -- id del pedido/orden en la MoR
  provider_subscription_id TEXT,                 -- si el pago genera suscripción
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user
  ON public.payment_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_provider_order
  ON public.payment_orders (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status
  ON public.payment_orders (status);

-- ---------------------------------------------------------------------
-- 3. RLS de payment_orders
--    El usuario puede LEER sus propias órdenes. Solo el service_role
--    (Edge Functions) puede insertar/actualizar; RLS no aplica a
--    service_role, así que no hacen falta políticas de escritura.
-- ---------------------------------------------------------------------
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment orders" ON public.payment_orders;
CREATE POLICY "Users can view own payment orders"
  ON public.payment_orders FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4. Blindar subscription_* frente a manipulación desde el cliente.
--    Solo el service_role (Edge Functions) puede cambiar el tier/estado.
--    Reescribe la política previa de restrict_subscription_updates.sql
--    para cubrir todas las columnas nuevas.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile"           ON public.users;
DROP POLICY IF EXISTS "Users can update own profile (limited)" ON public.users;

CREATE POLICY "Users can update own profile (no billing)"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Ninguna columna de facturación puede cambiar desde el cliente:
    AND subscription_tier            IS NOT DISTINCT FROM (SELECT u.subscription_tier            FROM public.users u WHERE u.id = auth.uid())
    AND subscription_status          IS NOT DISTINCT FROM (SELECT u.subscription_status          FROM public.users u WHERE u.id = auth.uid())
    AND subscription_provider        IS NOT DISTINCT FROM (SELECT u.subscription_provider        FROM public.users u WHERE u.id = auth.uid())
    AND provider_customer_id         IS NOT DISTINCT FROM (SELECT u.provider_customer_id         FROM public.users u WHERE u.id = auth.uid())
    AND provider_subscription_id     IS NOT DISTINCT FROM (SELECT u.provider_subscription_id     FROM public.users u WHERE u.id = auth.uid())
    AND subscription_plan            IS NOT DISTINCT FROM (SELECT u.subscription_plan            FROM public.users u WHERE u.id = auth.uid())
    AND subscription_current_period_end IS NOT DISTINCT FROM (SELECT u.subscription_current_period_end FROM public.users u WHERE u.id = auth.uid())
    AND is_lifetime                  IS NOT DISTINCT FROM (SELECT u.is_lifetime                  FROM public.users u WHERE u.id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- 5. Helper: ¿tiene el usuario acceso premium ahora mismo?
--    Premium = lifetime, o suscripción activa/en periodo vigente.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_premium_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT
        u.is_lifetime
        OR (
          u.subscription_tier = 'premium'
          -- 'cancelled' sigue vigente hasta fin de periodo (no renovará);
          -- 'past_due' mantiene acceso durante el periodo de gracia.
          AND u.subscription_status IN ('active', 'trialing', 'cancelled', 'past_due')
          AND (
            u.subscription_current_period_end IS NULL
            OR u.subscription_current_period_end > NOW()
          )
        )
      FROM public.users u
      WHERE u.id = p_user_id
    ),
    FALSE
  );
$$;
