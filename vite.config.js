import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})
