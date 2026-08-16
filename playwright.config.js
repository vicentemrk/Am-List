import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Visual regression: screenshots guardados en e2e/snapshots/
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { threshold: 0.1 }, // 10% tolerancia para anti-aliasing cross-env
  },
  use: {
    baseURL: 'http://localhost:5173/Am-List/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/Am-List/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

