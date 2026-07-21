/**
 * presentation/hooks/useSearch.js
 * Orchestrates search with debounce + AbortController.
 *
 * - Debounces the query by 500ms to avoid hammering the API on every keystroke.
 * - Aborts obsolete in-flight requests when a new search starts.
 * - Exposes { results, loading, error, retry } to components.
 * - Never touches fetch or localStorage directly — delegates to apiClient.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce.js';
import { searchAnime, searchManga, ApiError } from '../../data/apiClient.js';

/**
 * @param {string} query           Raw search input
 * @param {'anime'|'manga'} mediaType
 * @returns {{
 *   results: object[],
 *   loading: boolean,
 *   error: string|null,
 *   errorCode: string|number|null,
 *   retry: () => void
 * }}
 */
export function useSearch(query, mediaType = 'anime') {
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Keeps a reference to the current AbortController so we can cancel stale fetches
  const abortRef = useRef(null);

  // A trigger counter forces a re-run when the user clicks "retry"
  const [retryCount, setRetryCount] = useState(0);

  const doSearch = useCallback(async (q, type, signal) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setResults([]);

    try {
      const fn = type === 'manga' ? searchManga : searchAnime;
      const data = await fn(q, signal);
      if (!signal.aborted) {
        setResults(data);
      }
    } catch (err) {
      if (signal.aborted) return; // stale request — ignore silently
      if (err instanceof ApiError && err.code === 'CANCELLED') return;
      setError(err instanceof ApiError ? err.message : 'Error inesperado en la búsqueda.');
      setErrorCode(err instanceof ApiError ? err.code : 'UNKNOWN');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();

    if (!q) {
      setResults([]);
      setError(null);
      setErrorCode(null);
      setLoading(false);
      return;
    }

    // Abort the previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    doSearch(q, mediaType, controller.signal);

    return () => controller.abort();
  }, [debouncedQuery, mediaType, retryCount, doSearch]);

  const retry = useCallback(() => setRetryCount((c) => c + 1), []);

  return { results, loading, error, errorCode, retry };
}
