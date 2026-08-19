import { test, expect } from '@playwright/test';

test.describe('AMlist E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with a fresh state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('carga el titulo de la aplicacion y los tabs de navegación', async ({ page }) => {
    await expect(page).toHaveTitle(/AMlist/i);
    await expect(page.getByRole('banner')).toBeVisible();

    // Tabs de navegación principal (Anime / Manga)
    const animeNav = page.getByRole('button', { name: 'Lista de Animes' });
    const mangaNav = page.getByRole('button', { name: 'Lista de Mangas' });

    await expect(animeNav).toBeVisible();
    await expect(mangaNav).toBeVisible();
  });

  test('cambia entre Lista de Animes y Lista de Mangas', async ({ page }) => {
    await page.getByRole('button', { name: 'Lista de Mangas' }).click();
    await expect(page.getByRole('heading', { name: 'Lista de Mangas' })).toBeVisible();

    await page.getByRole('button', { name: 'Lista de Animes' }).click();
    await expect(page.getByRole('heading', { name: 'Lista de Animes' })).toBeVisible();
  });

  test('permite navegar entre las pestañas del tablist', async ({ page }) => {
    // Tab Por ver
    const porVerTab = page.getByRole('tab', { name: /Por ver/i });
    await expect(porVerTab).toBeVisible();
    await porVerTab.click();
    await expect(porVerTab).toHaveAttribute('aria-selected', 'true');

    // Tab En curso
    const enCursoTab = page.getByRole('tab', { name: /En curso/i });
    await enCursoTab.click();
    await expect(enCursoTab).toHaveAttribute('aria-selected', 'true');

    // Tab Finalizados
    const finalizadoTab = page.getByRole('tab', { name: /Finalizados/i });
    await finalizadoTab.click();
    await expect(finalizadoTab).toHaveAttribute('aria-selected', 'true');
  });

  test('muestra el boton de toggle ES/EN de traduccion y cambia estado', async ({ page }) => {
    // El botón debe mostrar 'ES' (traducción activa por defecto)
    const esBtn = page.getByRole('button', { name: /Traducción activa/i });
    await expect(esBtn).toBeVisible();

    // Después de un click, debe cambiar a EN (sin traducción)
    await esBtn.click();
    const enBtn = page.getByRole('button', { name: /Sinopsis en inglés/i });
    await expect(enBtn).toBeVisible();

    // Un click adicional vuelve a ES
    await enBtn.click();
    await expect(page.getByRole('button', { name: /Traducción activa/i })).toBeVisible();
  });

  test('funcionalidad de busqueda local en el toolbar', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Cowboy Bebop');
    await expect(searchInput).toHaveValue('Cowboy Bebop');
  });
});
