/* eslint-disable react-refresh/only-export-components -- no se carga en el navegador ni con HMR */
/**
 * Entrada para prerenderizar las páginas públicas en el build
 * (scripts/prerender.mjs). Sin esto Google recibe un <div id="root"> vacío
 * y depende de ejecutar el JavaScript para ver algo.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppProviders, AppRoutes } from './App';
import { dehydrate } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { examsQueryKey, fetchExams } from './hooks/useExams';

export { PUBLIC_PAGES, SITE_URL, canonicalUrl } from './lib/seo';

/**
 * renderToString no espera a las consultas, así que los datos que una
 * página necesita se cargan antes. El servidor renderiza siempre en
 * español, el idioma por defecto.
 */
async function prefetch(url: string) {
  if (url === '/exams') {
    await queryClient.prefetchQuery({
      queryKey: examsQueryKey('es'),
      queryFn: () => fetchExams('es'),
    });
  }
}

/**
 * Devuelve el HTML y el estado de las consultas, que el cliente restaura
 * antes de hidratar (src/main.tsx): sin él, el navegador empezaría con la
 * caché vacía, pintaría "Cargando" y no coincidiría con el HTML.
 */
export async function render(url: string): Promise<{ html: string; state: unknown }> {
  queryClient.clear();
  await prefetch(url);
  const html = renderToString(
    <StrictMode>
      <AppProviders>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>
    </StrictMode>
  );
  return { html, state: dehydrate(queryClient) };
}
