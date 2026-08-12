/**
 * presentation/components/ItemCard/ItemCard.jsx
 * Displays a single tracked item in a list view format.
 * Editing is delegated to a detailed modal view.
 */
import React, { useState, useRef, useEffect, memo } from 'react';
import { Tv, BookOpen, Star, Trash2, Pencil, GripVertical, ClipboardList } from 'lucide-react';
import { ESTADOS_USUARIO } from '../../../domain/itemSchema.js';


import { translateGenres } from '../../../domain/genreTranslator.js';
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

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    if (!statusMenuOpen) return;
    const handleClickOutside = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusMenuOpen]);

  /** Opciones del menú de estado (sin 'completado' — eliminado del tablist en v1.1) */
  const STATUS_MENU_OPTIONS = [
    { value: 'por_ver',    label: 'Por ver' },
    { value: 'en_curso',   label: 'En curso' },
    { value: 'finalizado', label: 'Finalizado' },
    { value: 'pausado',    label: 'Pausado' },
    { value: 'dropeado',   label: 'Dropeado' },
  ];

  // ── display helpers ──────────────────────────────────────────────────────────
  const userStatusObj = ESTADOS_USUARIO.find((s) => s.value === item.estadoUsuario);
  const userStatusLabel = userStatusObj?.label ?? item.estadoUsuario;

  const progressMax = item.progreso.maximo != null ? item.progreso.maximo : '?';
  const rawGenres = Array.isArray(item.genres) ? item.genres : [];
  const genres = translateGenres(rawGenres).slice(0, 4);
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
    <article className={`item-card item-card--list${statusMenuOpen ? ' item-card--menu-open' : ''}`} aria-label={item.titulo}>
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
            {/* ── Botón de estado (reemplaza al +1) ─────────────────────────── */}
            <div className="item-card__status-menu-wrap" ref={statusMenuRef}>
              <button
                className="item-card__action-btn item-card__action-btn--status"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusMenuOpen((v) => !v);
                }}
                aria-label="Cambiar estado de la lista"
                title="Cambiar estado"
                aria-haspopup="listbox"
                aria-expanded={statusMenuOpen}
              >
                <ClipboardList size={18} />
              </button>

              {statusMenuOpen && (
                <div className="item-card__status-dropdown" role="listbox" aria-label="Estado de la lista">
                  {STATUS_MENU_OPTIONS.map((opt) => {
                    const isActive = item.estadoUsuario === opt.value;
                    return (
                      <button
                        key={opt.value}
                        className={`item-card__status-option item-card__status-option--${opt.value}${isActive ? ' item-card__status-option--active' : ''}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate(item.id, { estadoUsuario: opt.value });
                          setStatusMenuOpen(false);
                        }}
                      >
                        <span className="item-card__status-option-label">{opt.label}</span>
                        {isActive && <span className="item-card__status-check" aria-hidden="true">✓</span>}
                      </button>
                    );
                  })}
                  <div className="item-card__status-divider" />
                  <button
                    className={`item-card__status-option item-card__status-option--favorito${item.favorito ? ' item-card__status-option--active' : ''}`}
                    role="option"
                    aria-selected={item.favorito}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(item.id, { favorito: !item.favorito });
                      setStatusMenuOpen(false);
                    }}
                  >
                    <Star size={14} fill={item.favorito ? 'currentColor' : 'none'} />
                    <span className="item-card__status-option-label">Favorito</span>
                    {item.favorito && <span className="item-card__status-check" aria-hidden="true">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* RESERVADO_FUTURO: +1 button — funcionalidad preservada para reactivar
            <button
              className="item-card__action-btn item-card__action-btn--plus"
              onClick={(e) => {
                e.stopPropagation();
                const actual = item.progreso?.actual ?? 0;
                const maximo = item.progreso?.maximo;
                if (maximo !== null && actual >= maximo) return;
                onUpdate(item.id, {
                  progreso: { ...item.progreso, actual: actual + 1 },
                });
              }}
              disabled={item.progreso?.maximo !== null && (item.progreso?.actual ?? 0) >= item.progreso?.maximo}
              aria-label={`Aumentar 1 ${item.mediaType === 'anime' ? 'episodio' : 'capítulo'}`}
              title={`+1 ${item.mediaType === 'anime' ? 'episodio' : 'capítulo'}`}
            >
              +1
            </button>
            */}
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

