/**
 * ============================================================================
 * MÓDULO: data/itemsRepository.js
 * ============================================================================
 * Qué hace:
 *   Punto único de acceso para todas las operaciones CRUD (Crear, Leer, Actualizar,
 *   Borrar) de la colección de animes y mangas en `localStorage`.
 * Cómo lo hace:
 *   Utiliza la convención de IDs `${mediaType}_${malId}` para prevenir duplicados.
 *   Aplica validaciones estrictas de esquema y progreso antes de escribir en disco.
 *   Si los datos están dañados, recupera los ítems sanos sin romper la aplicación.
 * ============================================================================
 */

import { DEFAULT_ITEM } from '../domain/itemSchema.js';
import { validarProgreso, validarPuntuacion } from '../domain/validators.js';

const STORAGE_KEY = 'amlist_items';

// ─── Funciones Auxiliares Privadas ───────────────────────────────────────────

/**
 * Lee el arreglo crudo de ítems guardados en `localStorage`.
 * 
 * Qué hace:
 *   Recupera el JSON almacenado en el navegador de manera segura.
 * Cómo lo hace:
 *   Usa `try/catch` para capturar JSON malformado. Filtra elementos corruptos y
 *   garantiza que propiedades como `tags`, `genres` y `sinopsis` estén correctamente formateadas.
 * 
 * @returns {object[]} Lista de ítems válidos o arreglo vacío si no hay datos.
 */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Filtrar cualquier elemento que no cumpla con los requisitos mínimos de estructura
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
        // Migración de datos: asegurar que 'tags' sea un arreglo
        tags: Array.isArray(item.tags) ? item.tags : [],
        tag: undefined, // Eliminar campo en desuso
        genres:   Array.isArray(item.genres) ? item.genres : [],
        sinopsis: typeof item.sinopsis === 'string' ? item.sinopsis : '',
      }));
  } catch {
    return [];
  }
}

/** Escribe la lista completa de ítems procesados nuevamente en `localStorage` */
function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Comprueba la validez de un ítem antes de guardarlo en disco.
 * @param {object} item - Objeto a validar.
 * @throws {Error} Si el ítem no cumple con el esquema o las reglas de validación.
 */
function assertSchema(item) {
  if (!item || typeof item !== 'object') throw new Error('El ítem debe ser un objeto.');
  if (!item.id || typeof item.id !== 'string') throw new Error('El ítem necesita un id válido.');
  if (!['anime', 'manga'].includes(item.mediaType))
    throw new Error(`mediaType inválido: "${item.mediaType}".`);
  if (typeof item.titulo !== 'string' || item.titulo.trim() === '')
    throw new Error('El ítem necesita un título.');

  // Validación de la regla de progreso máximo
  const progresoResult = validarProgreso(
    item.progreso?.actual ?? 0,
    item.progreso?.maximo ?? null
  );
  if (!progresoResult.valid) throw new Error(progresoResult.message);

  // Validación de la puntuación (opcional)
  const puntuacionResult = validarPuntuacion(item.puntuacion ?? null);
  if (!puntuacionResult.valid) throw new Error(puntuacionResult.message);
}

// ─── API Pública del Repositorio ─────────────────────────────────────────────

/**
 * Obtiene todos los ítems almacenados.
 * @returns {object[]} Lista de todos los animes y mangas guardados.
 */
export function getAll() {
  return readAll();
}

/**
 * Busca un ítem individual por su identificador único.
 * @param {string} id - Identificador (ej: "anime_12345").
 * @returns {object|null} El ítem encontrado o null.
 */
export function getById(id) {
  return readAll().find((item) => item.id === id) ?? null;
}

/**
 * Crea y guarda un nuevo ítem en la colección.
 * @param {object} item - Datos del nuevo ítem.
 * @returns {object} El ítem guardado completo.
 * @throws {Error} Si ya existe o si rompe la validación.
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
 * Actualiza los campos de un ítem existente.
 * @param {string} id - ID del ítem a modificar.
 * @param {Partial<typeof DEFAULT_ITEM>} patch - Objeto con los campos a actualizar.
 * @returns {object} El ítem actualizado.
 */
export function update(id, patch) {
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
}

/**
 * Elimina un ítem de la colección por su id.
 * @param {string} id - ID del ítem a borrar.
 */
export function remove(id) {
  const items = readAll();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error(`Ítem "${id}" no encontrado.`);
  items.splice(index, 1);
  writeAll(items);
}

/**
 * Importa un conjunto de ítems en lote.
 * Si el ítem ya existe, lo actualiza combinando la información. Si es nuevo, lo agrega.
 * @param {object[]} importedItems - Arreglo de ítems importados.
 * @returns {number} Cantidad de ítems importados exitosamente.
 */
export function importBatch(importedItems) {
  const existing = readAll();
  const itemMap = new Map(existing.map((i) => [i.id, i]));
  let processedCount = 0;

  for (const item of importedItems) {
    assertSchema(item);
    if (itemMap.has(item.id)) {
      const prev = itemMap.get(item.id);
      itemMap.set(item.id, {
        ...prev,
        ...item,
        progreso: {
          ...prev.progreso,
          ...(item.progreso ?? {}),
        },
        actualizadoEn: new Date().toISOString(),
      });
    } else {
      itemMap.set(item.id, item);
    }
    processedCount++;
  }

  if (processedCount > 0) {
    writeAll(Array.from(itemMap.values()));
  }
  return processedCount;
}


