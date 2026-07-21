/**
 * presentation/components/Layout/AppShell.jsx
 * The global application shell: sidebar navigation + header + main content area.
 */
import React, { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle.jsx';
import { ExportButton } from '../ExportButton/ExportButton.jsx';
import { ImportButton } from '../ImportButton/ImportButton.jsx';
import { HistorialModal } from '../HistorialModal/HistorialModal.jsx';
import { AddModal } from '../AddModal/AddModal.jsx';
import { FloatingActionButton } from '../FloatingActionButton/FloatingActionButton.jsx';
import { Menu, History, Code } from 'lucide-react';
import faviconUrl from '/favicon.svg';
import './AppShell.css';

const NAV_ITEMS = [
  { id: 'anime', label: 'Lista de Animes' },
  { id: 'manga', label: 'Lista de Mangas' },
];

export function AppShell({ theme, onToggleTheme, items, children, activePage, onPageChange, onAdd, onImport }) {
  const [historialOpen, setHistorialOpen] = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [addModalOpen,  setAddModalOpen]  = useState(false);

  const handleOpenAdd = () => setAddModalOpen(true);

  // Clone children and inject onOpenAdd so the list page header can open the modal
  const childrenWithProps = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { onOpenAdd: handleOpenAdd })
      : child
  );

  return (
    <div className="app-shell">
      {/* ── Mobile top bar ──────────────────────────────────────────────────── */}
      <header className="app-header" role="banner">
        <button
          className="app-header__menu-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Abrir menú lateral"
          aria-expanded={sidebarOpen}
        >
          <Menu size={24} />
        </button>

        <div className="app-header__brand">
          <img src={faviconUrl} alt="AMlist logo" className="app-header__logo" aria-hidden="true" />
          <span className="app-header__name">AMlist</span>
        </div>

        <div className="app-header__actions">
          <ImportButton onImport={onImport} />
          <ExportButton items={items} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      {/* ── Sidebar overlay (mobile) ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <nav
        className={`app-sidebar${sidebarOpen ? ' app-sidebar--open' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="app-sidebar__brand">
          <img src={faviconUrl} alt="" className="app-sidebar__logo" aria-hidden="true" />
          <span className="app-sidebar__name">AMlist</span>
        </div>

        <ul className="app-sidebar__nav" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`app-sidebar__link${activePage === item.id ? ' app-sidebar__link--active' : ''}`}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                aria-current={activePage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__tools">
            <ImportButton onImport={onImport} />
          </div>

          <button
            className="app-sidebar__historial-btn"
            onClick={() => { setHistorialOpen(true); setSidebarOpen(false); }}
            aria-label="Ver historial de cambios"
          >
            <History size={18} /> Historial
          </button>

          <div className="app-sidebar__theme-row">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <span className="app-sidebar__theme-label">
              {theme === 'dark' ? 'Tema oscuro' : 'Tema claro'}
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="app-main" id="main-content" tabIndex={-1}>
        {childrenWithProps}
        
        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="app-footer">
          <p>
            Hecho por <a href="https://github.com/vicentemrk" target="_blank" rel="noreferrer" aria-label="GitHub">vicentemrk</a>. 
          </p>
          <div className="app-footer__credits">
            Datos proveídos por: 
            <a href="https://anilist.co/" target="_blank" rel="noreferrer"> AniList</a>, 
            <a href="https://kitsu.io/" target="_blank" rel="noreferrer"> Kitsu</a> y
            <a href="https://mangadex.org/" target="_blank" rel="noreferrer"> MangaDex</a>
          </div>
          <a href="https://github.com/vicentemrk/Am-List" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Code size={16} /> GitHub
          </a>
        </footer>
      </main>

      {/* ── Historial drawer ─────────────────────────────────────────────────── */}
      {historialOpen && <HistorialModal onClose={() => setHistorialOpen(false)} />}

      {/* ── FAB (mobile only) ────────────────────────────────────────────────── */}
      <div className="fab-mobile-only">
        <FloatingActionButton
          onClick={handleOpenAdd}
          ariaLabel={`Agregar ${activePage}`}
        />
      </div>

      <AddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        mediaType={activePage}
        onAdd={(item) => {
          return onAdd(item);
        }}
        existingIds={new Set(items.filter(i => i.mediaType === activePage).map(i => i.id))}
      />
    </div>
  );
}


