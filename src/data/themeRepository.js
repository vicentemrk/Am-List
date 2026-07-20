/**
 * data/themeRepository.js
 * Single source of truth for theme preference in localStorage.
 */

const STORAGE_KEY = 'amlist_theme';
const VALID_THEMES = ['light', 'dark'];

/**
 * Returns the stored theme, or 'light' if not set.
 * @returns {'light'|'dark'}
 */
export function getTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.includes(raw)) return raw;
  } catch {
    // localStorage unavailable
  }
  // Respect OS preference; default to dark if no preference set
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Persists the selected theme.
 * @param {'light'|'dark'} theme
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage full or blocked — silently ignore
  }
}
