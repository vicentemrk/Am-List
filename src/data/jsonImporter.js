/**
 * data/jsonImporter.js
 * Parses and validates AMlist JSON exports.
 */
import { DEFAULT_ITEM } from '../domain/itemSchema.js';

/**
 * Parses JSON content (File object or JSON string) exported by AMlist.
 * @param {File|string} input
 * @returns {Promise<object[]>} Array of standardized AMlist items
 */
export async function parseAmListJson(input) {
  let jsonText = '';

  if (typeof input === 'string') {
    jsonText = input;
  } else if (input && typeof input.text === 'function') {
    jsonText = await input.text();
  } else {
    throw new Error('Formato de entrada no válido.');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('El archivo no contiene un formato JSON válido.');
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.items)
    ? parsed.items
    : null;

  if (!rawList) {
    throw new Error('El archivo JSON no contiene un listado de AMlist válido.');
  }

  const sanitizedList = rawList
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const mediaType = item.mediaType === 'manga' ? 'manga' : 'anime';
      const malId = Number(item.malId) || 0;
      const id = item.id || `${mediaType}_${malId}`;

      return {
        ...DEFAULT_ITEM,
        ...item,
        id,
        malId,
        mediaType,
        titulo: item.titulo || 'Sin título',
        progreso: {
          actual: Number(item.progreso?.actual) || 0,
          maximo: item.progreso?.maximo != null ? Number(item.progreso.maximo) : null,
        },
        tags: Array.isArray(item.tags) ? item.tags : [],
        genres: Array.isArray(item.genres) ? item.genres : [],
      };
    });

  if (sanitizedList.length === 0) {
    throw new Error('No se encontraron ítems válidos en el archivo JSON.');
  }

  return sanitizedList;
}
