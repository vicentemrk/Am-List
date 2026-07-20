/**
 * src/data/apiClient.test.js
 *
 * Tests para las interfaces públicas del cliente de API:
 *   - searchAnime(query, signal?)
 *   - searchManga(query, signal?)
 *
 * Seams: solo las exportaciones públicas. El mock va sobre globalThis.fetch,
 * nunca sobre funciones internas del módulo.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JikanApiError, searchAnime, searchManga } from './apiClient.js';

// ─── helpers para construir respuestas fake de fetch ──────────────────────────

function makeJikanAnimeResponse(overrides = {}) {
  return {
    data: [
      {
        mal_id: 1,
        title: 'Naruto',
        title_english: 'Naruto',
        images: { jpg: { image_url: 'https://example.com/naruto.jpg' } },
        status: 'Finished Airing',
        episodes: 220,
        synopsis: 'A ninja story.',
        score: 7.98,
        genres: [{ name: 'Action' }, { name: 'Adventure' }],
        ...overrides,
      },
    ],
  };
}

function makeAniListResponse(overrides = {}) {
  return {
    data: {
      Page: {
        media: [
          {
            id: 20,
            idMal: 20,
            title: { english: 'Naruto', romaji: 'Naruto', native: 'ナルト' },
            coverImage: { large: 'https://example.com/naruto-al.jpg' },
            status: 'FINISHED',
            episodes: 220,
            chapters: null,
            averageScore: 79,
            genres: ['Action'],
            description: '<p>A ninja story.</p>',
            ...overrides,
          },
        ],
      },
    },
  };
}

function makeKitsuAnimeResponse(overrides = {}) {
  return {
    data: [
      {
        id: '99',
        attributes: {
          canonicalTitle: 'Naruto',
          posterImage: { large: 'https://example.com/naruto-kitsu.jpg' },
          status: 'finished',
          episodeCount: 220,
          synopsis: 'A ninja story.',
          averageRating: '79.00',
          ...overrides,
        },
      },
    ],
  };
}

function okFetch(body) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  });
}

function errorFetch(status) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({}),
  });
}

// ─── Stub de localStorage (no existe en Node/Vitest) ─────────────────────────

const localStorageStub = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

// ─── Setup global ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubGlobal('localStorage', localStorageStub);
  localStorageStub.clear();
  // Limpiar caché en memoria entre tests importando el módulo con side-effects
  // No podemos resetear el Map interno, pero podemos limpiar localStorage.
  // Los tests que dependen del caché usan queries únicas para aislarlos.
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('searchAnime', () => {
  it('retorna resultados normalizados de Jikan cuando responde con éxito', async () => {
    vi.stubGlobal('fetch', () => okFetch(makeJikanAnimeResponse()));

    const results = await searchAnime('naruto-jikan-ok');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      malId: 1,
      mediaType: 'anime',
      titulo: 'Naruto',
      estadoEmision: 'complete',
      progreso: { actual: 0, maximo: 220 },
      score: 7.98,
      genres: ['Action', 'Adventure'],
      source: 'Jikan',
    });
  });

  it('hace fallback a AniList si Jikan responde con 429 (rate limit)', async () => {
    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(makeAniListResponse()) })
    );

    const results = await searchAnime('naruto-fallback-anilist');

    expect(results).toHaveLength(1);
    expect(results[0].source).toBe('AniList');
    expect(results[0].titulo).toBe('Naruto');
  });

  it('hace fallback a Kitsu si Jikan y AniList fallan', async () => {
    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) }) // Jikan falla
      .mockResolvedValueOnce({ ok: false, status: 503, json: () => Promise.resolve({}) }) // AniList falla
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(makeKitsuAnimeResponse()) }) // Kitsu OK
    );

    const results = await searchAnime('naruto-fallback-kitsu');

    expect(results).toHaveLength(1);
    expect(results[0].source).toBe('Kitsu');
    expect(results[0].titulo).toBe('Naruto');
  });

  it('retorna [] sin hacer ningún fetch si la query está vacía', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const results = await searchAnime('');

    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('retorna resultados del caché en memoria sin hacer otro fetch en la misma query', async () => {
    const fetchSpy = vi.fn(() => okFetch(makeJikanAnimeResponse()));
    vi.stubGlobal('fetch', fetchSpy);

    // Primera llamada — va a la red
    await searchAnime('naruto-cache-test');
    // Segunda llamada — debe servirse del caché
    const cached = await searchAnime('naruto-cache-test');

    // fetch solo se debió llamar una vez (la primera)
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cached).toHaveLength(1);
    expect(cached[0].titulo).toBe('Naruto');
  });

  it('lanza JikanApiError si las 3 APIs fallan y no hay resultados', async () => {
    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) })
    );

    await expect(searchAnime('naruto-all-fail')).rejects.toBeInstanceOf(JikanApiError);
  });
});

describe('searchManga', () => {
  it('retorna resultados normalizados de Jikan para manga con éxito', async () => {
    vi.stubGlobal('fetch', () =>
      okFetch({
        data: [
          {
            mal_id: 11,
            title: 'Berserk',
            title_english: 'Berserk',
            images: { jpg: { image_url: 'https://example.com/berserk.jpg' } },
            status: 'Publishing',
            chapters: null,
            synopsis: 'Dark fantasy.',
            score: 9.47,
            genres: [{ name: 'Action' }, { name: 'Fantasy' }],
          },
        ],
      })
    );

    const results = await searchManga('berserk-manga-ok');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      malId: 11,
      mediaType: 'manga',
      titulo: 'Berserk',
      estadoEmision: 'airing',
      progreso: { actual: 0, maximo: null },
      source: 'Jikan',
    });
  });
});
