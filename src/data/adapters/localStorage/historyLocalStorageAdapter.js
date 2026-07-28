/**
 * ============================================================================
 * ADAPTADOR DE INFRAESTRUCTURA: data/adapters/localStorage/historyLocalStorageAdapter.js
 * ============================================================================
 * Qué hace:
 *   Implementa el puerto `HistoryRepositoryPort` utilizando el almacenamiento
 *   local del navegador (`window.localStorage`).
 * 
 * Cómo funciona:
 *   - Maneja la clave `amlist_history` serializada en JSON.
 *   - Mantiene una restricción máxima de 500 registros (`MAX_ENTRIES`) descartando
 *     los más antiguos cuando la bitácora crece.
 *   - Ofrece métodos seguros `getAllHistory()`, `appendHistory()`, `clearHistory()`.
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_history';
const MAX_ENTRIES = 500;

/**
 * Adaptador Concreto de LocalStorage para Historial.
 * Cumple con la interfaz `HistoryRepositoryPort`.
 */
export const historyLocalStorageAdapter = {
  /**
   * Obtiene todas las entradas registradas en el historial.
   * @returns {object[]} Lista cronológica de eventos.
   */
  getAllHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  },

  /**
   * Inserta un nuevo evento en el historial recortando el tamaño a MAX_ENTRIES.
   * @param {object} entry - Objeto de entrada de historial.
   */
  appendHistory(entry) {
    if (!entry || typeof entry !== 'object') return;
    try {
      const current = this.getAllHistory();
      const updated = [...current, entry].slice(-MAX_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignora en caso de que el almacenamiento esté lleno
    }
  },

  /**
   * Limpia por completo la bitácora del historial.
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora errores
    }
  },
};
