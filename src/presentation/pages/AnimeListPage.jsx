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
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const counts = useMemo(() => {
    const result = {};
    SECCIONES.forEach((sec) => {
      result[sec] = getFiltered(sec, 'anime').length;
    });
    return result;
  }, [getFiltered]);

  const availableTags = useMemo(() => {
    const allAnime = getFiltered('all', 'anime');
    const set = new Set();
    allAnime.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [getFiltered]);

  const toggleTagFilter = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const visibleItems = useMemo(() => {
    let items = getFiltered(activeSection, 'anime');
    
    if (selectedTags.length > 0) {
      items = items.filter((item) =>
        selectedTags.every((st) => item.tags?.includes(st))
      );
    }

    if (localSearch) {
      const q = localSearch.toLowerCase();
      items = items.filter(item => {
        const matchTitle = item.titulo?.toLowerCase().includes(q);
        const matchDesc = item.descripcionPersonal?.toLowerCase().includes(q);
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchTags;
      });
    }

    return [...items].sort((a, b) => {
      if (sortBy === 'manual') {
        return (a.ordenManual || 0) - (b.ordenManual || 0);
      }
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
  }, [getFiltered, activeSection, sortBy, localSearch, selectedTags]);

  const handleDragStart = (e, id) => {
    if (sortBy !== 'manual') return;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (sortBy !== 'manual') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    if (sortBy !== 'manual') return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const newItems = [...visibleItems];
    const draggedIdx = newItems.findIndex(i => i.id === draggedId);
    const targetIdx = newItems.findIndex(i => i.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    newItems.forEach((item, index) => {
      onUpdate(item.id, { ordenManual: index });
    });
  };

  const handleUpdate = (id, patch) => {
    const res = onUpdate(id, patch);
    if (res.success && editingItem && editingItem.id === id) {
      setEditingItem(res.item);
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

          <div className="list-page__search-bar">
            <input 
              type="search" 
              placeholder="Buscar por título, etiqueta o descripción..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="list-page__search-input"
            />
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
              <option value="manual">Orden personalizado</option>
              <option value="title">Título (A-Z)</option>
              <option value="score">Puntuación</option>
              <option value="progress">Progreso</option>
            </select>
          </label>
        </div>

        {availableTags.length > 0 && (
          <div className="list-page__tags-bar">
            <span className="list-page__tags-label">Etiquetas:</span>
            <div className="list-page__tag-pills">
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={`list-page__tag-filter-btn${active ? ' list-page__tag-filter-btn--active' : ''}`}
                    onClick={() => toggleTagFilter(tag)}
                  >
                    #{tag}
                  </button>
                );
              })}
              {selectedTags.length > 0 && (
                <button
                  className="list-page__tag-clear-btn"
                  onClick={() => setSelectedTags([])}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
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
            <div
              key={item.id}
              draggable={sortBy === 'manual'}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
            >
              <ItemCard
                item={item}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onEdit={setEditingItem}
                isDraggable={sortBy === 'manual'}
                searchQuery={localSearch}
              />
            </div>
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

