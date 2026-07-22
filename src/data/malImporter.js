/**
 * data/malImporter.js
 * Lógica para leer y parsear un archivo XML exportado desde MyAnimeList con sanitización.
 */

import { DEFAULT_ITEM } from '../domain/itemSchema.js';

/**
 * Sanitizes input strings from XML nodes.
 * @param {string|null|undefined} str
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

/**
 * Convierte el texto de estado de MyAnimeList a nuestro estado interno.
 */
function mapMalStatus(malStatus) {
  if (!malStatus) return 'por_ver';
  const s = malStatus.toLowerCase();
  if (s === 'watching' || s === 'reading') return 'en_curso';
  if (s === 'completed') return 'completado';
  if (s === 'on-hold') return 'pausado';
  if (s === 'dropped') return 'dropeado';
  if (s === 'plan to watch' || s === 'plan to read') return 'por_ver';
  return 'por_ver';
}

/**
 * Toma un File (XML), lo lee con FileReader y DOMParser, 
 * y devuelve un array de objetos listos para guardar en itemsRepository.
 * 
 * @param {File} file 
 * @returns {Promise<object[]>}
 */
export async function parseMalXml(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');

        // Check for parse errors
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
          throw new Error('El archivo XML tiene un formato inválido.');
        }

        const items = [];
        // Extract Anime
        const animeNodes = xmlDoc.getElementsByTagName('anime');
        for (let i = 0; i < animeNodes.length; i++) {
          const node = animeNodes[i];
          const rawMalId = node.querySelector('series_animedb_id')?.textContent;
          const rawTitle = node.querySelector('series_title')?.textContent;

          const malId = sanitizeString(rawMalId);
          const titulo = sanitizeString(rawTitle);

          if (!malId || !titulo) continue; // Skip if invalid

          const watched = parseInt(node.querySelector('my_watched_episodes')?.textContent || '0', 10);
          const total = parseInt(node.querySelector('series_episodes')?.textContent || '0', 10);
          const score = parseInt(node.querySelector('my_score')?.textContent || '0', 10);
          const status = sanitizeString(node.querySelector('my_status')?.textContent);

          items.push({
            ...DEFAULT_ITEM,
            id: `anime_${malId}`,
            malId: Number(malId) || 0,
            mediaType: 'anime',
            titulo: titulo,
            puntuacion: score > 0 && score <= 10 ? score : null,
            estadoUsuario: mapMalStatus(status),
            progreso: {
              actual: isNaN(watched) ? 0 : Math.max(0, watched),
              maximo: (isNaN(total) || total <= 0) ? null : total,
            },
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
          });
        }

        // Return parsed items
        resolve(items);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file);
  });
}
