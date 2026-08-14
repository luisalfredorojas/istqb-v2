// Edge Function: lemonsqueezy-webhook
// Recibe los eventos de Lemon Squeezy, verifica la firma HMAC y sincroniza
// el estado de suscripción/pago del usuario en la base de datos.
//
// Configura este endpoint en Lemon Squeezy → Settings → Webhooks:
//   URL: https://<project-ref>.supabase.co/functions/v1/lemonsqueezy-webhook
//   Eventos: order_created, subscription_created, subscription_updated,
//            subscription_cancelled, subscription_expired, subscription_paused,
//            subscription_unpaused, subscription_payment_success,
//            subscription_payment_failed
//
// IMPORTANTE: despliega esta función con --no-verify-jwt (el webhook no lleva
// JWT de Supabase; la autenticidad se valida con la firma de Lemon Squeezy).
//
// Secrets requeridos:
//  - LEMONSQUEEZY_WEBHOOK_SECRET
//  - LEMONSQUEEZY_VARIANT_LIFETIME (opcional, para clasificar pagos únicos)
//  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectados por Supabase)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Verificación de firma (HMAC-SHA256 sobre el body crudo) -----------
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifySignature(
  secret: string,
  rawBody: string,
  signature: string,
): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  return timingSafeEqualHex(toHex(mac), signature.toLowerCase());
}

// --- Mapeo de estados de Lemon Squeezy → nuestro esquema ---------------
function mapStatus(lsStatus: string): string {
  switch (lsStatus) {
    case "on_trial":
      return "trialing";
    case "active":
      return "active";
    case "paused":
      return "paused";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "active";
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET");
  if (!secret) {
    console.error("Falta LEMONSQUEEZY_WEBHOOK_SECRET");
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature") ?? "";

  const valid = await verifySignature(secret, rawBody, signature);
  if (!valid) {
    console.warn("Firma de webhook inválida");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? "";
  const custom = payload?.meta?.custom_data ?? {};
  const userId: string | undefined = custom?.user_id;
  const orderId: string | undefined = custom?.order_id; // fila en payment_orders
  const customPlan: string | undefined = custom?.plan;

  const attrs = payload?.data?.attributes ?? {};
  const resourceId: string | undefined = payload?.data?.id; // id de suscripción/orden

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Actualiza (si existe) la fila de payment_orders asociada al checkout.
  // Es un closure para no tener que tipar el cliente como parámetro: el tipo
  // que devuelve createClient no es estable entre versiones de supabase-js.
  const markOrder = async (fields: Record<string, unknown>): Promise<void> => {
    if (!orderId) return;
    await admin
      .from("payment_orders")
      .update({ ...fields, completed_at: new Date().toISOString() } as never)
      .eq("id", orderId);
  };

  // Sin user_id no podemos vincular el evento a una cuenta.
  if (!userId) {
    console.warn("Webhook sin custom_data.user_id", { eventName });
    return new Response("OK (sin user_id)", { status: 200 });
  }

  try {
    switch (eventName) {
      // ---------------- PAGO ÚNICO (lifetime) ----------------
      case "order_created": {
        // Las suscripciones también generan una 'order'; solo tratamos aquí
        // el pago único de acceso de por vida.
        const lifetimeVariant = Deno.env.get("LEMONSQUEEZY_VARIANT_LIFETIME");
        const orderVariant = String(attrs?.first_order_item?.variant_id ?? "");
        const isLifetime = customPlan === "lifetime" ||
          (lifetimeVariant && orderVariant === lifetimeVariant);

        if (!isLifetime) break; // suscripción: lo maneja subscription_created

        if (attrs?.status === "paid") {
          await admin
            .from("users")
            .update({
              subscription_tier: "premium",
              subscription_status: "active",
              subscription_provider: "lemonsqueezy",
              subscription_plan: "lifetime",
              is_lifetime: true,
              provider_customer_id: String(attrs?.customer_id ?? ""),
              subscription_current_period_end: null,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          await markOrder({
            status: "completed",
            provider_order_id: resourceId,
          });
        }
        break;
      }

      // ---------------- SUSCRIPCIÓN creada/actualizada ----------------
      case "subscription_created":
      case "subscription_updated":
      case "subscription_unpaused":
      case "subscription_payment_success": {
        const status = mapStatus(attrs?.status ?? "active");
        const periodEnd: string | null = attrs?.ends_at ?? attrs?.renews_at ??
          null;
        const plan = customPlan === "yearly" || customPlan === "monthly"
          ? customPlan
          : null;

        const isPremium = ["active", "trialing", "cancelled", "past_due"]
          .includes(status);

        await admin
          .from("users")
          .update({
            subscription_tier: isPremium ? "premium" : "free",
            subscription_status: status,
            subscription_provider: "lemonsqueezy",
            subscription_plan: plan,
            provider_subscription_id: resourceId,
            provider_customer_id: String(attrs?.customer_id ?? ""),
            subscription_current_period_end: periodEnd,
            is_lifetime: false,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        await markOrder({
          status: "completed",
          provider_subscription_id: resourceId,
        });
        break;
      }

      // ---------------- SUSCRIPCIÓN cancelada ----------------
      // Cancelada = no renovará, pero sigue activa hasta fin de periodo.
      case "subscription_cancelled": {
        const periodEnd: string | null = attrs?.ends_at ?? attrs?.renews_at ??
          null;
        await admin
          .from("users")
          .update({
            subscription_status: "cancelled",
            subscription_current_period_end: periodEnd,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;
      }

      // ---------------- SUSCRIPCIÓN pausada ----------------
      case "subscription_paused": {
        await admin
          .from("users")
          .update({
            subscription_status: "paused",
            subscription_tier: "free",
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;
      }

      // ---------------- SUSCRIPCIÓN expirada / impago final ----------------
      case "subscription_expired":
      case "subscription_payment_failed": {
        // payment_failed puede reintentar; solo degradamos en 'expired'.
        if (eventName === "subscription_expired") {
          await admin
            .from("users")
            .update({
              subscription_tier: "free",
              subscription_status: "expired",
              is_lifetime: false,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        } else {
          await admin
            .from("users")
            .update({
              subscription_status: "past_due",
              subscription_updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      default:
        // Evento no manejado: respondemos 200 para que LS no reintente.
        console.log("Evento no manejado", eventName);
    }
  } catch (err) {
    console.error("Error procesando webhook", eventName, err);
    // 500 → Lemon Squeezy reintentará el envío.
    return new Response("Processing error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
