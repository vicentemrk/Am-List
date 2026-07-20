/**
 * presentation/pages/AnimeListPage.jsx
 * Displays all anime items, split into the 8 sections via SectionTabs.
 */
import React, { useState, useMemo } from 'react';
import { Plus, Tv } from 'lucide-react';
import { SectionTabs } from '../components/SectionTabs/SectionTabs.jsx';
import { ItemCard } from '../components/ItemCard/ItemCard.jsx';
import { EditModal } from '../components/EditModal/EditModal.jsx';
import { SECCIONES } from '../../domain/itemSchema.js';
import './ListPage.css';

export function AnimeListPage({ onUpdate, onRemove, getFiltered, onOpenAdd }) {
  const [activeSection, setActiveSection] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [editingItem, setEditingItem] = useState(null);

  const counts = useMemo(() => {
    const result = {};
    SECCIONES.forEach((sec) => {
      result[sec] = getFiltered(sec, 'anime').length;
    });
    return result;
  }, [getFiltered]);

  const visibleItems = useMemo(() => {
    const items = getFiltered(activeSection, 'anime');
    return [...items].sort((a, b) => {
      if (sortBy === 'title') {
        return a.titulo.localeCompare(b.titulo);
      }
      if (sortBy === 'score') {
        return (b.puntuacion || 0) - (a.puntuacion || 0);
      }
      if (sortBy === 'progress') {
        const progA = a.progreso?.maximo ? (a.progreso.actual / a.progreso.maximo) : (a.progreso?.actual || 0);
        const progB = b.progreso?.maximo ? (b.progreso.actual / b.progreso.maximo) : (b.progreso?.actual || 0);
        return progB - progA;
      }
      return new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime();
    });
  }, [getFiltered, activeSection, sortBy]);

  // When updating an item, if it's the currently editing one, update local state
  const handleUpdate = (id, patch) => {
    const res = onUpdate(id, patch);
    if (res.success && editingItem && editingItem.id === id) {
      setEditingItem(res.item); // Keep modal up-to-date
    }
  };

  return (
    <div className="list-page">
      <header className="list-page__header">
        <div className="list-page__header-row">
          <div>
            <h1 className="list-page__title">Lista de Animes</h1>
            <p className="list-page__subtitle">
              {counts.all} {counts.all === 1 ? 'anime' : 'animes'} en tu lista
            </p>
          </div>
          <button
            className="list-page__add-btn"
            onClick={onOpenAdd}
            aria-label="Agregar anime"
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>
        
        <div className="list-page__toolbar">
          <label className="list-page__sort-label">
            Ordenar por:
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="list-page__sort-select"
            >
              <option value="recent">Agregado recientemente</option>
              <option value="title">Título (A-Z)</option>
              <option value="score">Puntuación</option>
              <option value="progress">Progreso</option>
            </select>
          </label>
        </div>
      </header>

      <SectionTabs
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        counts={counts}
      />

      <section
        id={`panel-${activeSection}`}
        className="list-page__grid"
        role="tabpanel"
        aria-labelledby={`tab-${activeSection}`}
        aria-live="polite"
      >
        {visibleItems.length === 0 ? (
          <div className="list-page__empty">
            <Tv size={64} className="list-page__empty-icon" aria-hidden="true" />
            <p className="list-page__empty-title">No hay animes aquí todavía</p>
            <p className="list-page__empty-hint">Busca uno arriba y agrégalo a tu lista.</p>
          </div>
        ) : (
          visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onEdit={setEditingItem}
            />
          ))
        )}
      </section>

      <EditModal 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onUpdate={handleUpdate} 
      />
    </div>
  );
}

