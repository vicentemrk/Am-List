/**
 * ============================================================================
 * FACHADA DE INFRAESTRUCTURA: data/historyRepository.js
 * ============================================================================
 * Qué hace:
 *   Actúa como Fachada Principal de acceso a la bitácora de historial de cambios.
 * 
 * Cómo funciona:
 *   Delega todas las llamadas (`getAllHistory`, `appendHistory`, `clearHistory`)
 *   al adaptador activo (`historyLocalStorageAdapter` por defecto), permitiendo
 *   un desacoplamiento absoluto de la capa de almacenamiento.
 * ============================================================================
 */

import { historyLocalStorageAdapter } from './adapters/localStorage/historyLocalStorageAdapter.js';

let currentAdapter = historyLocalStorageAdapter;

/**
 * Permite cambiar el adaptador activo de historial.
 * @param {import('../domain/ports/HistoryRepositoryPort.js').IHistoryRepositoryPort} newAdapter
 */
export function setHistoryAdapter(newAdapter) {
  currentAdapter = newAdapter;
}

/** Obtiene todos los eventos de historial delegando al adaptador activo */
export function getAllHistory() {
  return currentAdapter.getAllHistory();
}

/** Agrega un nuevo evento delegando al adaptador activo */
export function appendHistory(entry) {
  return currentAdapter.appendHistory(entry);
}

/** Limpia la bitácora delegando al adaptador activo */
export function clearHistory() {
  return currentAdapter.clearHistory();
}
