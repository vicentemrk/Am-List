/**
 * presentation/hooks/useViewDensity.js
 * Hook que expone la densidad de vista activa y un toggle para alternarla.
 * Persiste en localStorage via viewRepository (capa data/).
 */
import { useState, useCallback } from 'react';
import { getDensity, setDensity, DENSITIES } from '../../data/viewRepository.js';

/**
 * @returns {{ density: 'detailed'|'compact', toggleDensity: () => void }}
 */
export function useViewDensity() {
  const [density, setDensityState] = useState(() => getDensity());

  const toggleDensity = useCallback(() => {
    setDensityState((prev) => {
      const next = prev === 'detailed' ? 'compact' : 'detailed';
      setDensity(next);
      return next;
    });
  }, []);

  return { density, toggleDensity };
}
