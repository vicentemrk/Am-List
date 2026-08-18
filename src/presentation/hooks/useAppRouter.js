/**
 * presentation/hooks/useAppRouter.js
 * ============================================================================
 * Qué hace:
 *   Gestor de enrutamiento basado en Hash (#/mediaType/seccion) 100% compatible
 *   con GitHub Pages, historial del navegador y enlaces directos.
 *
 * Ejemplos de rutas:
 *   #/anime/all
 *   #/anime/favorito
 *   #/anime/por-ver
 *   #/manga/en-curso
 *   #/manga/finalizado
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { SECCIONES } from '../../domain/itemSchema.js';

const VALID_MEDIA = ['anime', 'manga'];

const SECTION_ALIASES = {
  'todo': 'all',
  'todos': 'all',
  'all': 'all',
  'por-ver': 'por_ver',
  'por_ver': 'por_ver',
  'en-emision': 'en_emision',
  'en_emision': 'en_emision',
  'emision': 'en_emision',
  'en-curso': 'en_curso',
  'en_curso': 'en_curso',
  'curso': 'en_curso',
  'favorito': 'favorito',
  'favoritos': 'favorito',
  'fav': 'favorito',
  'finalizado': 'finalizado',
  'finalizados': 'finalizado',
  'pausado': 'pausado',
  'pausados': 'pausado',
  'dropeado': 'dropeado',
  'dropeados': 'dropeado',
};

/**
 * Convierte clave de sección a slug amigable de URL (ej: 'por_ver' -> 'por-ver')
 * @param {string} section
 * @returns {string}
 */
export function sectionToSlug(section) {
  if (section === 'por_ver') return 'por-ver';
  if (section === 'en_emision') return 'en-emision';
  if (section === 'en_curso') return 'en-curso';
  return section;
}

/**
 * Convierte slug de URL a clave interna de sección (ej: 'por-ver' -> 'por_ver')
 * @param {string} slug
 * @returns {string}
 */
export function slugToSection(slug) {
  if (!slug) return 'all';
  const normalized = slug.toLowerCase().trim();
  if (SECTION_ALIASES[normalized]) {
    return SECTION_ALIASES[normalized];
  }
  if (SECCIONES.includes(normalized)) {
    return normalized;
  }
  return 'all';
}

/**
 * Parsea el hash actual de window.location
 * @param {string} hashStr
 * @returns {{ media: 'anime'|'manga', section: string }}
 */
export function parseHash(hashStr) {
  const clean = (hashStr || '').replace(/^#\/?/, '').trim();
  if (!clean) {
    return { media: 'anime', section: 'all' };
  }

  const parts = clean.split('/').filter(Boolean);
  const rawMedia = (parts[0] || '').toLowerCase();
  const rawSection = parts[1] || 'all';

  const media = VALID_MEDIA.includes(rawMedia) ? rawMedia : 'anime';
  const section = slugToSection(rawSection);

  return { media, section };
}

export function useAppRouter() {
  const [route, setRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseHash(window.location.hash);
    }
    return { media: 'anime', section: 'all' };
  });

  // Escuchar cambios de hash en el navegador (atrás/adelante o edición de URL)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setRoute((prev) => {
        if (prev.media === parsed.media && prev.section === parsed.section) {
          return prev;
        }
        return parsed;
      });
    };

    window.addEventListener('hashchange', handleHashChange);

    // Si el hash está vacío al inicio, sincronizar URL limpia
    if (!window.location.hash || window.location.hash === '#') {
      const initialSlug = sectionToSlug(route.section);
      window.history.replaceState(null, '', `#/${route.media}/${initialSlug}`);
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [route.media, route.section]);

  /**
   * Navega a una página y sección específica
   */
  const navigate = useCallback((media, section) => {
    const validMedia = VALID_MEDIA.includes(media) ? media : 'anime';
    const validSection = SECCIONES.includes(section) ? section : 'all';
    const slug = sectionToSlug(validSection);
    const newHash = `#/${validMedia}/${slug}`;

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    setRoute({ media: validMedia, section: validSection });
  }, []);

  const setMedia = useCallback((media) => {
    navigate(media, route.section);
  }, [navigate, route.section]);

  const setSection = useCallback((section) => {
    navigate(route.media, section);
  }, [navigate, route.media]);

  return {
    activePage: route.media,
    activeSection: route.section,
    navigate,
    setMedia,
    setSection,
  };
}
