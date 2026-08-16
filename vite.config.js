import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


// Configuración de Vite — Vanilla CSS, sin Tailwind (limpiado en v1.3)
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/Am-List/', // GitHub Pages
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
