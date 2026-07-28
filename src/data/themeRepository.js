/**
 * ============================================================================
 * MÓDULO: data/themeRepository.js
 * ============================================================================
 * Qué hace:
 *   Fuente única de verdad para la preferencia de tema visual (claro/oscuro)
 *   almacenada en `localStorage`.
 * Cómo lo hace:
 *   Lee y escribe el tema seleccionado en la clave `amlist_theme`. Si no existe
 *   preferencia previa, consulta la preferencia de color del sistema operativo
 *   (`window.matchMedia`).
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_theme';
const VALID_THEMES = ['light', 'dark'];

/**
 * Obtiene el tema visual seleccionado por el usuario.
 * 
 * Qué hace:
 *   Devuelve 'light' o 'dark' dependiendo de lo guardado o la preferencia del SO.
 * Cómo lo hace:
 *   Verifica `localStorage`. Si está vacío, usa `matchMedia('(prefers-color-scheme: light)')`.
 * 
 * @returns {'light'|'dark'} Tema activo.
 */
export function getTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.includes(raw)) return raw;
  } catch {
    // localStorage no disponible
  }
  // Respetar la preferencia del sistema operativo si no se ha guardado nada previo
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Persiste el tema visual seleccionado.
 * @param {'light'|'dark'} theme - Tema a guardar.
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Almacenamiento lleno o bloqueado — ignora silenciosamente
  }
}

