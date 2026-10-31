import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Les appels /api sont redirigés vers le backend, pas besoin de gérer le CORS en dev
    proxy: { '/api': 'http://localhost:4000' },
  },
})
