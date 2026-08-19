import React, { useState, useMemo } from 'react';
import { Plus, Tv, BookOpen, LayoutList, LayoutGrid } from 'lucide-react';
import { SectionTabs } from '../components/SectionTabs/SectionTabs.jsx';
import { ItemCard } from '../components/ItemCard/ItemCard.jsx';
import { EditModal } from '../components/EditModal/EditModal.jsx';
import { DetailModal } from '../components/DetailModal/DetailModal.jsx';
import { CustomSelect } from '../components/Select/CustomSelect.jsx';
import { ScoreRangeSlider } from '../components/ScoreRangeSlider/ScoreRangeSlider.jsx';
import { SECCIONES } from '../../domain/itemSchema.js';
import { filtrarPorRangoPuntuacion } from '../../domain/validators.js';
import { getSortPreference, setSortPreference, getSortDirection, setSortDirection } from '../../data/sortRepository.js';
import { useViewDensity } from '../hooks/useViewDensity.js';
import './ListPage.css';



/**
 * Opciones de ordenamiento con separador + opciones de dirección ASC/DESC.
 * Las opciones dir_asc y dir_desc son interceptadas en handleSortChange
 * y no modifican sortBy sino sortDir.
 */
const SORT_OPTIONS = [
  { value: 'recent', label: 'Agregado recientemente' },
  { value: 'manual', label: 'Orden personalizado' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: 'score', label: 'Puntuación' },
  { value: 'progress', label: 'Progreso' },
  { type: 'separator' },
  { value: 'dir_asc', label: '↑ Ascendente' },
  { value: 'dir_desc', label: '↓ Descendente' },
];

export function ItemListPage({
  media = 'anime',
  onUpdate,
  onRemove,
  getFiltered,
  onOpenAdd,
  activeSection: controlledSection,
  onSectionChange: setControlledSection,
  translationEnabled = true,
}) {
  const [internalSection, setInternalSection] = useState('all');
  const activeSection = controlledSection !== undefined ? controlledSection : internalSection;
  const setActiveSection = setControlledSection ?? setInternalSection;

  const [sortBy, setSortBy] = useState(() => getSortPreference());
  const [sortDir, setSortDir] = useState(() => getSortDirection());
  const { density, toggleDensity } = useViewDensity();
  const [scoreRange, setScoreRange] = useState([1, 10]);

  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  /**
   * Maneja cambios del select de ordenamiento.
   * Si el valor es 'dir_asc' o 'dir_desc', actualiza la dirección (sortDir).
   * De lo contrario, actualiza el criterio de ordenamiento (sortBy).
   */
  const handleSortChange = (value) => {
    if (value === 'dir_asc') {
      setSortDir('asc');
      setSortDirection('asc');
    } else if (value === 'dir_desc') {
      setSortDir('desc');
      setSortDirection('desc');
    } else {
      setSortBy(value);
      setSortPreference(value);
    }
  };


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
    // Pipeline: seccion → puntuacion → tags → busqueda → ordenar
    let items = getFiltered(activeSection, media);

    // Fase 3: Filtro de puntuación personal
    items = filtrarPorRangoPuntuacion(items, scoreRange[0], scoreRange[1]);

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

    // Dirección: 1 = descending (default), -1 = ascending
    const dirMultiplier = sortDir === 'asc' ? -1 : 1;

    return [...items].sort((a, b) => {
      if (sortBy === 'manual') {
        return dirMultiplier * ((a.ordenManual || 0) - (b.ordenManual || 0));
      }
      if (sortBy === 'title') {
        return dirMultiplier * a.titulo.localeCompare(b.titulo);
      }
      if (sortBy === 'score') {
        return dirMultiplier * ((b.puntuacion || 0) - (a.puntuacion || 0));
      }
      if (sortBy === 'progress') {
        const progA = a.progreso?.maximo ? a.progreso.actual / a.progreso.maximo : a.progreso?.actual || 0;
        const progB = b.progreso?.maximo ? b.progreso.actual / b.progreso.maximo : b.progreso?.actual || 0;
        return dirMultiplier * (progB - progA);
      }
      // recent: más nuevo primero (desc) → b - a, con dirMultiplier invierte
      return dirMultiplier * (new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime());
    });
  }, [getFiltered, activeSection, media, sortBy, sortDir, localSearch, selectedTags, scoreRange]);


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

          {/* Botón Agregar — visible en desktop y en móvil (con icono siempre) */}
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
          {/* Buscador */}
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
          {/* Controles de barra: Ordenar por, Slider de Puntuación y Densidad */}
          <div className="list-page__toolbar-controls">
            {/* Selector de ordenamiento — incluye ASC/DESC con separador */}
            <div className="list-page__sort-wrap">
              <span className="list-page__sort-label">Ordenar por:</span>
              <CustomSelect
                value={sortBy}
                onValueChange={handleSortChange}
                options={SORT_OPTIONS}
                checkedValues={[sortDir === 'asc' ? 'dir_asc' : 'dir_desc']}
              />
            </div>
            {/* Filtro de puntuación personal (Fase 3) */}
            <ScoreRangeSlider
              min={scoreRange[0]}
              max={scoreRange[1]}
              onChange={(min, max) => setScoreRange([min, max])}
            />
            {/* Toggle densidad de vista (Fase 2) */}
            <button
              className="list-page__density-btn"
              onClick={toggleDensity}
              aria-label={density === 'detailed' ? 'Cambiar a vista compacta' : 'Cambiar a vista detallada'}
              title={density === 'detailed' ? 'Vista compacta' : 'Vista detallada'}
            >
              {density === 'detailed' ? <LayoutGrid size={18} /> : <LayoutList size={18} />}
            </button>
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
                density={density}
              />

            </div>
          ))
        )}
      </section>

      <EditModal item={editingItem} onClose={() => setEditingItem(null)} onUpdate={handleUpdate} />

      <DetailModal item={detailItem} isOpen={Boolean(detailItem)} onClose={() => setDetailItem(null)} onUpdate={handleUpdate} onEdit={setEditingItem} translationEnabled={translationEnabled} />
    </div>
  );
}


