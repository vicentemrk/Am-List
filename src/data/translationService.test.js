import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateToSpanish } from './translationService.js';

// Setup localStorage stub
const localStorageStub = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageStub, writable: true });
}

describe('translationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns empty string if input is empty or not string', async () => {
    expect(await translateToSpanish('')).toBe('');
    expect(await translateToSpanish(null)).toBe('');
    expect(await translateToSpanish('   ')).toBe('');
  });

  it('returns original short text without fetch if length < 5', async () => {
    expect(await translateToSpanish('Hi')).toBe('Hi');
  });

  it('fetches and translates english text properly', async () => {
    const mockResponse = [
      [['Basado en una historia real.', 'Based on a true story.', null, null]]
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await translateToSpanish('Based on a true story.');
    expect(result).toBe('Basado en una historia real.');
  });

  it('returns original text if fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await translateToSpanish('Some English synopsis text here.');
    expect(result).toBe('Some English synopsis text here.');
  });

  it('decodes html entities in translated text', async () => {
    const mockResponse = [
      [['Ella dijo: &quot;Hola&quot; &amp; sonri&oacute;.', 'She said: "Hello" & smiled.', null, null]]
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await translateToSpanish('She said: "Hello" & smiled.');
    expect(result).toBe('Ella dijo: "Hola" & sonri&oacute;.');
  });
});
