import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages configuration
  // Using relative base path ensures assets resolve correctly when deployed to a subdirectory or with HashRouter
  base: './',
  build: {
    // Production optimization
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'motion-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
