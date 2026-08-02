/**
 * ============================================================================
 * MÓDULO: domain/genreTranslator.js
 * ============================================================================
 * Qué hace:
 *   Proporciona la traducción nativa al español de todos los géneros, etiquetas
 *   y categorías de anime y manga provenientes de APIs externas (AniList, MangaDex, Kitsu).
 * Cómo lo hace:
 *   Función pura sin efectos secundarios basada en un diccionario de mapeo inmutable.
 *   Si un género no se encuentra en el diccionario, lo formatea de manera limpia.
 * ============================================================================
 */

/** Diccionario inmutable de géneros y categorías (Inglés -> Español) */
const GENRE_MAP = /** @type {const} */ ({
  'Action': 'Acción',
  'Adventure': 'Aventura',
  'Comedy': 'Comedia',
  'Drama': 'Drama',
  'Fantasy': 'Fantasía',
  'Horror': 'Terror',
  'Mahou Shoujo': 'Chicas Mágicas',
  'Mecha': 'Mecha',
  'Music': 'Música',
  'Mystery': 'Misterio',
  'Psychological': 'Psicológico',
  'Romance': 'Romance',
  'Sci-Fi': 'Ciencia Ficción',
  'Slice of Life': 'Recuentos de la Vida',
  'Sports': 'Deportes',
  'Supernatural': 'Sobrenatural',
  'Thriller': 'Suspenso',
  'Suspense': 'Suspenso',
  'Ecchi': 'Ecchi',
  'Hentai': 'Hentai',
  'Shounen': 'Shonen',
  'Shoujo': 'Shojo',
  'Seinen': 'Seinen',
  'Josei': 'Josei',
  'Isekai': 'Isekai',
  'Reincarnation': 'Reencarnación',
  'Super Power': 'Superpoderes',
  'Martial Arts': 'Artes Marciales',
  'Historical': 'Histórico',
  'Military': 'Militar',
  'Mythology': 'Mitología',
  'Parody': 'Parodia',
  'Space': 'Espacio',
  'Vampire': 'Vampiros',
  'Vampires': 'Vampiros',
  'Gourmet': 'Gastronomía',
  'School': 'Escolar',
  'Workplace': 'Laboral',
  'Medical': 'Medicina',
  'Idols (Female)': 'Idols (Femenino)',
  'Idols (Male)': 'Idols (Masculino)',
  'Award Winning': 'Premiado',
});

/**
 * Traduce un solo género o categoría al español.
 * 
 * @param {string} genre - Nombre del género en inglés o español.
 * @returns {string} Nombre del género traducido en español.
 */
export function translateGenre(genre) {
  if (typeof genre !== 'string' || !genre.trim()) return '';
  const trimmed = genre.trim();
  
  // Coincidencia exacta en el diccionario
  if (GENRE_MAP[trimmed]) {
    return GENRE_MAP[trimmed];
  }

  // Búsqueda insensible a mayúsculas/minúsculas
  const lower = trimmed.toLowerCase();
  const foundKey = Object.keys(GENRE_MAP).find((key) => key.toLowerCase() === lower);
  if (foundKey) {
    return GENRE_MAP[foundKey];
  }

  return trimmed;
}

/**
 * Traduce una lista de géneros al español y elimina duplicados.
 * 
 * @param {string[]} genres - Arreglo de géneros.
 * @returns {string[]} Lista de géneros traducidos al español.
 */
export function translateGenres(genres) {
  if (!Array.isArray(genres)) return [];
  const translated = genres.map(translateGenre).filter(Boolean);
  return Array.from(new Set(translated));
}
