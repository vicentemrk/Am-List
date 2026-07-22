/**
 * presentation/App.jsx
 * Root component — wires hooks, routing state, and the AppShell.
 * No business logic lives here; all state management is delegated to hooks.
 */
import React, { useState } from 'react';
import { AppShell } from './components/Layout/AppShell.jsx';
import { AnimeListPage } from './pages/AnimeListPage.jsx';
import { MangaListPage } from './pages/MangaListPage.jsx';
import { Toast } from './components/Toast/Toast.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useItems } from './hooks/useItems.js';
import { useToast } from './hooks/useToast.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, addItem, updateItem, removeItem, importItems, getFiltered } = useItems();
  const { toast, showToast, hideToast } = useToast();
  const [activePage, setActivePage] = useState('anime');

  const handleAdd = (item) => {
    const res = addItem(item);
    if (res?.success) showToast(`"${item.titulo}" agregado a la lista`, 'success');
    return res;
  };

  const handleUpdate = (id, patch) => {
    const res = updateItem(id, patch);
    if (res?.success) showToast('✓ Guardado', 'success');
    return res;
  };

  const handleRemove = (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const res = removeItem(id);
    if (res?.success) {
      showToast(
        `"${item.titulo}" eliminado`,
        'info',
        4000,
        {
          label: 'Deshacer',
          onClick: () => {
            addItem(item);
            hideToast();
          },
        }
      );
    }
    return res;
  };

  const handleImport = (batch) => {
    const res = importItems(batch);
    if (res?.success) showToast(`✓ Se importaron/actualizaron ${res.addedCount} ítem(s)`, 'info');
    return res;
  };

  return (
    <>
      <AppShell
        theme={theme}
        onToggleTheme={toggleTheme}
        items={items}
        activePage={activePage}
        onPageChange={setActivePage}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onImport={handleImport}
      >
        {activePage === 'anime' ? (
          <AnimeListPage
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            getFiltered={getFiltered}
          />
        ) : (
          <MangaListPage
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            getFiltered={getFiltered}
          />
        )}
      </AppShell>
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
}

