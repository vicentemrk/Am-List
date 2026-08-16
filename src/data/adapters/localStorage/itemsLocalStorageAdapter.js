/**
 * ============================================================================
 * ADAPTADOR DE INFRAESTRUCTURA: data/adapters/localStorage/itemsLocalStorageAdapter.js
 * ============================================================================
 * Qué hace:
 *   Implementa concretamente el puerto `ItemsRepositoryPort` utilizando el
 *   almacenamiento local del navegador (`window.localStorage`).
 * 
 * Cómo funciona:
 *   - Lee y escribe arreglos de objetos JSON bajo la clave `amlist_items`.
 *   - Enforza la convención de IDs `${mediaType}_${malId}` para evitar duplicados.
 *   - Ejecuta las validaciones de las reglas de negocio (`validarProgreso`, `validarPuntuacion`)
 *     antes de persisitir los datos.
 *   - Maneja tolerancias a fallos: si `localStorage` se corrompe, rescata los datos sanos.
 * ============================================================================
 */

import { DEFAULT_ITEM } from '../../../domain/itemSchema.js';
import { validarProgreso, validarPuntuacion, validarEstadoUsuario } from '../../../domain/validators.js';


const STORAGE_KEY = 'amlist_items';

/**
 * Lee la colección almacenada en `localStorage`.
 * @returns {object[]} Lista de ítems limpios.
 */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          item.id.length > 0
      )
      .map((item) => ({
        ...item,
        // v1.2: Migración automática — 'completado' fue eliminado, se mapea a 'finalizado'
        estadoUsuario: item.estadoUsuario === 'completado' ? 'finalizado' : item.estadoUsuario,
        tags: Array.isArray(item.tags) ? item.tags : [],
        tag: undefined,
        genres:   Array.isArray(item.genres) ? item.genres : [],
        sinopsis: typeof item.sinopsis === 'string' ? item.sinopsis : '',
      }));
  } catch {
    return [];
  }
}

/**
 * Escribe la colección completa en `localStorage`.
 * @param {object[]} items - Arreglo de ítems a serializar.
 */
function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Valida la integridad de un ítem según las reglas de negocio.
 * @param {object} item - Objeto a validar.
 */
function assertSchema(item) {
  if (!item || typeof item !== 'object') throw new Error('El ítem debe ser un objeto.');
  if (!item.id || typeof item.id !== 'string') throw new Error('El ítem necesita un id válido.');
  if (!['anime', 'manga'].includes(item.mediaType))
    throw new Error(`mediaType inválido: "${item.mediaType}".`);
  if (typeof item.titulo !== 'string' || item.titulo.trim() === '')
    throw new Error('El ítem necesita un título.');

  const progresoResult = validarProgreso(
    item.progreso?.actual ?? 0,
    item.progreso?.maximo ?? null
  );
  if (!progresoResult.valid) throw new Error(progresoResult.message);

  const estadoResult = validarEstadoUsuario(item.estadoUsuario);
  if (!estadoResult.valid) throw new Error(estadoResult.message);

  const puntuacionResult = validarPuntuacion(item.puntuacion ?? null);
  if (!puntuacionResult.valid) throw new Error(puntuacionResult.message);

}

/**
 * Adaptador Concreto de LocalStorage para Ítems.
 * Cumple con la interfaz `ItemsRepositoryPort`.
 */
export const itemsLocalStorageAdapter = {
  /**
   * Obtiene todos los animes/mangas guardados.
   * @returns {object[]}
   */
  getAll() {
    return readAll();
  },

  /**
   * Obtiene un ítem por su ID.
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    return readAll().find((item) => item.id === id) ?? null;
  },

  /**
   * Guarda un nuevo ítem.
   * @param {object} item
   * @returns {object}
   */
  create(item) {
    const now = new Date().toISOString();
    const full = {
      ...DEFAULT_ITEM,
      ...item,
      progreso: { ...DEFAULT_ITEM.progreso, ...(item.progreso ?? {}) },
      creadoEn:      now,
      actualizadoEn: now,
    };

    assertSchema(full);

    const items = readAll();
    if (items.some((i) => i.id === full.id)) {
      throw new Error(`El ítem con id "${full.id}" ya existe.`);
    }

    writeAll([...items, full]);
    return full;
  },

  /**
   * Actualiza un ítem existente.
   * @param {string} id
   * @param {object} patch
   * @returns {object}
   */
  update(id, patch) {
    const items = readAll();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Ítem "${id}" no encontrado.`);

    const existing = items[index];
    const updated = {
      ...existing,
      ...patch,
      progreso: {
        ...existing.progreso,
        ...(patch.progreso ?? {}),
      },
      actualizadoEn: new Date().toISOString(),
    };

    assertSchema(updated);

    items[index] = updated;
    writeAll(items);
    return updated;
  },

  /**
   * Borra un ítem.
   * @param {string} id
   */
  remove(id) {
    const items = readAll();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Ítem "${id}" no encontrado.`);
    items.splice(index, 1);
    writeAll(items);
  },

  /**
   * Importa ítems en lote.
   * @param {object[]} importedItems
   * @returns {number}
   */
  importBatch(importedItems) {
    const existing = readAll();
    const itemMap = new Map(existing.map((i) => [i.id, i]));
    let addedCount = 0;

    for (const item of importedItems) {
      assertSchema(item);
      // Regla 5: Al importar, tus datos locales ganan SIEMPRE.
      // Si el ítem ya existe en la lista local, se ignora la versión importada.
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, item);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      writeAll(Array.from(itemMap.values()));
    }
    return addedCount;
  },
};
