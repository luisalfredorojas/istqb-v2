/**
 * Prerenderiza las páginas públicas tras `vite build`.
 *
 * Para cada ruta de PUBLIC_PAGES (src/lib/seo.ts) escribe un HTML con el
 * contenido ya pintado y su título, descripción, canonical y Open Graph,
 * que es lo que lee Google sin ejecutar JavaScript. Además:
 *   - dist/app.html: el HTML vacío (noindex) para las páginas de la app y
 *     los 404, según public/_redirects;
 *   - dist/sitemap.xml con las páginas públicas.
 *
 * Necesita el bundle SSR en dist-ssr/ (vite build --ssr src/entry-server.tsx).
 */
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const { render, PUBLIC_PAGES, canonicalUrl, SITE_URL } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
);

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const marker of ['<!--seo-->', '<div id="root"></div>', '<title>']) {
  if (!template.includes(marker)) throw new Error(`index.html no contiene ${marker}`);
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// JSON dentro de <script>: escapar "<" evita que un "</script>" en los
// datos cierre la etiqueta antes de tiempo.
const stateScript = (state) =>
  `<script>window.__QUERY_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`;

function page({ title, description, robots, url, body, state }) {
  const seo = [
    `<meta name="robots" content="${robots}" />`,
    url && `<link rel="canonical" href="${esc(url)}" />`,
    url && `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(description)}" />`)
    .replace('<!--seo-->', seo)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>${state?.queries?.length ? stateScript(state) : ''}`);
}

// Las rutas que no se prerenderizan reciben el HTML vacío. Todo lo que se
// sirve con él (examen en curso, resultados, admin, 404) es noindex.
const defaultTitle = template.match(/<title>([\s\S]*?)<\/title>/)[1];
const defaultDescription = template.match(/<meta name="description" content="([^"]*)" \/>/)[1];
await writeFile(
  path.join(dist, 'app.html'),
  page({ title: defaultTitle, description: defaultDescription, robots: 'noindex', body: '' })
);

for (const [route, meta] of Object.entries(PUBLIC_PAGES)) {
  const { html: body, state } = await render(route);
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  await writeFile(
    path.join(dist, file),
    page({
      title: meta.title,
      description: meta.description,
      robots: meta.index ? 'index, follow' : 'noindex',
      url: canonicalUrl(route),
      body,
      state,
    })
  );
  console.log(`prerender: ${route} → dist/${file} (${body.length} caracteres)`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = Object.entries(PUBLIC_PAGES)
  .filter(([, meta]) => meta.index)
  .map(([route]) => `  <url>\n    <loc>${canonicalUrl(route)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n');
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`prerender: sitemap con ${Object.keys(PUBLIC_PAGES).length} URLs de ${SITE_URL}`);

await rm(ssrDir, { recursive: true, force: true });
// El cliente de Supabase deja temporizadores vivos; el trabajo ya está hecho.
process.exit(0);
