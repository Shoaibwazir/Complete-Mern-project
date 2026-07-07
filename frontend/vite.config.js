import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Large chunk warning limit
    chunkSizeWarningLimit: 50000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {

            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'react-vendor'
            }

            if (
              id.includes('@reduxjs') ||
              id.includes('react-redux')
            ) {
              return 'redux-vendor'
            }

            if (
              id.includes('framer-motion') ||
              id.includes('lucide-react') ||
              id.includes('react-icons')
            ) {
              return 'ui-vendor'
            }

            if (
              id.includes('@stripe') ||
              id.includes('@paypal')
            ) {
              return 'payment-vendor'
            }

            if (
              id.includes('jspdf') ||
              id.includes('html2canvas')
            ) {
              return 'pdf-vendor'
            }
          }
        },
      },
    },
  },
})