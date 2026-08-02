/**
 * ============================================================================
 * MÓDULO DE INFRAESTRUCTURA: data/translationService.js
 * ============================================================================
 * Qué hace:
 *   Servicio de traducción de sinopsis y textos al español utilizando cachés en
 *   memoria y `localStorage` para minimizar llamadas a la red.
 * Cómo lo hace:
 *   - Consulta primero la caché persistente `amlist_synopsis_cache`.
 *   - Si no está en caché, utiliza un endpoint público de traducción automática
 *     con un tiempo límite de 3.5 segundos (`AbortController`).
 *   - Si la red o el servicio fallan, devuelve el texto original sin romper la app.
 * ============================================================================
 */

const STORAGE_KEY = 'amlist_synopsis_cache';
const TIMEOUT_MS = 3500;
const memCache = new Map();

/**
 * Lee la caché persistente de sinopsis desde `localStorage`.
 * @returns {Record<string, string>}
 */
function getLsCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Guarda una sinopsis traducida en la caché de `localStorage`.
 * @param {string} key
 * @param {string} translatedText
 */
function setLsCache(key, translatedText) {
  try {
    const cache = getLsCache();
    cache[key] = translatedText;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Almacenamiento lleno — ignora silenciosamente
  }
}

/**
 * Genera un hash numérico simple como clave de caché para textos largos.
 * @param {string} str
 * @returns {string}
 */
function hashKey(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `syn_${Math.abs(hash)}`;
}

/**
 * Traduce una sinopsis o texto en inglés al español.
 * 
 * @param {string} text - Texto en inglés a traducir.
 * @returns {Promise<string>} Texto traducido al español (o el texto original en caso de fallo).
 */
export async function translateToSpanish(text) {
  if (typeof text !== 'string' || !text.trim()) return '';

  const cleanText = text.trim();
  
  // Si el texto es muy corto o parece estar vacío, retornar
  if (cleanText.length < 5) return cleanText;

  const key = hashKey(cleanText);

  // 1. Revisar caché en memoria
  if (memCache.has(key)) {
    return memCache.get(key);
  }

  // 2. Revisar caché en localStorage
  const lsCache = getLsCache();
  if (lsCache[key]) {
    memCache.set(key, lsCache[key]);
    return lsCache[key];
  }

  // 3. Ejecutar llamada al servicio libre de traducción
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return cleanText;
    }

    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedParts = data[0]
        .map((part) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
        .filter(Boolean);
      
      const resultText = translatedParts.join('').trim();
      if (resultText) {
        memCache.set(key, resultText);
        setLsCache(key, resultText);
        return resultText;
      }
    }
  } catch {
    // Si falla la red, el timeout o el parser, retorna de forma segura el texto original
  } finally {
    clearTimeout(timer);
  }

  return cleanText;
}
