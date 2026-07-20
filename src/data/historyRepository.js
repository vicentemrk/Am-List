/**
 * data/historyRepository.js
 * Single access point for the chronological history log in localStorage.
 */

const STORAGE_KEY = 'amlist_history';
const MAX_ENTRIES = 500; // keep the log from growing unbounded

/**
 * Returns all history entries sorted oldest→newest.
 * If the stored JSON is corrupt, returns an empty array.
 * @returns {object[]}
 */
export function getAllHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Appends a new history entry. Trims to MAX_ENTRIES from the newest end.
 * @param {object} entry  Must be a plain object with at least { id, timestamp }
 */
export function appendHistory(entry) {
  if (!entry || typeof entry !== 'object') return;
  try {
    const current = getAllHistory();
    const updated = [...current, entry].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full — silently ignore
  }
}

/**
 * Clears the entire history. Used for testing / manual reset.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
