import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Send /api requests to the Express server during development
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:3000',
    },
  },
})
