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
 *   - AnimatePresence ya no es necesario — Radix controla el ciclo de vida.
 * ============================================================================
 */

import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X, Star, Plus, Tag } from 'lucide-react';
import { ESTADOS_USUARIO, ESTADOS_EMISION } from '../../../domain/itemSchema.js';
import './DetailModal.css';

/**
 * @param {object}       props
 * @param {object|null}  props.item     - Objeto del anime/manga a detallar.
 * @param {boolean}      props.isOpen   - Controla si el modal está abierto.
 * @param {Function}     props.onClose  - Función para cerrar el modal.
 * @param {Function}     props.onUpdate - Actualiza el ítem (id, patch).
 */
export function DetailModal({ item, isOpen, onClose, onUpdate }) {
  if (!item) return null;

  /** Etiquetas amigables de estado */
  const estadoLabel  = ESTADOS_USUARIO.find((e) => e.value === item.estadoUsuario)?.label ?? item.estadoUsuario;
  const emisionLabel = ESTADOS_EMISION.find((e) => e.value === item.estadoEmision)?.label  ?? item.estadoEmision;

  /** Operación rápida +1 episodio/capítulo */
  const handlePlusOne = () => {
    const actual = item.progreso?.actual ?? 0;
    const maximo = item.progreso?.maximo;
    if (maximo !== null && actual >= maximo) return;
    onUpdate(item.id, { progreso: { ...item.progreso, actual: actual + 1 } });
  };

  const isMaxReached = item.progreso?.maximo !== null &&
                       (item.progreso?.actual ?? 0) >= item.progreso?.maximo;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        {/* ── Overlay (backdrop) — Radix maneja el ciclo de vida ── */}
        <Dialog.Overlay className="detail-modal-overlay" onClick={onClose} />

        {/* ── Contenido animado con Framer Motion ── */}
        <Dialog.Content asChild onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
          <motion.div
            className="detail-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
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
                <div className="detail-modal-meta-row" style={{ marginTop: '0.5rem' }}>
                  <span className="detail-badge detail-badge--purple">{estadoLabel}</span>
                  <span className="detail-badge detail-badge--gold">{emisionLabel}</span>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="detail-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
                  <X size={20} />
                </button>
              </Dialog.Close>
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
                {item.genres?.length > 0 && (
                  <div className="detail-modal-genres">
                    {item.genres.map((genre) => (
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
                    {item.sinopsis || 'Sin sinopsis disponible para este título.'}
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
              <button
                className="quick-plus-one-btn"
                onClick={handlePlusOne}
                disabled={isMaxReached}
                title="Aumentar en 1 episodio visto"
              >
                <Plus size={16} /> +1 Episodio
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
