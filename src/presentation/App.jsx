/**
 * presentation/App.jsx
 * Root component — wires hooks, routing state, and the AppShell.
 * No business logic lives here; all state management is delegated to hooks.
 */
import React, { useState, useCallback } from 'react';
import { AppShell } from './components/Layout/AppShell.jsx';
import { AnimeListPage } from './pages/AnimeListPage.jsx';
import { MangaListPage } from './pages/MangaListPage.jsx';
import { Toast } from './components/Toast/Toast.jsx';
import { OfflineBanner } from './components/OfflineBanner/OfflineBanner.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useItems } from './hooks/useItems.js';
import { useToast } from './hooks/useToast.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { restoreSnapshot } from '../data/snapshotRepository.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, addItem, updateItem, removeItem, importItems, getFiltered } = useItems();
  const { toast, showToast, hideToast } = useToast();
  const isOnline = useOnlineStatus();
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

  const handleImport = useCallback((batch) => {
    const res = importItems(batch);
    if (res?.success) {
      const msg = res.addedCount > 0
        ? `✓ ${res.addedCount} ítem(s) importados`
        : 'No se encontraron ítems nuevos para importar';

      // Si hay un snapshotId, ofrecer la opción de restaurar
      const action = res.snapshotId
        ? {
            label: 'Restaurar',
            onClick: () => {
              const restoredItems = restoreSnapshot(res.snapshotId);
              if (restoredItems) {
                // Reimportar el snapshot como batch (reemplaza los datos actuales)
                // Usamos importBatch pero primero limpiamos — la restauración fuerza sobreescritura
                import('../data/itemsRepository.js').then(({ default: repo, ...repoMod }) => {
                  // Escribir directamente vía adaptador localStorage
                  import('../data/adapters/localStorage/itemsLocalStorageAdapter.js').then(({ itemsLocalStorageAdapter }) => {
                    // Guardamos todos los ítems restaurados sobreescribiendo
                    localStorage.setItem('amlist_items', JSON.stringify(restoredItems));
                    window.location.reload(); // Recarga limpia para reflejar el estado restaurado
                  });
                });
              }
              hideToast();
            },
          }
        : null;

      showToast(msg, 'info', 30000, action);
    }
    return res;
  }, [importItems, showToast, hideToast]);


  return (
    <>
      <OfflineBanner isOnline={isOnline} />
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

