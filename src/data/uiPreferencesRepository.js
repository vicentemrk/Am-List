/**
 * ============================================================================
 * MÓDULO: data/uiPreferencesRepository.js
 * ============================================================================
 * Qué hace:
 *   Gestiona preferencias de UI del usuario persistidas en localStorage.
 *   Actualmente solo maneja la preferencia de traducción automática (ES/EN).
 * ============================================================================
 */

const TRANSLATION_KEY = 'amlist_translation_enabled';

/**
 * Obtiene la preferencia de traducción del usuario.
 * @returns {boolean} true = traducción activa (ES), false = sin traducción (EN).
 *                    Por defecto true (comportamiento histórico).
 */
export function getTranslationPreference() {
  try {
    const raw = localStorage.getItem(TRANSLATION_KEY);
    // null = clave nunca guardada → default true (ES activo)
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Persiste la preferencia de traducción del usuario.
 * @param {boolean} enabled - true = traducción activa (ES), false = sin traducción (EN).
 */
export function setTranslationPreference(enabled) {
  try {
    localStorage.setItem(TRANSLATION_KEY, String(enabled));
  } catch {
    // Manejo silencioso
  }
}
