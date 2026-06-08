import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // dexie-react-hooks'u kendi ortak-veri hook'umuza yönlendir (kod değişmeden)
      'dexie-react-hooks': fileURLToPath(new URL('./src/shims/dexieReactHooks.js', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Geliştirmede API'yi ayrı çalışan sunucuya (PORT=4000) ilet
      '/api': 'http://localhost:4000',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'icons-vendor': ['lucide-react'],
          'scan-vendor': ['html5-qrcode', 'qrcode']
        }
      }
    }
  }
})
