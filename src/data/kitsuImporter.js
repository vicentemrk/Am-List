/**
 * data/kitsuImporter.js
 * Parses Kitsu JSON export files into AMlist items schema.
 */
import { DEFAULT_ITEM } from '../domain/itemSchema.js';
import { sanitizeText } from '../domain/sanitizer.js';

function mapKitsuStatus(status) {
  if (!status) return 'por_ver';
  const s = status.toLowerCase();
  if (s === 'current') return 'en_curso';
  if (s === 'completed') return 'finalizado';
  if (s === 'on_hold') return 'pausado';
  if (s === 'dropped') return 'dropeado';
  if (s === 'planned') return 'por_ver';
  return 'por_ver';
}

/**
 * Parses JSON content (File object or JSON string) exported by Kitsu.
 * @param {File|string} content
 * @returns {Promise<object[]>}
 */
export async function parseKitsuJson(content) {
  let rawText;
  if (typeof content === 'string') {
    rawText = content;
  } else if (content && typeof content.text === 'function') {
    rawText = await content.text();
  } else {
    throw new Error('Entrada no válida para el importador de Kitsu.');
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error('Formato JSON inválido.');
  }

  const entries = json?.data;
  if (!Array.isArray(entries)) {
    throw new Error('El archivo no tiene el formato de exportación de Kitsu.');
  }

  // Index included media objects by ID
  const includedMap = new Map();
  if (Array.isArray(json.included)) {
    for (const inc of json.included) {
      includedMap.set(`${inc.type}_${inc.id}`, inc);
    }
  }

  const items = [];

  for (const entry of entries) {
    if (entry.type !== 'libraryEntries') continue;

    const attrs = entry.attributes || {};
    const rels = entry.relationships || {};

    const animeRel = rels.anime?.data;
    const mangaRel = rels.manga?.data;

    const mediaRel = animeRel || mangaRel;
    if (!mediaRel) continue;

    const mediaType = animeRel ? 'anime' : 'manga';
    const mediaObj = includedMap.get(`${mediaRel.type}_${mediaRel.id}`);
    const mediaAttrs = mediaObj?.attributes || {};

    const rawTitle = mediaAttrs.canonicalTitle || mediaAttrs.titles?.en || mediaAttrs.titles?.en_jp || 'Sin título';
    const titulo = sanitizeText(rawTitle, { maxLength: 200 });

    const totalProgress = mediaType === 'manga'
      ? mediaAttrs.chapterCount || mediaAttrs.volumeCount || null
      : mediaAttrs.episodeCount || null;

    // Kitsu ratingTwenty is 2-20. Map to 1-10
    const ratingTwenty = Number(attrs.ratingTwenty) || 0;
    const score = ratingTwenty > 0 ? Math.round(ratingTwenty / 2) : 0;

    const item = {
      ...DEFAULT_ITEM,
      id: `${mediaType}_kitsu_${entry.id}_${Math.random().toString(36).slice(2, 6)}`,
      mediaType,
      titulo: titulo || 'Sin título',
      imagen: mediaAttrs.posterImage?.medium || mediaAttrs.posterImage?.original || null,
      sinopsis: sanitizeText(mediaAttrs.synopsis || '', { maxLength: 2000 }),
      descripcionPersonal: sanitizeText(attrs.notes || '', { maxLength: 1000 }),
      estadoUsuario: mapKitsuStatus(attrs.status),
      puntuacion: Math.min(10, Math.max(0, score)),
      progreso: {
        actual: Number(attrs.progress) || 0,
        maximo: totalProgress ? Number(totalProgress) : null,
      },
      tags: ['Kitsu Import'],
      creadoEn: new Date().toISOString(),
    };

    items.push(item);
  }

  return items;
}
