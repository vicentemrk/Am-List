/**
 * presentation/hooks/useDebounce.js
 * Generic debounce hook — pure timing utility, no business logic.
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that updates only after `delay` ms
 * of inactivity.
 * @template T
 * @param {T} value
 * @param {number} [delay=500]
 * @returns {T}
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
