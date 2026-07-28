import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Configuración de Vite con Tailwind v4 y alias de ruta `@`
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
