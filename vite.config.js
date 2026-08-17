import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // You can change this port to any number (e.g. 5174, 3000, 8080)
    host: true,
  },
  preview: {
    port: 5173, // Port for vite preview
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
})
