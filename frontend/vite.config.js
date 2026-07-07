import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Custom plugin to handle backend imports
    {
      name: 'ignore-backend',
      resolveId(source) {
        // Ignore any imports from Backend folder
        if (source.includes('Backend/') || source.includes('/Backend/')) {
          return { id: source, external: true }
        }
        return null
      }
    }
  ],
  
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
  
  // Build configuration
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude backend imports during build
        if (id.includes('Backend/') || id.includes('/Backend/')) {
          return true
        }
        return false
      }
    }
  }
})