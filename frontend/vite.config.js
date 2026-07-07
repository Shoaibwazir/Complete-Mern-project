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
  
  // ✅ YAHAN CHANGE KAREIN
  build: {
    // Warning limit ko 2000 kB (2 MB) tak badha den
    chunkSizeWarningLimit: 2000,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Large libraries ko alag chunks mein daalen
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'react-icons'],
          'payment-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js', '@paypal/react-paypal-js'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
        },
      },
    },
  },
})