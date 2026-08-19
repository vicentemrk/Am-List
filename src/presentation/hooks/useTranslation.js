/**
 * presentation/hooks/useTranslation.js
 * ============================================================================
 * Qué hace:
 *   Hook que gestiona la preferencia de traducción automática de sinopsis.
 *   - translationEnabled: true → ES (traducción activa), false → EN (original)
 *   - Persiste en localStorage via uiPreferencesRepository.
 * ============================================================================
 */
import { useState, useCallback } from 'react';
import { getTranslationPreference, setTranslationPreference } from '../../data/uiPreferencesRepository.js';

export function useTranslation() {
  const [translationEnabled, setTranslationEnabled] = useState(() => getTranslationPreference());

  const toggleTranslation = useCallback(() => {
    setTranslationEnabled((prev) => {
      const next = !prev;
      setTranslationPreference(next);
      return next;
    });
  }, []);

  return { translationEnabled, toggleTranslation };
}
