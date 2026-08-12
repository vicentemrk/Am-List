/**
 * data/changelogRepository.js
 * Gestiona el estado de visto/no-visto del changelog in-app.
 * Persiste en localStorage comparando la versión actual con la última vista.
 */

const STORAGE_KEY = 'amlist_changelog_seen_version';

/** Versión actual de la app — actualizar en cada release */
export const CURRENT_VERSION = '1.2.0';

/**
 * Verifica si el usuario ya vio el changelog de la versión actual.
 * @returns {boolean} true si ya fue visto.
 */
export function hasSeenChangelog() {
  try {
    const seen = localStorage.getItem(STORAGE_KEY);
    return seen === CURRENT_VERSION;
  } catch {
    return true; // En caso de error, asumir que sí lo vio (no interrumpir UX)
  }
}

/**
 * Marca el changelog de la versión actual como visto.
 */
export function markChangelogSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
  } catch {
    // Ignorar errores de storage
  }
}
