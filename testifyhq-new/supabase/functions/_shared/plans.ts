// Definición de planes, agnóstica del proveedor.
// Cada plan mapea a una "variant" de Lemon Squeezy (configurada en secrets).
// Los importes son informativos (la MoR calcula impuestos/total real).

export type PlanId = "monthly" | "yearly" | "lifetime";

export interface PlanConfig {
  id: PlanId;
  /** 'subscription' → recurrente | 'one_time' → pago único (lifetime) */
  kind: "subscription" | "one_time";
  /** Nombre de la env var con el variant_id de Lemon Squeezy */
  variantEnv: string;
  /** Importe base informativo, en la moneda de la tienda */
  amount: number;
  currency: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  monthly: {
    id: "monthly",
    kind: "subscription",
    variantEnv: "LEMONSQUEEZY_VARIANT_MONTHLY",
    amount: 7.99,
    currency: "EUR",
  },
  yearly: {
    id: "yearly",
    kind: "subscription",
    variantEnv: "LEMONSQUEEZY_VARIANT_YEARLY",
    amount: 39.99,
    currency: "EUR",
  },
  lifetime: {
    id: "lifetime",
    kind: "one_time",
    variantEnv: "LEMONSQUEEZY_VARIANT_LIFETIME",
    amount: 79.99,
    currency: "EUR",
  },
};

export function isPlanId(v: unknown): v is PlanId {
  return v === "monthly" || v === "yearly" || v === "lifetime";
}

/** Resuelve el variant_id de Lemon Squeezy para un plan, desde los secrets. */
export function variantIdFor(plan: PlanConfig): string | null {
  return Deno.env.get(plan.variantEnv) ?? null;
}
