/**
 * Si la app arrancó hidratando HTML prerenderizado (src/main.tsx).
 *
 * Ese HTML se generó con los valores por defecto (exámenes en español, tema
 * oscuro). Mientras se hidrata, el primer render tiene que usar esos mismos
 * valores para coincidir; la preferencia guardada se aplica justo después,
 * antes de pintar.
 */
let hydrating = false;

export function markHydrating() {
  hydrating = true;
}

export function isHydrating() {
  return hydrating;
}
