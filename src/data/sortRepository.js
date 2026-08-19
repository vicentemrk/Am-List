/**
 * ============================================================================
 * MÓDULO: data/sortRepository.js
 * ============================================================================
 * Qué hace:
 *   Gestión de la preferencia de ordenamiento (título, puntuación, fecha, progreso)
 *   persistida en `localStorage`.
 * Cómo lo hace:
 *   Lee y escribe el criterio seleccionado en la clave `amlist_sort_by`.
 *   También persiste la dirección (asc/desc) en `amlist_sort_dir`.
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_sort_by';
const STORAGE_DIR_KEY = 'amlist_sort_dir';
const VALID_SORT_OPTIONS = ['recent', 'manual', 'title', 'score', 'progress'];
const VALID_SORT_DIRS = ['asc', 'desc'];

/**
 * Obtiene el criterio de ordenamiento guardado por el usuario.
 * @returns {string} Criterio de ordenamiento ('recent' por defecto).
 */
export function getSortPreference() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && VALID_SORT_OPTIONS.includes(raw)) return raw;
  } catch {
    // Manejo silencioso ante restricciones de localStorage
  }
  return 'recent';
}

/**
 * Persiste el criterio de ordenamiento seleccionado por el usuario.
 * @param {string} sortBy - Criterio a guardar.
 */
export function setSortPreference(sortBy) {
  if (!VALID_SORT_OPTIONS.includes(sortBy)) return;
  try {
    localStorage.setItem(STORAGE_KEY, sortBy);
  } catch {
    // Manejo silencioso
  }
}

/**
 * Obtiene la dirección de ordenamiento guardada por el usuario.
 * @returns {'asc'|'desc'} Dirección ('desc' por defecto).
 */
export function getSortDirection() {
  try {
    const raw = localStorage.getItem(STORAGE_DIR_KEY);
    if (raw && VALID_SORT_DIRS.includes(raw)) return raw;
  } catch {
    // Manejo silencioso
  }
  return 'desc';
}

/**
 * Persiste la dirección de ordenamiento seleccionada por el usuario.
 * @param {'asc'|'desc'} dir - Dirección a guardar.
 */
export function setSortDirection(dir) {
  if (!VALID_SORT_DIRS.includes(dir)) return;
  try {
    localStorage.setItem(STORAGE_DIR_KEY, dir);
  } catch {
    // Manejo silencioso
  }
}
