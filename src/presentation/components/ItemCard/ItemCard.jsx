/**
 * presentation/components/ItemCard/ItemCard.jsx
 * Displays a single tracked item in a list view format.
 * Editing is delegated to a detailed modal view.
 */
import React, { useState, memo } from 'react';
import { Tv, BookOpen, Star, Trash2, Pencil, GripVertical } from 'lucide-react';
import { ESTADOS_USUARIO } from '../../../domain/itemSchema.js';
import './ItemCard.css';

function highlightMatch(text, query) {
  if (!text || !query || !query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="item-card__highlight">{part}</mark>
    ) : (
      part
    )
  );
}

function ItemCardComponent({ item, onUpdate, onRemove, onEdit, onDetail, isDraggable, searchQuery = '' }) {
  const [sinopsisExpanded, setSinopsisExpanded] = useState(false);

  // ── display helpers ──────────────────────────────────────────────────────────
  const userStatusObj = ESTADOS_USUARIO.find((s) => s.value === item.estadoUsuario);
  const userStatusLabel = userStatusObj?.label ?? item.estadoUsuario;

  const progressMax = item.progreso.maximo != null ? item.progreso.maximo : '?';
  const genres = Array.isArray(item.genres) ? item.genres.slice(0, 4) : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const sinopsis = item.sinopsis || '';
  const sinopsisShort = sinopsis.length > 140 ? sinopsis.slice(0, 140) + '…' : sinopsis;

  const handleFavorito = (e) => {
    e.stopPropagation();
    onUpdate(item.id, { favorito: !item.favorito });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onRemove(item.id);
  };

  const handleOpenDetail = () => {
    if (onDetail) onDetail(item);
  };

  return (
    <article className="item-card item-card--list" aria-label={item.titulo}>
      {/* ── drag handle ───────────────────────────────────────────────────── */}
      {isDraggable && (
        <div className="item-card__drag-handle" aria-hidden="true">
          <GripVertical size={20} />
        </div>
      )}

      {/* ── thumbnail ─────────────────────────────────────────────────────── */}
      <div className="item-card__thumb-wrap" onClick={handleOpenDetail} style={{ cursor: 'pointer' }}>
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
          <span className={`item-card__badge item-card__badge--user item-card__badge--${item.estadoUsuario}`}>
            {userStatusLabel}
          </span>
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

        <h3
          className="item-card__title"
          onClick={handleOpenDetail}
          style={{ cursor: 'pointer' }}
          title="Ver detalle completo"
        >
          {highlightMatch(item.titulo, searchQuery)}
        </h3>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSinopsisExpanded((v) => !v);
                  }}
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
              <span key={t} className="item-card__tag-pill">
                #{highlightMatch(t, searchQuery)}
              </span>
            ))}
          </div>
        )}

        {item.descripcionPersonal && (
          <div className="item-card__personal-desc">
            <p>{highlightMatch(item.descripcionPersonal, searchQuery)}</p>
          </div>
        )}

        {/* ── footer row (progress & actions) ──────────────────────────────────────── */}
        <div className="item-card__footer-row">
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

          <div className="item-card__actions">
            <button
              className="item-card__action-btn item-card__action-btn--edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
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

export const ItemCard = memo(ItemCardComponent);

