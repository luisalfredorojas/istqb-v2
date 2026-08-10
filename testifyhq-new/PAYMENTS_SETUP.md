# Pasarela de pago — Lemon Squeezy (España + LatAm)

Integración de suscripciones (mensual/anual) y pago único (lifetime) mediante
**Lemon Squeezy** como *Merchant of Record*: ellos gestionan el IVA español,
el IVA OSS de la UE y los impuestos de LatAm, más facturación y fraude.

La **capa de datos es agnóstica del proveedor**: si algún día migras a Paddle
u otra MoR, solo cambian las dos Edge Functions.

---

## Arquitectura

```
PricingPage → create-checkout (Edge Fn) → Lemon Squeezy (checkout hospedado)
                                              │
                        webhook (firma HMAC) ─┘→ actualiza users + payment_orders
                                              │
PaymentSuccessPage (polling hasta premium) ←──┘
```

## Archivos añadidos / modificados

| Archivo | Rol |
|---|---|
| `supabase/migrations/20260810_000_subscriptions_payments.sql` | Columnas de suscripción en `users`, tabla `payment_orders`, RLS y `has_premium_access()` |
| `supabase/migrations/20260810_001_free_exams.sql` | Columna `is_free` en `exams`; marca el Examen A como gratuito |
| `src/hooks/useExamAccess.ts` | Reglas del plan gratuito (solo Examen A, máx. 2 simulacros) |
| `supabase/functions/create-checkout/index.ts` | Crea el checkout y devuelve la URL |
| `supabase/functions/lemonsqueezy-webhook/index.ts` | Verifica firma y sincroniza estado |
| `supabase/functions/_shared/{cors,plans}.ts` | Utilidades compartidas |
| `src/lib/payments.ts` | Cliente: catálogo de planes + `createCheckout()` |
| `src/hooks/useSubscription.ts` | Estado de suscripción del usuario |
| `src/pages/PricingPage.tsx` | Página de planes Premium |
| `src/pages/DonatePage.tsx` | Donación Donorbox (antes en PricingPage) |
| `src/pages/PaymentSuccessPage.tsx` | Confirmación tras el pago (ya enrutada) |

---

## Puesta en marcha

### 1. Aplicar la migración

```bash
supabase db push
# o pega el SQL de la migración en el editor SQL de Supabase.
```

### 2. Configurar Lemon Squeezy

1. Crea una cuenta y una **Store** en https://app.lemonsqueezy.com
2. Crea un **producto** con tres variantes:
   - Suscripción **mensual** (recurring, monthly)
   - Suscripción **anual** (recurring, yearly)
   - **Lifetime** (single payment / one-time)
3. Anota el **Store ID** y los tres **Variant ID** (URL de cada variante).
4. En **Settings → API** genera una **API key**.
5. En **Settings → Webhooks** crea un endpoint:
   - URL: `https://<project-ref>.supabase.co/functions/v1/lemonsqueezy-webhook`
   - Firma: genera un *signing secret* (lo usarás como `LEMONSQUEEZY_WEBHOOK_SECRET`).
   - Eventos: `order_created`, `subscription_created`, `subscription_updated`,
     `subscription_cancelled`, `subscription_expired`, `subscription_paused`,
     `subscription_unpaused`, `subscription_payment_success`,
     `subscription_payment_failed`.

### 3. Secrets de las Edge Functions

```bash
supabase secrets set \
  LEMONSQUEEZY_API_KEY=... \
  LEMONSQUEEZY_STORE_ID=... \
  LEMONSQUEEZY_WEBHOOK_SECRET=... \
  LEMONSQUEEZY_VARIANT_MONTHLY=... \
  LEMONSQUEEZY_VARIANT_YEARLY=... \
  LEMONSQUEEZY_VARIANT_LIFETIME=... \
  APP_URL=https://testifyhq.com
```

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase; no hay
> que declararlos.

### 4. Desplegar las funciones

```bash
# create-checkout requiere JWT (usuario autenticado)
supabase functions deploy create-checkout

# el webhook NO lleva JWT de Supabase: se valida con la firma de Lemon Squeezy
supabase functions deploy lemonsqueezy-webhook --no-verify-jwt
```

### 5. Ajustar precios

Los precios visibles están en `src/lib/payments.ts` (`PLANS`). El importe real
con impuestos lo calcula Lemon Squeezy según el país del comprador; mantén estos
valores alineados con los de tus variantes.

---

## Probar el flujo

1. Activa **Test mode** en Lemon Squeezy y usa las variantes de prueba.
2. Inicia sesión en la app → `/pricing` → elige un plan.
3. Completa el checkout con una tarjeta de prueba.
4. Serás redirigido a `/payment/success`, que hace *polling* hasta que el
   webhook marque `subscription_tier = 'premium'`.
5. Comprueba en Supabase: fila en `payment_orders` (`completed`) y campos
   `subscription_*` del usuario actualizados.

## Plan gratuito (freemium)

Reglas aplicadas para usuarios **sin Premium** (en `src/hooks/useExamAccess.ts`):

- Solo pueden practicar exámenes marcados `is_free = true` → **únicamente el Examen A**.
- Máximo **2 simulacros** completados en total (`FREE_ATTEMPT_LIMIT`).

Para cambiar qué exámenes son gratis, actualiza `is_free` en la tabla `exams`
(desde SQL o el panel de admin); no hace falta tocar código. Para cambiar el
límite de simulacros, edita `FREE_ATTEMPT_LIMIT`.

### Refuerzo a nivel de API (migración `..._002_api_gating.sql`)

El gating no es solo de UI: está reforzado en la base de datos, así que no se
puede saltar llamando a la API directamente.

- **RLS en `questions`**: sin Premium solo se pueden leer preguntas de exámenes
  `is_free`. Premium/lifetime y administradores ven todo.
- **Trigger en `user_exam_attempts`**: rechaza guardar un intento si el usuario
  no-Premium (a) usa un examen no gratuito → error `PREMIUM_REQUIRED`, o
  (b) supera los 2 simulacros → error `FREE_LIMIT_REACHED`. El frontend detecta
  estos errores y redirige a `/pricing`.

Funciones auxiliares: `has_premium_access(uuid)` e `is_admin(uuid)`.

## Notas de seguridad

- El cliente **no puede** modificar `subscription_tier` ni ningún campo de
  facturación (bloqueado por RLS en la migración). Solo el `service_role` de las
  Edge Functions escribe esos campos.
- La firma del webhook se verifica en tiempo constante (HMAC-SHA256).
- Una suscripción **cancelada** conserva el acceso hasta fin de periodo; una
  **expirada** vuelve a `free`.

## Alternativa: Paddle

Si prefieres Paddle, la migración y el frontend sirven igual. Habría que
reescribir `create-checkout` (Paddle usa *transactions*/*Paddle.js*) y el
webhook (firma `Paddle-Signature`, eventos `subscription.*`/`transaction.*`).
