import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Am-List/', // GitHub Pages: vicentemrk.github.io/Am-List/
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
