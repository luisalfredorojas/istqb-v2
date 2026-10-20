/**
 * Título, descripción e indexación de cada página.
 *
 * Es la única fuente de verdad para dos consumidores: <RouteMeta>, que
 * actualiza el <head> al navegar dentro de la app, y scripts/prerender.mjs,
 * que escribe esos mismos datos en el HTML estático que lee Google.
 */

export const SITE_URL = 'https://testifyhq.com';
export const SITE_NAME = 'TestifyHQ';

export interface PageMeta {
  title: string;
  description: string;
  /** false → <meta name="robots" content="noindex">. */
  index: boolean;
}

/** Páginas públicas: se prerenderizan y van al sitemap. */
export const PUBLIC_PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'Simulador de examen ISTQB gratis en español | TestifyHQ',
    description:
      'Practica para la certificación ISTQB con simulacros de examen gratis, en español e inglés: Foundation Level v4.0, Test Analyst y Test Automation. Sin registro y con explicaciones.',
    index: true,
  },
  '/exams': {
    title: 'Exámenes de práctica ISTQB gratis (CTFL v4.0, CTAL-TA, TAE) | TestifyHQ',
    description:
      'Todos los simulacros de examen ISTQB disponibles: Foundation Level v4.0 (exámenes A, B, C, D y preguntas extra), Advanced Test Analyst y Test Automation Engineering. Con cronómetro y nota final, gratis y sin registro.',
    index: true,
  },
  '/aviso-legal': {
    title: 'Aviso legal | TestifyHQ',
    description: 'Información legal sobre el titular y las condiciones de uso de TestifyHQ.',
    index: true,
  },
  '/privacidad': {
    title: 'Política de privacidad | TestifyHQ',
    description:
      'Qué datos trata TestifyHQ: ninguno personal. Tu progreso se guarda solo en tu navegador.',
    index: true,
  },
  '/terminos': {
    title: 'Términos y condiciones | TestifyHQ',
    description: 'Condiciones de uso de la plataforma gratuita de práctica ISTQB TestifyHQ.',
    index: true,
  },
  '/cookies': {
    title: 'Política de cookies | TestifyHQ',
    description: 'TestifyHQ no usa cookies de seguimiento ni de publicidad.',
    index: true,
  },
};

/**
 * Páginas de la app que no aportan nada a quien llega desde un buscador:
 * el examen en curso, resultados y progreso (que viven en el navegador de
 * cada uno) y la administración.
 */
const APP_PAGES: Array<[prefix: string, meta: PageMeta]> = [
  ['/exam/', { title: `Simulacro de examen ISTQB | ${SITE_NAME}`, description: '', index: false }],
  ['/results/', { title: `Resultados del simulacro | ${SITE_NAME}`, description: '', index: false }],
  ['/dashboard', { title: `Mi progreso | ${SITE_NAME}`, description: '', index: false }],
  ['/login', { title: `Acceso de administración | ${SITE_NAME}`, description: '', index: false }],
  ['/auth/', { title: SITE_NAME, description: '', index: false }],
  ['/admin/', { title: `Administración | ${SITE_NAME}`, description: '', index: false }],
];

const NOT_FOUND: PageMeta = {
  title: `Página no encontrada | ${SITE_NAME}`,
  description: '',
  index: false,
};

export function getPageMeta(pathname: string): PageMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (PUBLIC_PAGES[path]) return PUBLIC_PAGES[path];
  const app = APP_PAGES.find(([prefix]) => path === prefix.replace(/\/$/, '') || path.startsWith(prefix));
  return app ? app[1] : NOT_FOUND;
}

export function canonicalUrl(pathname: string): string {
  return pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`;
}
