/**
 * presentation/components/ChangelogModal/ChangelogModal.jsx
 * Modal de novedades de versión — abre cuando el usuario hace click en la campana del header.
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X, Bell, Sparkles, Shield, Layers, RefreshCw, Wifi, Download } from 'lucide-react';
import { CURRENT_VERSION, markChangelogSeen } from '../../../data/changelogRepository.js';
import { motion } from 'framer-motion';
import './ChangelogModal.css';

const CHANGELOG = [
  {
    icon: <Layers size={16} />,
    title: 'Eliminación de "Completado"',
    desc: 'El estado "Completado" fue migrado automáticamente a "Finalizado". Tu lista está intacta.',
    color: 'var(--accent-primary)',
  },
  {
    icon: <Shield size={16} />,
    title: 'Sanitizador de Seguridad al Dominio',
    desc: 'Sanitización XSS reforzada en importaciones. Tags y etiquetas vacías ya no se guardan.',
    color: 'var(--accent-secondary)',
  },
  {
    icon: <RefreshCw size={16} />,
    title: 'Auto-Snapshots (Backups Automáticos)',
    desc: 'Se guarda un punto de restauración antes de cada importación. Usa "Restaurar" en el toast para deshacer.',
    color: 'var(--tab-pausado)',
  },
  {
    icon: <Wifi size={16} />,
    title: 'Indicador de Conexión',
    desc: 'Un banner sutil aparece en la parte superior cuando pierdes la conexión. Desaparece al volver.',
    color: 'var(--accent-warning)',
  },

  {
    icon: <Download size={16} />,
    title: 'Importación desde AniList y Kitsu',
    desc: 'Importa directamente tus listas en formato JSON de AniList y Kitsu, además del XML de MAL.',
    color: 'var(--tab-en-curso)',
  },
];

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function ChangelogModal({ open, onClose }) {
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      markChangelogSeen();
      onClose();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="changelog-overlay" />
        <Dialog.Content className="changelog-content" aria-describedby={undefined}>
          <VisuallyHidden>
            <Dialog.Title>Novedades de AMlist v{CURRENT_VERSION}</Dialog.Title>
          </VisuallyHidden>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="changelog-inner"
          >
            {/* Header */}
            <div className="changelog-header">
              <div className="changelog-title-group">
                <Sparkles size={18} className="changelog-sparkle" />
                <h2 className="changelog-title">Novedades</h2>
                <span className="changelog-version">v{CURRENT_VERSION}</span>
              </div>
              <button
                className="changelog-close"
                onClick={() => handleOpenChange(false)}
                aria-label="Cerrar novedades"
              >
                <X size={16} />
              </button>
            </div>

            {/* Feature list */}
            <ul className="changelog-list">
              {CHANGELOG.map((item, i) => (
                <li key={i} className="changelog-item">
                  <span className="changelog-item__icon" style={{ color: item.color }}>
                    {item.icon}
                  </span>
                  <div className="changelog-item__text">
                    <strong className="changelog-item__title">{item.title}</strong>
                    <p className="changelog-item__desc">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              className="changelog-dismiss"
              onClick={() => handleOpenChange(false)}
            >
              Entendido
            </button>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
