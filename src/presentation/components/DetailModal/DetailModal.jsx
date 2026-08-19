/**
 * ============================================================================
 * COMPONENTE: presentation/components/DetailModal/DetailModal.jsx
 * ============================================================================
 * Qué hace:
 *   Modal de Vista de Detalle Expandida. Muestra sinopsis completa, géneros,
 *   notas comparativas (comunidad vs personal), progreso y botón rápido +1.
 *
 * Cómo funciona:
 *   - Migrado a Radix UI Dialog: focus trap, Escape, aria-modal y body scroll
 *     lock son manejados automáticamente por @radix-ui/react-dialog.
 *   - `framer-motion` sigue animando el contenido interno (scale + opacity).
 *   - v1.3: Se eliminó el badge de estadoEmision. Solo se muestra estadoUsuario.
 *   - v1.3: La traducción de sinopsis es completamente diferida (setTimeout)
 *     para no bloquear la animación de apertura en móvil.
 *   - v1.3: history.pushState al abrir para que el botón Atrás en móvil
 *     cierre el modal en lugar de salir de la app.
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X, Star, Plus, Tag, Pencil } from 'lucide-react';
import { ESTADOS_USUARIO, getItemType } from '../../../domain/itemSchema.js';
import { translateGenres } from '../../../domain/genreTranslator.js';
import { translateToSpanish } from '../../../data/translationService.js';
import './DetailModal.css';

/**
 * @param {object}       props
 * @param {object|null}  props.item     - Objeto del anime/manga a detallar.
 * @param {boolean}      props.isOpen   - Controla si el modal está abierto.
 * @param {Function}     props.onClose  - Función para cerrar el modal.
 * @param {Function}     props.onUpdate - Actualiza el ítem (id, patch).
 * @param {Function}    [props.onEdit]   - Abre el modal de edición para este ítem.
 */
export function DetailModal({ item, isOpen, onClose, onUpdate, onEdit, translationEnabled = true }) {
  const [synopsis, setSynopsis] = useState(item?.sinopsis || '');
  // Ref para evitar actualizaciones tras desmontaje
  const mountedRef = useRef(true);

  // ── history.pushState para que el botón Atrás en móvil cierre el modal ──────
  const historyPushedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !historyPushedRef.current) {
      history.pushState({ detailModal: true }, '');
      historyPushedRef.current = true;

      const handlePopState = (e) => {
        // El usuario presionó Atrás: cerramos el modal en lugar de salir
        if (e.state?.detailModal !== true) {
          onClose();
          historyPushedRef.current = false;
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }

    if (!isOpen && historyPushedRef.current) {
      historyPushedRef.current = false;
    }
  }, [isOpen, onClose]);

  // ── Traducción diferida — NO bloquea la animación de apertura ─────────────────
  useEffect(() => {
    if (!isOpen || !item?.sinopsis) return;

    mountedRef.current = true;
    // Establecer sinopsis original INMEDIATAMENTE (apertura rápida)
    setSynopsis(item.sinopsis);

    // Si la traducción está desactivada (EN), no traducir
    if (!translationEnabled) return;

    // Diferir la traducción para que no bloquee el render inicial
    const translationTimer = setTimeout(() => {
      translateToSpanish(item.sinopsis).then((translated) => {
        if (mountedRef.current && translated && translated !== item.sinopsis) {
          setSynopsis(translated);
          if (onUpdate && item.id) {
            onUpdate(item.id, { sinopsis: translated });
          }
        }
      });
    }, 300); // 300ms de delay: la animación ya terminó

    return () => {
      mountedRef.current = false;
      clearTimeout(translationTimer);
    };
  }, [isOpen, item?.id, item?.sinopsis, onUpdate, translationEnabled]);

  if (!item) return null;

  /** Label del estado del usuario */
  const estadoLabel = ESTADOS_USUARIO.find((e) => e.value === item.estadoUsuario)?.label ?? item.estadoUsuario;
  const genres = translateGenres(item.genres || []);

  /** Operación rápida +1 episodio/capítulo */
  const handlePlusOne = () => {
    const actual = item.progreso?.actual ?? 0;
    const maximo = item.progreso?.maximo;
    if (maximo !== null && actual >= maximo) return;
    onUpdate(item.id, { progreso: { ...item.progreso, actual: actual + 1 } });
  };

  /** Transición hacia el modal de edición */
  const handleOpenEdit = () => {
    onClose();
    if (onEdit) onEdit(item);
  };

  const isMaxReached = item.progreso?.maximo !== null &&
                       (item.progreso?.actual ?? 0) >= item.progreso?.maximo;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* ── Overlay (backdrop flexbox) — Centra el contenido en pantalla ── */}
        <Dialog.Overlay className="detail-modal-overlay">
          {/* ── Contenido animado con Framer Motion ── */}
          <Dialog.Content asChild onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
            <motion.div
              className="detail-modal-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* Títulos ocultos para lectores de pantalla */}
              <Dialog.Title asChild>
                <VisuallyHidden>{item.titulo}</VisuallyHidden>
              </Dialog.Title>
              <Dialog.Description asChild>
                <VisuallyHidden>
                  Detalles de {item.titulo} — {estadoLabel}
                </VisuallyHidden>
              </Dialog.Description>

              {/* ── Cabecera ── */}
              <div className="detail-modal-header">
                <div>
                  <h2 className="detail-modal-title">{item.titulo}</h2>
                  {/* v1.3: Solo se muestra el estado del usuario, sin badge de emisión API */}
                  <div className="detail-modal-meta-row" style={{ marginTop: '0.5rem' }}>
                    <span className="detail-badge detail-badge--purple">{estadoLabel}</span>
                    <span className="detail-badge detail-badge--type">{getItemType(item)}</span>
                  </div>
                </div>
                <div className="detail-modal-header-actions">
                  {onEdit && (
                    <button
                      className="detail-modal-edit-icon-btn"
                      onClick={handleOpenEdit}
                      aria-label="Editar este ítem"
                      title="Editar este ítem"
                    >
                      <Pencil size={18} />
                    </button>
                  )}
                  <Dialog.Close asChild>
                    <button className="detail-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {/* ── Cuerpo ── */}
              <div className="detail-modal-body">
                {/* Portada + nota personal */}
                <div className="detail-modal-cover-container">
                  <img
                    src={item.imagen || '/placeholder.png'}
                    alt={`Portada de ${item.titulo}`}
                    className="detail-modal-cover"
                  />
                  <div className="detail-modal-meta-row" style={{ justifyContent: 'center' }}>
                    {item.puntuacion && (
                      <span className="detail-badge detail-badge--purple">
                        <Star size={14} /> Tu nota: {item.puntuacion}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* Información detallada */}
                <div className="detail-modal-info">
                  {/* Géneros */}
                  {genres.length > 0 && (
                    <div className="detail-modal-genres">
                      {genres.map((genre) => (
                        <span key={genre} className="genre-pill">{genre}</span>
                      ))}
                    </div>
                  )}

                  {/* Sinopsis */}
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Sinopsis
                    </h3>
                    <p className="detail-modal-synopsis">
                      {synopsis || 'Sin sinopsis disponible para este título.'}
                    </p>
                  </div>

                  {/* Etiquetas del usuario */}
                  {item.tags?.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Tag size={14} /> Etiquetas
                      </h3>
                      <div className="detail-modal-genres">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="genre-pill"
                            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Pie de modal ── */}
              <div className="detail-modal-actions">
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    Progreso actual: <strong>{item.progreso?.actual ?? 0}</strong> / {item.progreso?.maximo ?? '∞'}{' '}
                    {item.mediaType === 'anime' ? 'episodios' : 'capítulos'}
                  </span>
                </div>
                <div className="detail-modal-footer-btns">
                  {onEdit && (
                    <button
                      className="detail-modal-edit-btn"
                      onClick={handleOpenEdit}
                      title="Editar detalles completos"
                    >
                      <Pencil size={16} /> Editar
                    </button>
                  )}
                  <button
                    className="quick-plus-one-btn"
                    onClick={handlePlusOne}
                    disabled={isMaxReached}
                    title="Aumentar en 1 episodio visto"
                  >
                    <Plus size={16} /> +1 Episodio
                  </button>
                </div>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
