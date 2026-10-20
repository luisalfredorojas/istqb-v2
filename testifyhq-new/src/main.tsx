import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { hydrate } from '@tanstack/react-query'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { markHydrating } from './lib/hydration'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Las páginas públicas llegan prerenderizadas (scripts/prerender.mjs) y se
// hidratan; el resto llega con el contenedor vacío. Si el HTML no coincide
// (otro idioma o tema guardado, exámenes nuevos), React lo vuelve a pintar.
if (container.hasChildNodes()) {
  // Los datos con los que se prerenderizó la página (p. ej. la lista de
  // exámenes), para que el primer render coincida con el HTML.
  const state = (window as { __QUERY_STATE__?: unknown }).__QUERY_STATE__
  if (state) hydrate(queryClient, state)
  markHydrating()
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
