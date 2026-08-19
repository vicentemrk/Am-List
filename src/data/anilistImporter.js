/**
 * data/anilistImporter.js
 * Parses AniList JSON export files into AMlist items schema.
 */
import { DEFAULT_ITEM, inferItemType } from '../domain/itemSchema.js';
import { sanitizeText } from '../domain/sanitizer.js';

function mapAniListStatus(status) {
  if (!status) return 'por_ver';
  const s = status.toUpperCase();
  if (s === 'CURRENT') return 'en_curso';
  if (s === 'COMPLETED') return 'finalizado';
  if (s === 'PAUSED') return 'pausado';
  if (s === 'DROPPED') return 'dropeado';
  if (s === 'PLANNING') return 'por_ver';
  if (s === 'REPEATING') return 'en_curso';
  return 'por_ver';
}

/**
 * Parses JSON content (File object or JSON string) exported by AniList.
 * @param {File|string} content
 * @returns {Promise<object[]>}
 */
export async function parseAniListJson(content) {
  let rawText;
  if (typeof content === 'string') {
    rawText = content;
  } else if (content && typeof content.text === 'function') {
    rawText = await content.text();
  } else {
    throw new Error('Entrada no válida para el importador de AniList.');
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error('Formato JSON inválido.');
  }

  const collection = json?.MediaListCollection || json?.data?.MediaListCollection;
  if (!collection || !Array.isArray(collection.lists)) {
    throw new Error('El archivo no tiene el formato de exportación de AniList.');
  }

  const items = [];

  for (const list of collection.lists) {
    if (!Array.isArray(list.entries)) continue;

    for (const entry of list.entries) {
      const media = entry.media;
      if (!media) continue;

      const titleObj = media.title || {};
      const rawTitle = titleObj.romaji || titleObj.english || titleObj.native || 'Sin título';
      const titulo = sanitizeText(rawTitle, { maxLength: 200 });

      const format = (media.format || '').toUpperCase();
      const isManga = format.includes('MANGA') || format.includes('NOVEL') || format.includes('ONE_SHOT');
      const mediaType = isManga ? 'manga' : 'anime';

      const country = (media.countryOfOrigin || '').toUpperCase();
      let tipo = '';
      if (isManga) {
        if (country === 'KR') tipo = 'Manhwa';
        else if (country === 'CN' || country === 'TW' || country === 'HK') tipo = 'Manhua';
        else if (format.includes('NOVEL')) tipo = 'Novela';
        else if (format.includes('ONE_SHOT')) tipo = 'One-shot';
        else tipo = 'Manga';
      } else {
        if (format.includes('MOVIE')) tipo = 'Película';
        else if (format.includes('OVA')) tipo = 'OVA';
        else if (format.includes('ONA')) tipo = 'ONA';
        else if (format.includes('SPECIAL')) tipo = 'Especial';
        else if (format.includes('TV')) tipo = 'TV';
        else tipo = 'Anime';
      }
      tipo = tipo || inferItemType({ titulo, mediaType });

      const totalProgress = isManga
        ? media.chapters || media.volumes || null
        : media.episodes || null;

      const rawScore = Number(entry.score) || 0;
      // AniList scores can be 0-10, 0-100, or 0-5. Standardize to 0-10 integer
      let score = rawScore;
      if (rawScore > 10) score = Math.round(rawScore / 10);

      const item = {
        ...DEFAULT_ITEM,
        id: `${mediaType}_anilist_${media.id || Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        malId: media.idMal ? String(media.idMal) : null,
        mediaType,
        tipo,
        titulo: titulo || 'Sin título',
        imagen: media.coverImage?.medium || media.coverImage?.large || null,
        sinopsis: sanitizeText((media.description || '').replace(/<[^>]+>/g, ''), { maxLength: 2000 }),
        estadoUsuario: mapAniListStatus(entry.status || list.status),
        puntuacion: Math.min(10, Math.max(0, score)),
        progreso: {
          actual: Number(entry.progress) || 0,
          maximo: totalProgress ? Number(totalProgress) : null,
        },
        genres: Array.isArray(media.genres)
          ? media.genres.map((g) => sanitizeText(g, { maxLength: 50 })).filter(Boolean)
          : [],
        tags: ['AniList Import'],
        creadoEn: new Date().toISOString(),
      };

      items.push(item);
    }
  }

  return items;
}
