/**
 * data/kitsuImporter.js
 * Parses Kitsu JSON export files into AMlist items schema.
 */
import { DEFAULT_ITEM, inferItemType } from '../domain/itemSchema.js';
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

  if (!json || !Array.isArray(json.data)) {
    throw new Error('El archivo no tiene el formato de exportación de Kitsu.');
  }

  // Pre-index included resources for fast O(1) lookup
  const includedMap = new Map();
  if (Array.isArray(json.included)) {
    for (const item of json.included) {
      if (item.type && item.id) {
        includedMap.set(`${item.type}_${item.id}`, item);
      }
    }
  }

  const items = [];

  for (const entry of json.data) {
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

    const subtype = (mediaAttrs.subtype || mediaAttrs.mangaType || mediaAttrs.showType || '').toLowerCase();
    let tipo = '';
    if (subtype === 'manhwa') tipo = 'Manhwa';
    else if (subtype === 'manhua') tipo = 'Manhua';
    else if (subtype === 'novel') tipo = 'Novela';
    else if (subtype === 'oneshot') tipo = 'One-shot';
    else if (subtype === 'doujin') tipo = 'Doujinshi';
    else if (subtype === 'manga') tipo = 'Manga';
    else if (subtype === 'movie') tipo = 'Película';
    else if (subtype === 'special') tipo = 'Especial';
    else if (subtype === 'ova') tipo = 'OVA';
    else if (subtype === 'ona') tipo = 'ONA';
    else if (subtype === 'tv') tipo = 'TV';
    tipo = tipo || inferItemType({ titulo, mediaType });

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
      tipo,
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
