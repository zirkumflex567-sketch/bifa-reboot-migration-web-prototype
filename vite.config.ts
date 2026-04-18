import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bifa/',
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 650
  }
})
