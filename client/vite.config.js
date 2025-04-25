import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    allowedHosts: [
      'medical-appointment-booking-chatbot-1.onrender.com',
      'medical-appointment-booking-chatbot.onrender.com'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    allowedHosts: [
      'medical-appointment-booking-chatbot-1.onrender.com',
      'medical-appointment-booking-chatbot.onrender.com'
    ]
  }
})
