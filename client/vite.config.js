import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT || 3000
  },
  preview: {
    host: true,
    port: process.env.PORT || 3000
  }
})
