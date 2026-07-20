/**
 * presentation/App.jsx
 * Root component — wires hooks, routing state, and the AppShell.
 * No business logic lives here; all state management is delegated to hooks.
 */
import React, { useState } from 'react';
import { AppShell } from './components/Layout/AppShell.jsx';
import { AnimeListPage } from './pages/AnimeListPage.jsx';
import { MangaListPage } from './pages/MangaListPage.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useItems } from './hooks/useItems.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { items, addItem, updateItem, removeItem, importItems, getFiltered } = useItems();
  const [activePage, setActivePage] = useState('anime');

  return (
    <AppShell
      theme={theme}
      onToggleTheme={toggleTheme}
      items={items}
      activePage={activePage}
      onPageChange={setActivePage}
      onAdd={addItem}
      onImport={importItems}
    >
      {activePage === 'anime' ? (
        <AnimeListPage
          onUpdate={updateItem}
          onRemove={removeItem}
          getFiltered={getFiltered}
        />
      ) : (
        <MangaListPage
          onUpdate={updateItem}
          onRemove={removeItem}
          getFiltered={getFiltered}
        />
      )}
    </AppShell>
  );
}

