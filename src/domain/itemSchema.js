/**
 * ============================================================================
 * MÓDULO: domain/itemSchema.js
 * ============================================================================
 * Qué hace:
 *   Define los esquemas, tipos y constantes puras del dominio para los ítems
 *   (animes y mangas) de AMlist.
 * Cómo lo hace:
 *   Utiliza objetos y arrays de JavaScript inmutables sin ninguna dependencia
 *   de React, manipulaciones del DOM ni llamadas a la red. Garantiza la
 *   consistencia estructural de los datos en toda la aplicación.
 * ============================================================================
 */

/** @typedef {'anime'|'manga'} MediaType - Tipos de medios soportados */
/** @typedef {'por_ver'|'en_curso'|'finalizado'|'pausado'|'dropeado'} EstadoUsuario - Estado asignado por el usuario */

/** @typedef {'airing'|'complete'|'upcoming'|'unknown'} EstadoEmision - Estado de emisión proveniente de la API */

/** Tipos de contenido permitidos */
export const MEDIA_TYPES = /** @type {const} */ (['anime', 'manga']);

/**
 * Lista con las secciones navegables de la aplicación.
 * REGLA: Los tabs se filtran por estadoUsuario excepto 'en_emision' (única excepción
 * que filtra por estadoEmision='airing'). Ver Regla 6 en business_logic.txt.
 * NOTA: 'completado' fue eliminado completamente del sistema en v1.2.
 * La migración automática ocurre en `itemsLocalStorageAdapter.readAll()`.
 */
export const SECCIONES = /** @type {const} */ ([
  'all',
  'por_ver',
  'en_emision',
  'en_curso',
  'favorito',
  'finalizado',
  'pausado',
  'dropeado',
]);

/**
 * NOTA v1.3+: 'favorito' y 'en_emision' son ahora estadoUsuario válidos.
 * - 'favorito': el tab Favoritos filtra por estadoUsuario='favorito'.
 * - 'en_emision': el tab En emisión filtra por estadoUsuario='en_emision' (ya no por estadoEmision API).
 */

/** Nombres descriptivos completos para accesibilidad (aria-label) */
export const SECCION_LABELS = {
  all: 'Lista completa',
  por_ver: 'Por ver / Por mirar',
  en_emision: 'En emisión',
  en_curso: 'En curso / Mirando',
  favorito: 'Favoritos',
  finalizado: 'Finalizados',
  pausado: 'Pausados',
  dropeado: 'Dropeados / Abandonados',
};

/** Nombres cortos para visualización en las pestañas gráficas */
export const SECCION_LABELS_SHORT = {
  all: 'Todo',
  por_ver: 'Por ver',
  en_emision: 'En emisión',
  en_curso: 'En curso',
  favorito: 'Favoritos',
  finalizado: 'Finalizados',
  pausado: 'Pausados',
  dropeado: 'Dropeados',
};

/**
 * Plantilla por defecto para un nuevo ítem.
 * Todos los campos están inicializados para prevenir errores de 'undefined'.
 */
export const DEFAULT_ITEM = {
  id: '',
  malId: 0,
  mediaType: 'anime',
  tipo: '',
  titulo: '',
  imagen: '',
  sinopsis: '',
  genres: [],
  puntuacion: null,
  favorito: false,
  estadoUsuario: 'por_ver',
  /** Guarda el estadoUsuario previo al marcar como favorito, para poder restaurarlo al desmarcar. */
  estadoAnterior: '',
  estadoEmision: 'unknown',
  progreso: {
    actual: 0,
    maximo: null,
  },
  tags: [],
  descripcionPersonal: '',
  ordenManual: 0,
  creadoEn: '',
  actualizadoEn: '',
};

/** Tipos / formatos soportados para mangas */
export const TIPOS_MANGA = [
  { value: 'Manga', label: 'Manga' },
  { value: 'Manhwa', label: 'Manhwa' },
  { value: 'Manhua', label: 'Manhua' },
  { value: 'Novela', label: 'Novela' },
  { value: 'One-shot', label: 'One-shot' },
  { value: 'Doujinshi', label: 'Doujinshi' },
  { value: 'Cómic', label: 'Cómic' },
];

/** Tipos / formatos soportados para animes */
export const TIPOS_ANIME = [
  { value: 'TV', label: 'TV' },
  { value: 'Película', label: 'Película' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'Especial', label: 'Especial' },
  { value: 'Anime', label: 'Anime' },
];

/**
 * Infiere inteligentemente el tipo específico de una obra (Manhwa, Manhua, Manga, etc.)
 * a partir de sus metadatos cuando no tiene un tipo explícito definido.
 * @param {object} item
 * @returns {string}
 */
export function inferItemType(item) {
  if (!item) return 'Manga';

  if (item.tipo && typeof item.tipo === 'string' && item.tipo.trim()) {
    return item.tipo.trim();
  }

  // Si tiene subType o format proveniente de alguna API
  const rawSub = String(item.subType || item.format || '').toUpperCase();
  if (rawSub === 'MANHWA') return 'Manhwa';
  if (rawSub === 'MANHUA') return 'Manhua';
  if (rawSub === 'NOVEL' || rawSub === 'LIGHT NOVEL') return 'Novela';
  if (rawSub === 'ONE_SHOT' || rawSub === 'ONESHOT') return 'One-shot';
  if (rawSub === 'DOUJIN' || rawSub === 'DOUJINSHI') return 'Doujinshi';
  if (rawSub === 'MOVIE') return 'Película';
  if (rawSub === 'OVA') return 'OVA';
  if (rawSub === 'ONA') return 'ONA';
  if (rawSub === 'SPECIAL') return 'Especial';
  if (rawSub === 'TV' || rawSub === 'TV_SHORT') return 'TV';

  // Si tiene país de origen
  const country = String(item.countryOfOrigin || item.originCountry || '').toUpperCase();
  if (country === 'KR' || country === 'KO' || country === 'KOREA') {
    return item.mediaType === 'anime' ? 'ONA' : 'Manhwa';
  }
  if (country === 'CN' || country === 'TW' || country === 'HK' || country === 'ZH' || country === 'CHINA') {
    return item.mediaType === 'anime' ? 'ONA' : 'Manhua';
  }

  if (item.mediaType === 'anime') {
    return 'Anime';
  }

  // ── Heurísticas de texto para Manga / Manhwa / Manhua ──
  const title = (item.titulo || '').toLowerCase();
  const genres = Array.isArray(item.genres) ? item.genres.map((g) => String(g).toLowerCase()) : [];
  const tags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : [];
  const allTags = [...genres, ...tags].join(' ');
  const sinopsis = (item.sinopsis || '').toLowerCase();

  // Detección por tags / géneros
  if (allTags.includes('manhwa') || allTags.includes('webtoon') || allTags.includes('web comic') || allTags.includes('korean')) {
    return 'Manhwa';
  }
  if (allTags.includes('manhua') || allTags.includes('chinese')) {
    return 'Manhua';
  }
  if (allTags.includes('novela') || allTags.includes('light novel') || allTags.includes('novel')) {
    return 'Novela';
  }

  // Títulos o frases muy conocidas de Manhua
  const manhuaPatterns = [
    /\bkaiju\s+qian\s+dao/i,
    /\bqian\s*dao\b/i,
    /\bhuanggu\s*shengti\b/i,
    /\bhuanggu\b/i,
    /\bshengti\b/i,
    /\bancient\s+sacred\s+body\b/i,
    /\bmartial\s+peak\b/i,
    /\btales\s+of\s+demons\s+and\s+gods\b/i,
    /\bmagic\s+emperor\b/i,
    /\bsoul\s+land\b/i,
    /\bdouluo\s+dalu\b/i,
    /\bversatile\s+mage\b/i,
    /\bquanzhi\s+fashi\b/i,
    /\bquanzhi\s+gaoshou\b/i,
    /\bthe\s+king's\s+avatar\b/i,
    /\byuan\s+zun\b/i,
    /\bbattle\s+through\s+the\s+heavens\b/i,
    /\bdoupo\s+cangqiong\b/i,
    /\bapotheosis\b/i,
    /\bstar\s+martial\s+god\b/i,
    /\bi'm\s+an\s+evil\s+god\b/i,
    /\btop\s+tier\s+providence\b/i,
    /\bmartial\s+god\s+asura\b/i,
    /\bagainst\s+the\s+gods\b/i,
    /\bwu\s+dong\s+qian\s+kun\b/i,
    /\bda\s+zhu\s+zai\b/i,
    /\bcultivation\s+chat\s+group\b/i,
    /\bxianxia\b/i,
    /\bwuxia\b/i,
    /\bxuanhuan\b/i,
    /\bcultivador\b/i,
    /\bcultivo\b/i,
  ];

  if (manhuaPatterns.some((pattern) => pattern.test(title) || pattern.test(sinopsis))) {
    return 'Manhua';
  }

  // Títulos o frases muy conocidas de Manhwa
  const manhwaPatterns = [
    /\bsolo\s+leveling\b/i,
    /\btower\s+of\s+god\b/i,
    /\bthe\s+beginning\s+after\s+the\s+end\b/i,
    /\bomniscient\s+reader\b/i,
    /\blector\s+omnisciente\b/i,
    /\bnano\s+machine\b/i,
    /\beleceed\b/i,
    /\blookism\b/i,
    /\bwind\s+breaker\b/i,
    /\bthe\s+boxer\b/i,
    /\bsweet\s+home\b/i,
    /\bmercenary\s+enrollment\b/i,
    /\bteenage\s+mercenary\b/i,
    /\bsuicide\s+hunter\b/i,
    /\bblossoming\s+blade\b/i,
    /\bmount\s+hua\s+sect\b/i,
    /\bcount's\s+family\b/i,
    /\bdamn\s+reincarnation\b/i,
    /\bdrifting\s+moon\b/i,
    /\bdoom\s+breaker\b/i,
    /\bsuicidal\s+battle\s+god\b/i,
    /\bnorthern\s+blade\b/i,
    /\bmurim\s+login\b/i,
    /\bovergeared\b/i,
    /\bsecond\s+life\s+ranker\b/i,
    /\btomb\s+raider\s+king\b/i,
    /\bdisaster-class\s+hero\b/i,
    /\bpick\s+me\s+up\b/i,
    /\bleveling\s+with\s+the\s+gods\b/i,
    /\bswordmaster['’]s\s+youngest\s+son\b/i,
    /\bviral\s+hit\b/i,
    /\bhow\s+to\s+fight\b/i,
    /\bquest\s+supremacy\b/i,
    /\bquestism\b/i,
    /\bmanager\s+kim\b/i,
    /\breality\s+quest\b/i,
    /\bmurim\b/i,
    /\bchaebol\b/i,
  ];

  if (manhwaPatterns.some((pattern) => pattern.test(title))) {
    return 'Manhwa';
  }

  return 'Manga';
}

/**
 * Obtiene la etiqueta final del tipo de obra para mostrar en la interfaz.
 * @param {object} item
 * @returns {string}
 */
export function getItemType(item) {
  if (!item) return '';
  return inferItemType(item);
}

/** Opciones válidas de estado elegidas por el usuario */
export const ESTADOS_USUARIO = [
  { value: 'por_ver',    label: 'Por ver' },
  { value: 'en_emision', label: 'En emisión' },
  { value: 'en_curso',   label: 'En curso' },
  { value: 'favorito',   label: 'Favorito' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'pausado',    label: 'Pausado' },
  { value: 'dropeado',   label: 'Dropeado' },
];

/**
 * Set de valores válidos de estadoUsuario derivado de ESTADOS_USUARIO.
 * Fuente única de verdad — no requiere sincronización manual.
 * OWASP v1.3: valida cualquier estado antes de persistir.
 */
export const VALID_ESTADOS_USUARIO = new Set(ESTADOS_USUARIO.map((e) => e.value));

/**
 * Comprueba si un valor es un estadoUsuario válido.
 * @param {string} estado
 * @returns {boolean}
 */
export function esEstadoUsuarioValido(estado) {
  return VALID_ESTADOS_USUARIO.has(estado);
}

/**
 * Devuelve el label legible del estadoUsuario.
 * @param {string} estado
 * @returns {string}
 */
export function getEstadoUsuarioLabel(estado) {
  return ESTADOS_USUARIO.find((e) => e.value === estado)?.label ?? estado;
}


/** Opciones de estado de emisión otorgadas por la API externa */
export const ESTADOS_EMISION = [
  { value: 'airing', label: 'En emisión' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'upcoming', label: 'Próximamente' },
  { value: 'unknown', label: 'Desconocido' },
];

/** Rango numérico permitido para la calificación personal (1 al 10) */
export const SCORE_RANGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

