/**
 * Datos identificativos del titular del sitio.
 *
 * ⚠️ RELLENA ESTOS CAMPOS antes de publicar: la LSSI-CE (Ley 34/2002)
 * obliga a mostrar la identificación completa del prestador del servicio.
 * Los valores marcados como PENDIENTE se muestran resaltados en las
 * páginas legales para que no se te olvide completarlos.
 */
export const COMPANY = {
  /** Nombre comercial */
  brand: 'TestifyHQ',
  /** Denominación social o nombre y apellidos del titular */
  legalName: 'PENDIENTE: nombre o razón social',
  /** NIF / CIF */
  taxId: 'PENDIENTE: NIF/CIF',
  /** Domicilio completo */
  address: 'PENDIENTE: dirección, código postal, ciudad, provincia (España)',
  /** Email de contacto */
  email: 'support@testifyhq.com',
  /** Datos registrales, si aplica (sociedades) */
  registry: '' as string,
  /** Dominio del sitio */
  site: 'https://testifyhq.com',
} as const;

/** Fecha de última actualización de los textos legales. */
export const LEGAL_LAST_UPDATED = '14 de agosto de 2026';

/**
 * Proveedores que tratan datos por cuenta del responsable.
 * Necesario para la política de privacidad (encargados del tratamiento).
 */
export const DATA_PROCESSORS = [
  {
    name: 'Supabase',
    purpose: 'Alojamiento de la base de datos y autenticación de usuarios',
    location: 'UE (eu-west-3) · Supabase Inc. (EE. UU.)',
  },
  {
    name: 'Lemon Squeezy (Stripe)',
    purpose:
      'Procesamiento de pagos y facturación. Actúa como vendedor legal (Merchant of Record)',
    location: 'EE. UU. · Cláusulas contractuales tipo',
  },
  {
    name: 'Netlify',
    purpose: 'Alojamiento y distribución del sitio web',
    location: 'EE. UU. · Cláusulas contractuales tipo',
  },
] as const;

/** Indica si un valor sigue pendiente de rellenar. */
export const isPending = (value: string) => value.startsWith('PENDIENTE');
