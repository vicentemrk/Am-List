import { test, expect } from '@playwright/test';

test.describe('AMlist End-to-End User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server root
    await page.goto('/');
  });

  test('should load application title and initial header UI', async ({ page }) => {
    await expect(page).toHaveTitle(/AMlist/i);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should allow switching section tabs', async ({ page }) => {
    const completadosTab = page.getByRole('tab', { name: /completados/i });
    if (await completadosTab.isVisible()) {
      await completadosTab.click();
      await expect(completadosTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should display search input in header', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar por título/i);
    await expect(searchInput).toBeVisible();
  });
});
