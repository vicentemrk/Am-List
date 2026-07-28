/**
 * ============================================================================
 * FACHADA DE INFRAESTRUCTURA: data/itemsRepository.js
 * ============================================================================
 * Qué hace:
 *   Actúa como la Fachada Principal (Seam/Costura Hexagonal) para la gestión
 *   de los datos de ítems en AMlist.
 * 
 * Cómo funciona:
 *   Expone los mismos métodos estáticos exportados (`getAll`, `getById`, `create`,
 *   `update`, `remove`, `importBatch`), pero delega la ejecución al adaptador
 *   activo (`itemsLocalStorageAdapter` por defecto).
 *   Cuando se implemente la sincronización en la nube, se podrá intercambiar el
 *   adaptador activo por `itemsRemoteHttpAdapter` sin modificar `useItems` ni la UI.
 * ============================================================================
 */

import { itemsLocalStorageAdapter } from './adapters/localStorage/itemsLocalStorageAdapter.js';

// Adaptador actualmente activo (LocalStorage por defecto)
let currentAdapter = itemsLocalStorageAdapter;

/**
 * Permite cambiar el adaptador activo en tiempo de ejecución (útil para login/logout o pruebas).
 * @param {import('../domain/ports/ItemsRepositoryPort.js').IItemsRepositoryPort} newAdapter
 */
export function setAdapter(newAdapter) {
  currentAdapter = newAdapter;
}

/** Obtiene todos los ítems almacenados delegando al adaptador activo */
export function getAll() {
  return currentAdapter.getAll();
}

/** Obtiene un ítem por ID delegando al adaptador activo */
export function getById(id) {
  return currentAdapter.getById(id);
}

/** Crea un nuevo ítem delegando al adaptador activo */
export function create(item) {
  return currentAdapter.create(item);
}

/** Actualiza un ítem delegando al adaptador activo */
export function update(id, patch) {
  return currentAdapter.update(id, patch);
}

/** Elimina un ítem delegando al adaptador activo */
export function remove(id) {
  return currentAdapter.remove(id);
}

/** Importa un conjunto de ítems delegando al adaptador activo */
export function importBatch(importedItems) {
  return currentAdapter.importBatch(importedItems);
}
