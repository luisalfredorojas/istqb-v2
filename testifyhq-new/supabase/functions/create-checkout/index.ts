// Edge Function: create-checkout
// Crea un checkout hospedado en Lemon Squeezy para el plan solicitado y
// devuelve la URL a la que redirigir al usuario.
//
// Flujo:
//  1. Verifica el JWT del usuario (Authorization: Bearer <token>).
//  2. Registra una orden 'pending' en payment_orders (service_role).
//  3. Crea el checkout en Lemon Squeezy con custom_data = { user_id, order_id }.
//  4. Devuelve { url }.
//
// Secrets requeridos (supabase secrets set ...):
//  - LEMONSQUEEZY_API_KEY
//  - LEMONSQUEEZY_STORE_ID
//  - LEMONSQUEEZY_VARIANT_MONTHLY / _YEARLY / _LIFETIME
//  - APP_URL              (para el redirect tras el pago)
//  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (inyectados por Supabase)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { isPlanId, PLANS, variantIdFor } from "../_shared/plans.ts";

const LS_API = "https://api.lemonsqueezy.com/v1/checkouts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // --- 1. Autenticar al usuario a partir de su JWT -------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return jsonResponse({ error: "No autenticado" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Sesión inválida" }, 401);
    }
    const user = userData.user;

    // --- 2. Validar el plan ------------------------------------------
    const body = await req.json().catch(() => ({}));
    const planId = body?.plan;
    if (!isPlanId(planId)) {
      return jsonResponse({ error: "Plan inválido" }, 400);
    }
    const plan = PLANS[planId];

    const storeId = Deno.env.get("LEMONSQUEEZY_STORE_ID");
    const apiKey = Deno.env.get("LEMONSQUEEZY_API_KEY");
    const variantId = variantIdFor(plan);
    // Quita barras finales para no generar URLs con doble barra (//).
    const appUrl = (Deno.env.get("APP_URL") ?? "").replace(/\/+$/, "");

    if (!storeId || !apiKey || !variantId) {
      console.error("Faltan secrets de Lemon Squeezy", {
        hasStore: !!storeId,
        hasKey: !!apiKey,
        hasVariant: !!variantId,
        variantEnv: plan.variantEnv,
      });
      return jsonResponse({ error: "Pasarela no configurada" }, 500);
    }

    // --- 3. Registrar orden pendiente --------------------------------
    const { data: order, error: orderErr } = await admin
      .from("payment_orders")
      .insert({
        user_id: user.id,
        plan_type: plan.id,
        amount: plan.amount,
        currency: plan.currency,
        status: "pending",
        provider: "lemonsqueezy",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("No se pudo crear payment_orders", orderErr);
      return jsonResponse({ error: "Error interno" }, 500);
    }

    // --- 4. Crear el checkout en Lemon Squeezy -----------------------
    const checkoutPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email ?? undefined,
            custom: {
              // Lemon Squeezy devuelve estos valores como strings en el webhook.
              user_id: user.id,
              order_id: order.id,
              plan: plan.id,
            },
          },
          product_options: {
            redirect_url: `${appUrl}/dashboard`,
            enabled_variants: [Number(variantId)],
          },
          checkout_options: {
            locale: "es",
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    };

    const lsResp = await fetch(LS_API, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!lsResp.ok) {
      const detail = await lsResp.text();
      console.error("Lemon Squeezy checkout falló", lsResp.status, detail);
      // Marca la orden como fallida para no dejar 'pending' huérfanos.
      await admin
        .from("payment_orders")
        .update({ status: "failed" })
        .eq("id", order.id);
      return jsonResponse({ error: "No se pudo iniciar el pago" }, 502);
    }

    const lsData = await lsResp.json();
    const checkoutId: string | undefined = lsData?.data?.id;
    const url: string | undefined = lsData?.data?.attributes?.url;

    if (!url) {
      console.error("Respuesta de checkout sin URL", lsData);
      return jsonResponse({ error: "No se pudo iniciar el pago" }, 502);
    }

    // Guarda el id del checkout para trazabilidad.
    if (checkoutId) {
      await admin
        .from("payment_orders")
        .update({ provider_checkout_id: checkoutId })
        .eq("id", order.id);
    }

    return jsonResponse({ url });
  } catch (err) {
    console.error("create-checkout error", err);
    return jsonResponse({ error: "Error interno" }, 500);
  }
});
