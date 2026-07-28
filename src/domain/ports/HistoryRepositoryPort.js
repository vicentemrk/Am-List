/**
 * ============================================================================
 * PUERTO DE DOMINIO: domain/ports/HistoryRepositoryPort.js
 * ============================================================================
 * Qué hace:
 *   Define el contrato abstracto de la interfaz para la bitácora de historial.
 * 
 * Cómo funciona (Arquitectura Hexagonal):
 *   Garantiza que cualquier sistema de persistencia (Local Storage o servidor remoto)
 *   implemente los métodos necesarios para leer eventos, registrar nuevos eventos y
 *   limpiar la bitácora sin acoplarse a la implementación concreta.
 * ============================================================================
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {string} id - ID único del registro de historial
 * @property {string} itemId - ID del ítem afectado
 * @property {string} titulo - Título del ítem
 * @property {string} mediaType - Tipo de contenido ('anime' | 'manga')
 * @property {string} accion - Tipo de cambio realizado
 * @property {string} timestamp - Fecha y hora ISO 8601 del evento
 * @property {object} [snapshot] - Fotografía del ítem en ese momento
 */

/**
 * Interfaz del Puerto de Historial.
 * 
 * @typedef {Object} IHistoryRepositoryPort
 * 
 * @property {() => Promise<HistoryEntry[]> | HistoryEntry[]} getAllHistory
 *   Recupera todas las entradas del historial ordenadas cronológicamente.
 * 
 * @property {(entry: HistoryEntry) => Promise<void> | void} appendHistory
 *   Inserta un nuevo registro en la bitácora guardando el límite de elementos.
 * 
 * @property {() => Promise<void> | void} clearHistory
 *   Limpia la bitácora del historial por completo.
 */

// Exportación simbólica para el contrato de dominio
export const HistoryRepositoryPort = {};
