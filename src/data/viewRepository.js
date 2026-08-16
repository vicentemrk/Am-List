/**
 * ============================================================================
 * REPOSITORIO: data/viewRepository.js
 * ============================================================================
 * Qué hace:
 *   Persiste la preferencia de densidad de vista del usuario entre sesiones.
 * Cómo funciona:
 *   Lee y escribe en localStorage bajo la clave 'amlist_view_density'.
 *   Análogo a sortRepository.js — sigue el mismo patrón de repositorio simple.
 * ============================================================================
 */

const KEY = 'amlist_view_density';

/** @typedef {'detailed' | 'compact'} ViewDensity */

/** Densidades de vista disponibles */
export const DENSITIES = /** @type {const} */ (['detailed', 'compact']);

/** Densidad por defecto */
const DEFAULT_DENSITY = 'detailed';

/**
 * Obtiene la densidad de vista guardada.
 * @returns {ViewDensity}
 */
export function getDensity() {
  try {
    const stored = localStorage.getItem(KEY);
    return DENSITIES.includes(stored) ? stored : DEFAULT_DENSITY;
  } catch {
    return DEFAULT_DENSITY;
  }
}

/**
 * Guarda la densidad de vista elegida por el usuario.
 * @param {ViewDensity} density
 */
export function setDensity(density) {
  if (!DENSITIES.includes(density)) return;
  try {
    localStorage.setItem(KEY, density);
  } catch {
    // localStorage no disponible — operación silenciosa
  }
}
