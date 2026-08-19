/**
 * presentation/App.jsx
 * Root component — wires hooks, routing state, and the AppShell.
 * No business logic lives here; all state management is delegated to hooks.
 */
import React, { useCallback } from 'react';
import { AppShell } from './components/Layout/AppShell.jsx';
import { AnimeListPage } from './pages/AnimeListPage.jsx';
import { MangaListPage } from './pages/MangaListPage.jsx';
import { Toast } from './components/Toast/Toast.jsx';
import { OfflineBanner } from './components/OfflineBanner/OfflineBanner.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useItems } from './hooks/useItems.js';
import { useToast } from './hooks/useToast.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { useAppRouter } from './hooks/useAppRouter.js';
import { useTranslation } from './hooks/useTranslation.js';
import { restoreSnapshot } from '../data/snapshotRepository.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, addItem, updateItem, removeItem, importItems, getFiltered } = useItems();
  const { toast, showToast, hideToast } = useToast();
  const isOnline = useOnlineStatus();
  const { activePage, activeSection, setMedia, setSection } = useAppRouter();
  const { translationEnabled, toggleTranslation } = useTranslation();

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
                localStorage.setItem('amlist_items', JSON.stringify(restoredItems));
                window.location.reload();
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
        onPageChange={setMedia}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onImport={handleImport}
        translationEnabled={translationEnabled}
        onToggleTranslation={toggleTranslation}
      >
        {activePage === 'anime' ? (
          <AnimeListPage
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            getFiltered={getFiltered}
            activeSection={activeSection}
            onSectionChange={setSection}
            translationEnabled={translationEnabled}
          />
        ) : (
          <MangaListPage
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            getFiltered={getFiltered}
            activeSection={activeSection}
            onSectionChange={setSection}
            translationEnabled={translationEnabled}
          />
        )}
      </AppShell>
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
}

