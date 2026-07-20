/**
 * presentation/components/ItemCard/ItemCard.jsx
 * Displays a single tracked item in a list view format.
 * Editing is delegated to a detailed modal view.
 */
import React, { useState } from 'react';
import { Tv, BookOpen, Star, Trash2, Pencil } from 'lucide-react';
import './ItemCard.css';

export function ItemCard({ item, onUpdate, onRemove, onEdit }) {
  const [sinopsisExpanded, setSinopsisExpanded] = useState(false);

  // ── display helpers ──────────────────────────────────────────────────────────
  const emisionBadge = {
    airing:   { label: 'En emisión',   cls: 'badge--airing'   },
    complete: { label: 'Finalizado',   cls: 'badge--complete' },
    upcoming: { label: 'Próximamente', cls: 'badge--upcoming' },
    unknown:  { label: 'Desconocido',  cls: 'badge--unknown'  },
  }[item.estadoEmision] ?? { label: item.estadoEmision, cls: '' };

  const progressMax = item.progreso.maximo != null ? item.progreso.maximo : '?';
  const genres = Array.isArray(item.genres) ? item.genres.slice(0, 4) : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const sinopsis = item.sinopsis || '';
  const sinopsisShort = sinopsis.length > 140 ? sinopsis.slice(0, 140) + '…' : sinopsis;

  const handleFavorito = () => { onUpdate(item.id, { favorito: !item.favorito }); };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.titulo}" de tu lista?`)) {
      onRemove(item.id);
    }
  };

  return (
    <article className="item-card item-card--list" aria-label={item.titulo}>
      {/* ── thumbnail ─────────────────────────────────────────────────────── */}
      <div className="item-card__thumb-wrap">
        {item.imagen ? (
          <img
            className="item-card__thumb"
            src={item.imagen}
            alt={`Portada de ${item.titulo}`}
            loading="lazy"
          />
        ) : (
          <div className="item-card__thumb item-card__thumb--placeholder" aria-hidden="true">
            {item.mediaType === 'anime' ? <Tv size={32} /> : <BookOpen size={32} />}
          </div>
        )}
        <button
          className={`item-card__fav${item.favorito ? ' item-card__fav--active' : ''}`}
          onClick={handleFavorito}
          aria-label={item.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          title={item.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Star size={18} fill={item.favorito ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── info section ──────────────────────────────────────────────────── */}
      <div className="item-card__info">
        <div className="item-card__meta">
          <span className={`item-card__badge ${emisionBadge.cls}`}>{emisionBadge.label}</span>
          <span className="item-card__type">{item.mediaType === 'anime' ? 'Anime' : 'Manga'}</span>
          <div className="item-card__scores-wrap">
            {item.scoreApi && (
              <span className="item-card__score" title="Nota de la comunidad">
                <Star size={12} fill="currentColor" /> {item.scoreApi}
              </span>
            )}
            {item.puntuacion && (
              <span className="item-card__score item-card__score--user" title="Tu nota personal">
                <Star size={12} fill="currentColor" /> {item.puntuacion}
              </span>
            )}
          </div>
        </div>

        <h3 className="item-card__title">{item.titulo}</h3>

        {/* ── sub-info: géneros + sinopsis ─────────────────────────────── */}
        <div className="item-card__subinfo">
          {genres.length > 0 && (
            <div className="item-card__genres">
              {genres.map((g) => (
                <span key={g} className="item-card__genre-pill">{g}</span>
              ))}
            </div>
          )}
          {sinopsis && (
            <p className="item-card__sinopsis">
              {sinopsisExpanded ? sinopsis : sinopsisShort}
              {sinopsis.length > 140 && (
                <button
                  className="item-card__sinopsis-toggle"
                  onClick={() => setSinopsisExpanded((v) => !v)}
                >
                  {sinopsisExpanded ? ' Ver menos' : ' Ver más'}
                </button>
              )}
            </p>
          )}
        </div>

        {/* ── user tags display ─────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div className="item-card__tags-display">
            {tags.map((t) => (
              <span key={t} className="item-card__tag-pill">#{t}</span>
            ))}
          </div>
        )}

        <div className="item-card__footer-row">
          {/* ── progress bar ─────────────────────────────────────────────── */}
          <div className="item-card__progress-display">
            <div
              className="item-card__progress-bar-wrap"
              aria-label={`Progreso: ${item.progreso.actual} de ${progressMax}`}
            >
              <div
                className="item-card__progress-bar"
                style={{
                  width: item.progreso.maximo
                    ? `${Math.min((item.progreso.actual / item.progreso.maximo) * 100, 100)}%`
                    : '0%',
                }}
              />
            </div>
            <span className="item-card__progress-text">
              {item.progreso.actual} / {progressMax}
            </span>
          </div>

          {/* ── actions section ──────────────────────────────────────────────── */}
          <div className="item-card__actions">
            <button
              className="item-card__action-btn item-card__action-btn--edit"
              onClick={() => onEdit(item)}
              aria-label="Editar detalles"
              title="Editar detalles"
            >
              <Pencil size={18} />
            </button>
            <button
              className="item-card__action-btn item-card__action-btn--remove"
              onClick={handleDelete}
              aria-label="Eliminar de la lista"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
