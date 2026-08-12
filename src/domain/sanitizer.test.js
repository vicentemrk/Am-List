/**
 * domain/sanitizer.test.js
 * TDD Red phase: tests para la función sanitizeText() del dominio.
 * Estos tests deben FALLAR hasta que se implemente sanitizer.js.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeText } from './sanitizer.js';

describe('sanitizeText', () => {
  it('devuelve string vacío para valores no-string', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
    expect(sanitizeText([])).toBe('');
  });

  it('elimina etiquetas <script> (vector XSS clásico)', () => {
    const input = 'Hola <script>alert("xss")</script> mundo';
    // Nota: el collapseSpaces colapsa los dos espacios en uno → 'Hola mundo'
    expect(sanitizeText(input)).toBe('Hola mundo');
  });

  it('elimina etiquetas <script> multilinea', () => {
    const input = '<script\ntype="text/javascript">evil()</script>texto';
    expect(sanitizeText(input)).toBe('texto');
  });

  it('elimina TODOS los tags HTML, no solo script', () => {
    expect(sanitizeText('<b>negrita</b>')).toBe('negrita');
    expect(sanitizeText('<img src=x onerror="alert(1)">')).toBe('');
    expect(sanitizeText('<a href="javascript:alert(1)">click</a>')).toBe('click');
    expect(sanitizeText('<svg onload="evil()">text</svg>')).toBe('text');
    expect(sanitizeText('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('hace trim de espacios al inicio y al final', () => {
    expect(sanitizeText('  hola mundo  ')).toBe('hola mundo');
    expect(sanitizeText('\n\t texto \n')).toBe('texto');
  });

  it('colapsa espacios múltiples internos en uno solo', () => {
    expect(sanitizeText('hola   mundo')).toBe('hola mundo');
    expect(sanitizeText('tag1  tag2   tag3')).toBe('tag1 tag2 tag3');
  });

  it('devuelve string vacío para strings de solo espacios (whitespace-only)', () => {
    expect(sanitizeText('   ')).toBe('');
    expect(sanitizeText('\t\n\r')).toBe('');
  });

  it('respeta texto normal con emojis y acentos', () => {
    expect(sanitizeText('Un excelente anime 🔥')).toBe('Un excelente anime 🔥');
    expect(sanitizeText('Título con ñ y acentos áéíóú')).toBe('Título con ñ y acentos áéíóú');
  });

  it('respeta la opción maxLength', () => {
    const long = 'a'.repeat(600);
    const result = sanitizeText(long, { maxLength: 100 });
    expect(result.length).toBe(100);
  });

  it('usa maxLength de 500 por defecto', () => {
    const long = 'b'.repeat(600);
    expect(sanitizeText(long).length).toBe(500);
  });

  it('desactiva el colapso de espacios con collapseSpaces: false', () => {
    const input = 'hola   mundo';
    expect(sanitizeText(input, { collapseSpaces: false })).toBe('hola   mundo');
  });
});
