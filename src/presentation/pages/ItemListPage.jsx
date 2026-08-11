import React, { useState, useMemo } from 'react';
import { Plus, Tv, BookOpen } from 'lucide-react';
import { SectionTabs } from '../components/SectionTabs/SectionTabs.jsx';
import { ItemCard } from '../components/ItemCard/ItemCard.jsx';
import { EditModal } from '../components/EditModal/EditModal.jsx';
import { DetailModal } from '../components/DetailModal/DetailModal.jsx';
import { CustomSelect } from '../components/Select/CustomSelect.jsx';
import { SECCIONES } from '../../domain/itemSchema.js';
import { getSortPreference, setSortPreference } from '../../data/sortRepository.js';
import './ListPage.css';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Agregado recientemente' },
  { value: 'manual', label: 'Orden personalizado' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: 'score', label: 'Puntuación' },
  { value: 'progress', label: 'Progreso' },
];

export function ItemListPage({ media = 'anime', onUpdate, onRemove, getFiltered, onOpenAdd }) {
  const [activeSection, setActiveSection] = useState('all');
  const [sortBy, setSortBy] = useState(() => getSortPreference());

  const handleSortChange = (value) => {
    setSortBy(value);
    setSortPreference(value);
  };
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const isAnime = media === 'anime';
  const title = isAnime ? 'Lista de Animes' : 'Lista de Mangas';
  const unitSingular = isAnime ? 'anime' : 'manga';
  const unitPlural = isAnime ? 'animes' : 'mangas';
  const EmptyIcon = isAnime ? Tv : BookOpen;
  const emptyTitle = isAnime ? 'No hay animes aquí todavía' : 'No hay mangas aquí todavía';
  const addLabel = isAnime ? 'Agregar anime' : 'Agregar manga';

  const counts = useMemo(() => {
    const result = {};
    SECCIONES.forEach((sec) => {
      result[sec] = getFiltered(sec, media).length;
    });
    return result;
  }, [getFiltered, media]);

  const availableTags = useMemo(() => {
    const allItems = getFiltered('all', media);
    const set = new Set();
    allItems.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [getFiltered, media]);

  const toggleTagFilter = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const visibleItems = useMemo(() => {
    let items = getFiltered(activeSection, media);

    if (selectedTags.length > 0) {
      items = items.filter((item) =>
        selectedTags.every((st) => item.tags?.includes(st))
      );
    }

    if (localSearch) {
      const q = localSearch.toLowerCase();
      items = items.filter((item) => {
        const matchTitle = item.titulo?.toLowerCase().includes(q);
        const matchDesc = item.descripcionPersonal?.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
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
        const progA = a.progreso?.maximo ? a.progreso.actual / a.progreso.maximo : a.progreso?.actual || 0;
        const progB = b.progreso?.maximo ? b.progreso.actual / b.progreso.maximo : b.progreso?.actual || 0;
        return progB - progA;
      }
      return new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime();
    });
  }, [getFiltered, activeSection, media, sortBy, localSearch, selectedTags]);

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
    const draggedIdx = newItems.findIndex((i) => i.id === draggedId);
    const targetIdx = newItems.findIndex((i) => i.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    newItems.forEach((item, index) => {
      onUpdate(item.id, { ordenManual: index });
    });
  };

  const handleUpdate = (id, patch) => {
    const res = onUpdate(id, patch);
    if (res.success) {
      if (editingItem && editingItem.id === id) setEditingItem(res.item);
      if (detailItem && detailItem.id === id) setDetailItem(res.item);
    }
  };

  return (
    <div className="list-page">
      <header className="list-page__header">
        <div className="list-page__header-row">
          <div>
            <h1 className="list-page__title">{title}</h1>
            <p className="list-page__subtitle">
              {counts.all} {counts.all === 1 ? unitSingular : unitPlural} en tu lista
            </p>
          </div>
        </div>

        {/* Botón Agregar centrado — v1.1 UI/UX */}
        <div className="list-page__add-row">
          <button
            className="list-page__add-btn list-page__add-btn--expanded"
            onClick={onOpenAdd}
            aria-label={addLabel}
          >
            <Plus size={18} />
            Agregar
          </button>
        </div>

        <div className="list-page__toolbar">
          {/* Buscador — movido del header-row al toolbar (Bloque 2 UI/UX v1.1) */}
          <div className="list-page__search-bar">
            <input
              type="search"
              placeholder="Buscar..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="list-page__search-input"
              aria-label="Buscar por título, etiqueta o descripción"
            />
          </div>
          {/* Selector de ordenamiento Radix */}
          <div className="list-page__sort-wrap">
            <span className="list-page__sort-label">Ordenar por:</span>
            <CustomSelect
              value={sortBy}
              onValueChange={handleSortChange}
              options={SORT_OPTIONS}
            />
          </div>
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
                <button className="list-page__tag-clear-btn" onClick={() => setSelectedTags([])}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} counts={counts} />

      <section
        id={`panel-${activeSection}`}
        className="list-page__grid"
        role="tabpanel"
        aria-labelledby={`tab-${activeSection}`}
        aria-live="polite"
      >
        {visibleItems.length === 0 ? (
          <div className="list-page__empty">
            <EmptyIcon size={64} className="list-page__empty-icon" aria-hidden="true" />
            <p className="list-page__empty-title">{emptyTitle}</p>
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
                onDetail={setDetailItem}
                isDraggable={sortBy === 'manual'}
                searchQuery={localSearch}
              />
            </div>
          ))
        )}
      </section>

      <EditModal item={editingItem} onClose={() => setEditingItem(null)} onUpdate={handleUpdate} />
      <DetailModal item={detailItem} isOpen={Boolean(detailItem)} onClose={() => setDetailItem(null)} onUpdate={handleUpdate} onEdit={setEditingItem} />
    </div>
  );
}

