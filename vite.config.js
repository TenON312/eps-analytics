import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ЕРС Аналитика',
        short_name: 'ЕРС Аналитика',
        description: 'Система аналитики для ЕРС магазинов',
        theme_color: '#1f2937',
        background_color: '#1f2937',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react']
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts')
    }
  },
  
  preview: {
    port: 4173,
    host: true
  },
  
  define: {
    'process.env': {}
  }
})