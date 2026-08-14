// Edge Function: manage-subscription
// Permite al usuario gestionar SU propia suscripción:
//   { action: "cancel" } → cancela en Lemon Squeezy (sigue activa hasta fin de periodo)
//   { action: "portal" } → devuelve la URL firmada del portal de cliente
//                          (facturas, método de pago, datos de facturación)
//
// Seguridad: se verifica el JWT del usuario y SOLO se opera sobre el
// provider_subscription_id guardado en su propia fila. El id nunca viene
// del cliente, así que un usuario no puede cancelar la suscripción de otro.
//
// Secrets: LEMONSQUEEZY_API_KEY (+ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)

import { createClient } from "supabase";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const LS_API = "https://api.lemonsqueezy.com/v1/subscriptions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const token = (req.headers.get("Authorization") ?? "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    if (!token) return jsonResponse({ error: "No autenticado" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Sesión inválida" }, 401);
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    if (action !== "cancel" && action !== "portal") {
      return jsonResponse({ error: "Acción inválida" }, 400);
    }

    const apiKey = Deno.env.get("LEMONSQUEEZY_API_KEY");
    if (!apiKey) {
      console.error("Falta LEMONSQUEEZY_API_KEY");
      return jsonResponse({ error: "Pasarela no configurada" }, 500);
    }

    // La suscripción se toma SIEMPRE de la fila del usuario autenticado.
    const { data: profile, error: profileErr } = await admin
      .from("users")
      .select("provider_subscription_id, subscription_status, is_lifetime")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      console.error("No se pudo leer el perfil", profileErr);
      return jsonResponse({ error: "Error interno" }, 500);
    }

    const subscriptionId = profile.provider_subscription_id;
    if (!subscriptionId) {
      return jsonResponse(
        { error: "No tienes una suscripción activa que gestionar" },
        400,
      );
    }

    const lsHeaders = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    };

    // ------------------------------------------------------------------
    // Portal de cliente: URL firmada (válida 24 h) para facturas y pagos
    // ------------------------------------------------------------------
    if (action === "portal") {
      const resp = await fetch(`${LS_API}/${subscriptionId}`, {
        headers: lsHeaders,
      });
      if (!resp.ok) {
        console.error("LS get subscription falló", resp.status, await resp.text());
        return jsonResponse({ error: "No se pudo abrir el portal" }, 502);
      }
      const data = await resp.json();
      const url = data?.data?.attributes?.urls?.customer_portal;
      if (!url) return jsonResponse({ error: "No se pudo abrir el portal" }, 502);
      return jsonResponse({ url });
    }

    // ------------------------------------------------------------------
    // Cancelación: la suscripción sigue activa hasta el fin del periodo ya
    // pagado. El webhook subscription_cancelled sincroniza el estado.
    // ------------------------------------------------------------------
    const resp = await fetch(`${LS_API}/${subscriptionId}`, {
      method: "DELETE",
      headers: lsHeaders,
    });

    if (!resp.ok) {
      console.error("LS cancel falló", resp.status, await resp.text());
      return jsonResponse({ error: "No se pudo cancelar la suscripción" }, 502);
    }

    const data = await resp.json();
    const attrs = data?.data?.attributes ?? {};
    const endsAt: string | null = attrs?.ends_at ?? null;

    // Actualiza ya el estado (sin esperar al webhook) para que la UI
    // refleje la cancelación de inmediato.
    await admin
      .from("users")
      .update({
        subscription_status: "cancelled",
        subscription_current_period_end: endsAt,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return jsonResponse({ cancelled: true, endsAt });
  } catch (err) {
    console.error("manage-subscription error", err);
    return jsonResponse({ error: "Error interno" }, 500);
  }
});
