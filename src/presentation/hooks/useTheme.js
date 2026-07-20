/**
 * presentation/hooks/useTheme.js
 * Dark/light toggle — reads and writes through themeRepository only.
 * Applies `data-theme` attribute to <html> so CSS vars work globally.
 */

import { useState, useEffect, useCallback } from 'react';
import { getTheme, setTheme } from '../../data/themeRepository.js';

export function useTheme() {
  const [theme, setThemeState] = useState(() => getTheme());

  // Sync the <html> attribute on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
