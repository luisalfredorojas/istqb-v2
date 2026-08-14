// Edge Function: delete-account
// Derecho de supresión (art. 17 RGPD). Elimina la cuenta del usuario
// autenticado y sus datos personales.
//
// Antes de borrar, cancela la suscripción activa en Lemon Squeezy para que
// no se le siga cobrando a alguien que ya no tiene cuenta.
//
// Nota: las órdenes de pago se conservan de forma anonimizada (user_id a
// NULL no es posible por FK, así que se eliminan en cascada); la
// facturación fiscal la conserva Lemon Squeezy como vendedor legal.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

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
    const userId = userData.user.id;

    // Confirmación explícita para evitar borrados accidentales.
    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== true) {
      return jsonResponse({ error: "Confirmación requerida" }, 400);
    }

    // 1. Cancelar la suscripción activa, si la hay.
    const { data: profile } = await admin
      .from("users")
      .select("provider_subscription_id, subscription_status")
      .eq("id", userId)
      .single();

    const subscriptionId = profile?.provider_subscription_id;
    const alreadyEnded = ["cancelled", "expired"].includes(
      profile?.subscription_status ?? "",
    );

    if (subscriptionId && !alreadyEnded) {
      const apiKey = Deno.env.get("LEMONSQUEEZY_API_KEY");
      if (apiKey) {
        const resp = await fetch(
          `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/vnd.api+json",
              "Content-Type": "application/vnd.api+json",
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );
        if (!resp.ok) {
          // No bloqueamos el borrado, pero lo dejamos registrado: hay que
          // cancelar manualmente para no seguir cobrando.
          console.error(
            "AVISO: no se pudo cancelar la suscripción antes de borrar la cuenta",
            subscriptionId,
            resp.status,
            await resp.text(),
          );
        }
      }
    }

    // 2. Eliminar el usuario de auth. Las tablas con
    //    "REFERENCES auth.users(id) ON DELETE CASCADE" se limpian solas
    //    (exam_attempts, payment_orders, users).
    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("No se pudo eliminar el usuario", deleteErr);
      return jsonResponse({ error: "No se pudo eliminar la cuenta" }, 500);
    }

    return jsonResponse({ deleted: true });
  } catch (err) {
    console.error("delete-account error", err);
    return jsonResponse({ error: "Error interno" }, 500);
  }
});
