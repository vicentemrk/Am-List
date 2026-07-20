/**
 * data/itemsRepository.js
 * Single access point for all CRUD operations on items in localStorage.
 *
 * ID convention: `${mediaType}_${malId}` — deterministic and deduplicated.
 * Schema validation and progress validation are applied before every write.
 */

import { DEFAULT_ITEM } from '../domain/itemSchema.js';
import { validarProgreso, validarPuntuacion } from '../domain/validators.js';

const STORAGE_KEY = 'amlist_items';

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads the raw array from localStorage.
 * Returns [] if the key is missing, or if the stored JSON is malformed.
 * Corrupt individual items are silently skipped.
 * @returns {object[]}
 */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any items that are missing the minimum required fields
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
        // Migrate old single 'tag' string → discard, start fresh with []
        tags: Array.isArray(item.tags) ? item.tags : [],
        tag: undefined, // remove old field
        // Ensure genres and sinopsis exist
        genres:   Array.isArray(item.genres) ? item.genres : [],
        sinopsis: typeof item.sinopsis === 'string' ? item.sinopsis : '',
      }));
  } catch {
    return [];
  }
}

/** Writes the full array back to localStorage */
function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Validates the item schema before writing.
 * @param {object} item
 * @throws {Error} if schema is invalid
 */
function assertSchema(item) {
  if (!item || typeof item !== 'object') throw new Error('El ítem debe ser un objeto.');
  if (!item.id || typeof item.id !== 'string') throw new Error('El ítem necesita un id válido.');
  if (!['anime', 'manga'].includes(item.mediaType))
    throw new Error(`mediaType inválido: "${item.mediaType}".`);
  if (typeof item.titulo !== 'string' || item.titulo.trim() === '')
    throw new Error('El ítem necesita un título.');

  // Validate progress
  const progresoResult = validarProgreso(
    item.progreso?.actual ?? 0,
    item.progreso?.maximo ?? null
  );
  if (!progresoResult.valid) throw new Error(progresoResult.message);

  // Validate score (optional)
  const puntuacionResult = validarPuntuacion(item.puntuacion ?? null);
  if (!puntuacionResult.valid) throw new Error(puntuacionResult.message);
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Returns all stored items.
 * Corrupt entries are silently skipped; the app never crashes.
 * @returns {object[]}
 */
export function getAll() {
  return readAll();
}

/**
 * Returns a single item by id, or null if not found.
 * @param {string} id
 * @returns {object|null}
 */
export function getById(id) {
  return readAll().find((item) => item.id === id) ?? null;
}

/**
 * Creates a new item.
 * The id must follow the `${mediaType}_${malId}` convention and be unique.
 * @param {object} item  Must include at minimum: id, malId, mediaType, titulo
 * @returns {object}  The stored item
 * @throws {Error}  If schema is invalid or item already exists
 */
export function create(item) {
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
}

/**
 * Updates fields of an existing item.
 * Progress validation is enforced — the write is blocked if invalid.
 * @param {string} id
 * @param {Partial<typeof DEFAULT_ITEM>} patch
 * @returns {object}  The updated item
 * @throws {Error}  If item not found or schema is invalid
 */
export function update(id, patch) {
  const items = readAll();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error(`Ítem "${id}" no encontrado.`);

  const existing = items[index];
  const updated = {
    ...existing,
    ...patch,
    // Deep-merge progreso so callers can pass partial { actual } or { maximo }
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
}

/**
 * Removes an item by id.
 * @param {string} id
 * @throws {Error}  If item not found
 */
export function remove(id) {
  const items = readAll();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error(`Ítem "${id}" no encontrado.`);
  items.splice(index, 1);
  writeAll(items);
}

/**
 * Imports a batch of items, keeping local priority.
 * Items that already exist in localStorage (by id) are completely ignored.
 * Only completely new items are added.
 * @param {object[]} importedItems
 * @returns {number} The amount of items successfully added
 */
export function importBatch(importedItems) {
  const existing = readAll();
  const existingIds = new Set(existing.map((i) => i.id));
  let addedCount = 0;

  const newItems = [];
  for (const item of importedItems) {
    if (existingIds.has(item.id)) continue; // Keep local data priority
    assertSchema(item);
    newItems.push(item);
    existingIds.add(item.id);
    addedCount++;
  }

  if (addedCount > 0) {
    writeAll([...existing, ...newItems]);
  }
  return addedCount;
}

