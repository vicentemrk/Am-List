/**
 * presentation/hooks/useItems.js
 * The single source of truth for items state in the UI.
 *
 * All reads/writes go through itemsRepository and historyRepository.
 * Business logic (filtering, validation) is handled by domain functions.
 * This hook never calls localStorage or fetch directly.
 */

import { useState, useCallback } from 'react';
import * as repo from '../../data/itemsRepository.js';
import { appendHistory } from '../../data/historyRepository.js';
import { construirEntradaHistorial } from '../../domain/historial.js';
import { filtrarPorSeccion } from '../../domain/validators.js';

export function useItems() {
  // Initialize from repository on first render
  const [items, setItems] = useState(() => repo.getAll());

  // ── create ──────────────────────────────────────────────────────────────────
  /**
   * Adds a new item.
   * @param {object} itemData  Must contain at least { malId, mediaType, titulo }
   * @returns {{ success: boolean, message: string, item?: object }}
   */
  const addItem = useCallback((itemData) => {
    try {
      const created = repo.create(itemData);
      setItems(repo.getAll());
      appendHistory(construirEntradaHistorial(created, 'agregado'));
      return { success: true, message: '', item: created };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── update ───────────────────────────────────────────────────────────────────
  /**
   * Updates fields of an existing item.
   * @param {string} id
   * @param {object} patch
   * @param {string} [accion]  History action label (default: 'actualizado')
   * @returns {{ success: boolean, message: string, item?: object }}
   */
  const updateItem = useCallback((id, patch, accion = 'actualizado') => {
    try {
      const updated = repo.update(id, patch);
      setItems(repo.getAll());

      // Pick a more descriptive history action based on what changed
      let resolvedAccion = accion;
      if (patch.puntuacion !== undefined) resolvedAccion = 'puntuado';
      else if (patch.favorito !== undefined) resolvedAccion = 'favorito';
      else if (patch.progreso !== undefined) resolvedAccion = 'progreso';

      appendHistory(construirEntradaHistorial(updated, resolvedAccion));
      return { success: true, message: '', item: updated };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── remove ───────────────────────────────────────────────────────────────────
  /**
   * Removes an item by id.
   * @param {string} id
   * @returns {{ success: boolean, message: string }}
   */
  const removeItem = useCallback((id) => {
    try {
      const item = repo.getById(id);
      if (item) appendHistory(construirEntradaHistorial(item, 'eliminado'));
      repo.remove(id);
      setItems(repo.getAll());
      return { success: true, message: '' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, []);

  // ── import batch ────────────────────────────────────────────────────────────
  /**
   * Imports a batch of items, bypassing history log for brevity or logging as batch.
   * @param {object[]} batch
   * @returns {{ success: boolean, addedCount: number, message: string }}
   */
  const importItems = useCallback((batch) => {
    try {
      const addedCount = repo.importBatch(batch);
      if (addedCount > 0) {
        setItems(repo.getAll());
        // Log a single history event for the import
        appendHistory({
          id: `import_${Date.now()}`,
          timestamp: new Date().toISOString(),
          accion: 'importación masiva',
          detalles: `Se importaron ${addedCount} elemento(s).`,
          item_id: null,
          item_titulo: null
        });
      }
      return { success: true, addedCount, message: '' };
    } catch (err) {
      return { success: false, addedCount: 0, message: err.message };
    }
  }, []);

  // ── filtered view ────────────────────────────────────────────────────────────
  /**
   * Returns items for a given section and optional media type filter.
   * @param {string} seccion
   * @param {'anime'|'manga'|'all'} [mediaType]
   * @returns {object[]}
   */
  const getFiltered = useCallback(
    (seccion, mediaType) => filtrarPorSeccion(items, seccion, mediaType),
    [items]
  );

  return { items, addItem, updateItem, removeItem, importItems, getFiltered };
}

