/**
 * presentation/components/SearchPanel/SearchPanel.jsx
 * Debounced search bar + preview results with "Agregar" button.
 * Delegates all fetch logic to useSearch; delegates all add logic to onAdd callback.
 */
import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSearch.js';
import { Star, Plus, Check } from 'lucide-react';
import './SearchPanel.css';

export function SearchPanel({ mediaType, onAdd, existingIds }) {
  const [query, setQuery]       = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  const { results, loading, error, errorCode, retry } = useSearch(query, mediaType);

  const handleAdd = (result) => {
    const id = `${result.mediaType}_${result.malId}`;
    if (existingIds?.has(id) || addedIds.has(id)) return;

    const outcome = onAdd({
      id,
      malId:         result.malId,
      mediaType:     result.mediaType,
      titulo:        result.titulo,
      imagen:        result.imagen,
      estadoEmision: result.estadoEmision,
      progreso:      result.progreso,
      sinopsis:      result.sinopsis,
      genres:        result.genres,
      scoreApi:      result.score,
      puntuacion:    null, // User's personal score is empty initially
    });

    if (outcome?.success !== false) {
      setAddedIds((prev) => new Set(prev).add(id));
    }
  };

  return (
    <section className="search-panel" aria-label="Que quieres buscar?">
      <div className="search-panel__bar">
        <input
          id="search-input"
          className="search-panel__input"
          type="search"
          placeholder={`Buscar ${mediaType === 'anime' ? 'anime' : 'manga'}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={`Buscar ${mediaType}`}
          autoComplete="off"
        />
        {query && (
          <button
            className="search-panel__clear"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
          >✕</button>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="search-panel__status" aria-live="polite" aria-label="Buscando…">
          <span className="search-panel__spinner" aria-hidden="true" />
          <span>Buscando....</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="search-panel__error" role="alert">
          <p>⚠ {error}</p>
          {errorCode !== 'CANCELLED' && (
            <button className="search-panel__retry" onClick={retry} aria-label="Reintentar búsqueda">
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <ul className="search-panel__results" aria-label="Resultados de búsqueda">
          {results.map((r) => {
            const id = `${r.mediaType}_${r.malId}`;
            const isAdded = existingIds?.has(id) || addedIds.has(id);

            return (
              <li key={id} className="search-panel__result">
                {r.imagen && (
                  <img
                    className="search-panel__result-img"
                    src={r.imagen}
                    alt={`Portada de ${r.titulo}`}
                    loading="lazy"
                  />
                )}
                <div className="search-panel__result-info">
                  <span className="search-panel__result-title">{r.titulo}</span>
                  <div className="search-panel__result-meta">

                    {r.score && (
                      <span className="search-panel__result-score" aria-label={`Puntuación MAL: ${r.score}`}>
                        <Star size={12} fill="currentColor" /> {r.score}
                      </span>
                    )}
                    {r.progreso?.maximo && (
                      <span className="search-panel__result-eps">
                        {r.mediaType === 'anime' ? `${r.progreso.maximo} eps` : `${r.progreso.maximo} caps`}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={`search-panel__add-btn${isAdded ? ' search-panel__add-btn--added' : ''}`}
                  onClick={() => handleAdd(r)}
                  disabled={isAdded}
                  aria-label={isAdded ? 'Ya en la lista' : `Agregar ${r.titulo}`}
                >
                  {isAdded ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty state */}
      {!loading && !error && query.trim() && results.length === 0 && (
        <p className="search-panel__empty" aria-live="polite">
          Sin resultados para &ldquo;{query}&rdquo;.
        </p>
      )}
    </section>
  );
}
