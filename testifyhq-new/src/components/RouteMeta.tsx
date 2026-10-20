import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalUrl, getPageMeta } from '@/lib/seo';

/**
 * Mantiene el <head> al día al navegar dentro de la app. El HTML estático de
 * cada página pública ya trae estos datos (scripts/prerender.mjs); esto
 * cubre la navegación posterior sin recargar.
 */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', meta.index ? 'index, follow' : 'noindex');
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', canonicalUrl(pathname));
    setCanonical(meta.index ? canonicalUrl(pathname) : null);
  }, [pathname]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}
