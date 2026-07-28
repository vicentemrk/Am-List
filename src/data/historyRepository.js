/**
 * ============================================================================
 * MÓDULO: data/historyRepository.js
 * ============================================================================
 * Qué hace:
 *   Punto único de acceso para gestionar la bitácora cronológica del historial de
 *   cambios en `localStorage`.
 * Cómo lo hace:
 *   Lee y escribe arreglos de eventos en JSON. Mantiene un tope estricto de 500
 *   entradas (`MAX_ENTRIES`) descartando los eventos más antiguos para no saturar
 *   el almacenamiento del navegador.
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_history';
const MAX_ENTRIES = 500; // Límite máximo de registros para prevenir desbordamientos

/**
 * Obtiene todas las entradas del historial almacenadas.
 * 
 * Qué hace:
 *   Recupera el historial de cambios en orden cronológico.
 * Cómo lo hace:
 *   Lee `localStorage` usando `try/catch` para tolerar JSONs corruptos sin fallar.
 * 
 * @returns {object[]} Lista de entradas del historial o arreglo vacío.
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
 * Agrega una nueva entrada a la bitácora de historial.
 * 
 * Qué hace:
 *   Inserta un nuevo registro y recorta el arreglo si supera el máximo de 500 elementos.
 * Cómo lo hace:
 *   Combina el arreglo actual con la nueva entrada y aplica `.slice(-MAX_ENTRIES)`.
 * 
 * @param {object} entry - Objeto plano con la entrada construida por `construirEntradaHistorial`.
 */
export function appendHistory(entry) {
  if (!entry || typeof entry !== 'object') return;
  try {
    const current = getAllHistory();
    const updated = [...current, entry].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Almacenamiento lleno — ignora silenciosamente para evitar caídas
  }
}

/**
 * Limpia por completo la bitácora del historial.
 * Útil para restablecimientos manuales o pruebas unitarias.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignorar
  }
}

