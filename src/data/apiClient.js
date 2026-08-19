/**
 * data/apiClient.js
 * Multi-API client with automatic fallback: AniList → MangaDex → Kitsu.
 * Note: Jikan was permanently removed. See ADR-0001.
 */

import { translateGenres } from '../domain/genreTranslator.js';
import { inferItemType } from '../domain/itemSchema.js';

const ANILIST_BASE_URL = 'https://graphql.anilist.co';
const KITSU_BASE_URL = 'https://kitsu.io/api/edge';
const TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes
const MEM_CACHE_MAX = 20;
const LS_CACHE_KEY = 'amlist_search_cache';

// ─── typed error ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

// ─── in-memory LRU cache ──────────────────────────────────────────────────────

const memCache = new Map();

function memGet(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return entry.data;
}

function memSet(key, data) {
  if (memCache.size >= MEM_CACHE_MAX) {
    memCache.delete(memCache.keys().next().value);
  }
  memCache.set(key, { data, ts: Date.now() });
}

// ─── localStorage cache ───────────────────────────────────────────────────────

function lsGet(key) {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    const entry = store[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function lsSet(key, data) {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    Object.keys(store).forEach((k) => {
      if (Date.now() - store[k].ts > CACHE_TTL_MS) delete store[k];
    });
    store[key] = { data, ts: Date.now() };
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(store));
  } catch {
    // Storage full — ignore
  }
}

// ─── AniList normalization ─────────────────────────────────────────────────────

function mapAniListStatus(status) {
  if (!status) return 'unknown';
  const s = status.toUpperCase();
  if (s === 'RELEASING') return 'airing';
  if (s === 'FINISHED') return 'complete';
  if (s === 'NOT_YET_RELEASED') return 'upcoming';
  return 'unknown';
}

function mapAniListTipo(raw, mediaType) {
  const format = (raw.format || '').toUpperCase();
  const country = (raw.countryOfOrigin || '').toUpperCase();

  if (mediaType === 'manga') {
    if (country === 'KR') return 'Manhwa';
    if (country === 'CN' || country === 'TW' || country === 'HK') return 'Manhua';
    if (format === 'NOVEL') return 'Novela';
    if (format === 'ONE_SHOT') return 'One-shot';
    return 'Manga';
  } else {
    if (format === 'MOVIE') return 'Película';
    if (format === 'OVA') return 'OVA';
    if (format === 'ONA') return 'ONA';
    if (format === 'SPECIAL') return 'Especial';
    if (format === 'MUSIC') return 'Music';
    if (format === 'TV' || format === 'TV_SHORT') return 'TV';
    return 'Anime';
  }
}

function normalizeAniList(raw, mediaType) {
  // Use idMal if available, otherwise fallback to 'al' prefix so we don't conflict.
  // The app uses `malId` to construct `${mediaType}_${malId}`.
  const malId = raw.idMal ? raw.idMal : `al${raw.id}`;
  const titulo = raw.title?.english || raw.title?.romaji || raw.title?.native || '';
  const detectedTipo = mapAniListTipo(raw, mediaType) || inferItemType({ titulo, mediaType });

  return {
    malId:         malId,
    mediaType:     mediaType,
    tipo:          detectedTipo,
    titulo:        titulo,
    imagen:        raw.coverImage?.large || raw.coverImage?.medium || '',
    estadoEmision: mapAniListStatus(raw.status),
    progreso: {
      actual: 0,
      maximo: mediaType === 'anime' ? (raw.episodes ?? null) : (raw.chapters ?? null),
    },
    // AniList description contains HTML, stripping it simple way
    sinopsis:  (raw.description || '').replace(/<[^>]*>?/gm, ''),
    // AniList score is 0-100, convert to 1-10 (Jikan scale)
    score:     raw.averageScore ? (raw.averageScore / 10).toFixed(2) : null,
    genres:    translateGenres(raw.genres || []),
    source:    'AniList'
  };
}

// ─── core fetchers ────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, options, externalSignal) {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  const signals = [timeoutController.signal];
  if (externalSignal) signals.push(externalSignal);
  const combinedSignal = AbortSignal.any
    ? AbortSignal.any(signals)
    : timeoutController.signal;

  try {
    const response = await fetch(url, { ...options, signal: combinedSignal });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw new ApiError('Búsqueda cancelada.', 'CANCELLED');
      }
      throw new ApiError('La solicitud tardó demasiado.', 'TIMEOUT');
    }
    throw new ApiError('Error de red.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

async function searchAniList(q, type, signal) {
  const query = `
    query ($search: String, $type: MediaType) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: $type, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native userPreferred }
          coverImage { large medium }
          countryOfOrigin
          format
          status
          episodes
          chapters
          averageScore
          genres
          description
        }
      }
    }
  `;

  const variables = {
    search: q,
    type: type === 'anime' ? 'ANIME' : 'MANGA'
  };

  const response = await fetchWithTimeout(ANILIST_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables })
  }, signal);

  if (!response.ok) {
    throw new ApiError(`AniList Error HTTP ${response.status}`, response.status);
  }

  const json = await response.json();
  const results = json.data?.Page?.media;
  if (!Array.isArray(results)) return [];

  return results.map(item => normalizeAniList(item, type));
}

// ─── Kitsu normalization ───────────────────────────────────────────────────────

function mapKitsuStatus(status) {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s === 'current' || s === 'airing') return 'airing';
  if (s === 'finished') return 'complete';
  if (s === 'upcoming' || s === 'unreleased' || s === 'tba') return 'upcoming';
  return 'unknown';
}

function mapKitsuTipo(raw, mediaType) {
  const attrs = raw.attributes || {};
  const subtype = (attrs.subtype || attrs.mangaType || attrs.showType || '').toLowerCase();
  if (subtype === 'manhwa') return 'Manhwa';
  if (subtype === 'manhua') return 'Manhua';
  if (subtype === 'novel') return 'Novela';
  if (subtype === 'oneshot') return 'One-shot';
  if (subtype === 'doujin') return 'Doujinshi';
  if (subtype === 'manga') return 'Manga';
  if (subtype === 'movie') return 'Película';
  if (subtype === 'special') return 'Especial';
  if (subtype === 'ova') return 'OVA';
  if (subtype === 'ona') return 'ONA';
  if (subtype === 'tv') return 'TV';
  return mediaType === 'anime' ? 'Anime' : 'Manga';
}

function normalizeKitsu(raw, mediaType) {
  const attrs = raw.attributes || {};
  const titulo = attrs.canonicalTitle || attrs.en || attrs.en_jp || '';
  const detectedTipo = mapKitsuTipo(raw, mediaType) || inferItemType({ titulo, mediaType });

  return {
    malId:         `kitsu_${raw.id}`,
    mediaType:     mediaType,
    tipo:          detectedTipo,
    titulo:        titulo,
    imagen:        attrs.posterImage?.large || attrs.posterImage?.small || '',
    estadoEmision: mapKitsuStatus(attrs.status),
    progreso: {
      actual: 0,
      maximo: mediaType === 'anime' ? (attrs.episodeCount ?? null) : (attrs.chapterCount ?? null),
    },
    sinopsis:  attrs.synopsis || '',
    score:     attrs.averageRating ? (Number(attrs.averageRating) / 10).toFixed(2) : null,
    genres:    [], // Kitsu genres require separate include, keeping it simple
    source:    'Kitsu'
  };
}

async function searchKitsu(q, type, signal) {
  const url = `${KITSU_BASE_URL}/${type}?filter[text]=${encodeURIComponent(q)}&page[limit]=20`;
  const response = await fetchWithTimeout(url, {
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }
  }, signal);

  if (!response.ok) {
    throw new ApiError(`Kitsu Error HTTP ${response.status}`, response.status);
  }

  const json = await response.json();
  if (!json || !Array.isArray(json.data)) return [];

  return json.data.map(item => normalizeKitsu(item, type));
}

// ─── MangaDex normalization (Manga Only) ──────────────────────────────────────

function mapMangaDexStatus(status) {
  if (!status) return 'unknown';
  if (status === 'ongoing') return 'airing';
  if (status === 'completed') return 'complete';
  if (status === 'hiatus') return 'pausado';
  return 'unknown';
}

function mapMangaDexTipo(raw) {
  const attrs = raw.attributes || {};
  const lang = (attrs.originalLanguage || '').toLowerCase();
  if (lang === 'ko') return 'Manhwa';
  if (lang === 'zh' || lang === 'zh-hk' || lang === 'zh-ro') return 'Manhua';
  if (lang === 'ja') return 'Manga';
  if (lang === 'en') return 'Cómic';
  return 'Manga';
}

function normalizeMangaDex(raw) {
  const attrs = raw.attributes || {};
  const coverRel = (raw.relationships || []).find(r => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;
  const imagen = coverFileName ? `https://uploads.mangadex.org/covers/${raw.id}/${coverFileName}.256.jpg` : '';
  
  const rawTags = (attrs.tags || []).map(t => t.attributes?.name?.en).filter(Boolean);
  const sinopsisEsp = attrs.description?.['es-la'] || attrs.description?.es || attrs.description?.en || Object.values(attrs.description || {})[0] || '';

  // Extraer el mejor título disponible (en, romaji o el primero disponible)
  const mainTitle = attrs.title?.en || attrs.title?.['ja-ro'] || attrs.title?.['ko-ro'] || attrs.title?.['zh-ro'] || Object.values(attrs.title || {})[0] || '';
  const detectedTipo = mapMangaDexTipo(raw) || inferItemType({ titulo: mainTitle, mediaType: 'manga', tags: rawTags });

  return {
    malId:         `md_${raw.id}`,
    mediaType:     'manga',
    tipo:          detectedTipo,
    titulo:        mainTitle,
    imagen:        imagen,
    estadoEmision: mapMangaDexStatus(attrs.status),
    progreso: {
      actual: 0,
      maximo: attrs.lastChapter ? parseInt(attrs.lastChapter, 10) : null,
    },
    sinopsis:  sinopsisEsp,
    score:     null, // MangaDex stats need separate API call
    genres:    translateGenres(rawTags),
    source:    'MangaDex'
  };
}

async function searchMangaDex(q, signal) {
  // Incluir todas las clasificaciones de contenido para no excluir manhwas maduros/acción (safe, suggestive, erotica)
  const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=20&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&order[relevance]=desc`;
  const response = await fetchWithTimeout(url, {}, signal);

  if (!response.ok) {
    throw new ApiError(`MangaDex Error HTTP ${response.status}`, response.status);
  }

  const json = await response.json();
  if (!json || !Array.isArray(json.data)) return [];

  return json.data.map(normalizeMangaDex);
}

// ─── Deduplicación y fusión de resultados Manga/Manhwa ─────────────────────────

function normalizeTitleForDeduplication(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

function mergeMangaResults(mdResults, alResults) {
  const merged = [...mdResults];
  const existingTitles = new Set(mdResults.map(r => normalizeTitleForDeduplication(r.titulo)).filter(Boolean));

  for (const alItem of alResults) {
    const norm = normalizeTitleForDeduplication(alItem.titulo);
    if (!norm || !existingTitles.has(norm)) {
      merged.push(alItem);
      if (norm) existingTitles.add(norm);
    }
  }

  return merged;
}

// ─── Multi-API Orchestrator ───────────────────────────────────────────────────

async function searchWithFallback(q, type, signal) {
  if (!q.trim()) return [];

  const cacheKey = `${type}::${q.toLowerCase()}`;
  const cached = memGet(cacheKey) ?? lsGet(cacheKey);
  if (cached) return cached;

  let results = [];

  if (type === 'manga') {
    // Búsqueda paralela unificada: MangaDex + AniList simultáneos para maximizar manhwas, mangas y manhuas
    const [mdRes, alRes] = await Promise.allSettled([
      searchMangaDex(q, signal),
      searchAniList(q, 'manga', signal)
    ]);

    const mdList = mdRes.status === 'fulfilled' ? mdRes.value : [];
    const alList = alRes.status === 'fulfilled' ? alRes.value : [];

    results = mergeMangaResults(mdList, alList);
  } else {
    // Anime: AniList primario
    try {
      results = await searchAniList(q, type, signal);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CANCELLED') throw err;
    }
  }

  // Si no hubo resultados o fallaron las principales, fallback a Kitsu
  if (results.length === 0 && !signal?.aborted) {
    try {
      results = await searchKitsu(q, type, signal);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CANCELLED') throw err;
      throw new ApiError('Todas las APIs fallaron o no hay resultados.', 'NETWORK');
    }
  }

  if (results.length > 0) {
    memSet(cacheKey, results);
    lsSet(cacheKey, results);
  }
  return results;
}

export async function searchAnime(query, signal = null) {
  return searchWithFallback(query, 'anime', signal);
}

export async function searchManga(query, signal = null) {
  return searchWithFallback(query, 'manga', signal);
}
