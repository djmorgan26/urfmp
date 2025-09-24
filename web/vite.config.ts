/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@urfmp/types': resolve(
        __dirname,
        process.env.NODE_ENV === 'production'
          ? './src/lib/types/index.ts'
          : '../packages/types/src/index.ts'
      ),
      '@urfmp/sdk': resolve(
        __dirname,
        process.env.NODE_ENV === 'production'
          ? './src/lib/sdk/index.ts'
          : '../packages/sdk/src/index.ts'
      ),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  optimizeDeps: {
    exclude: ['@urfmp/types', '@urfmp/sdk'],
  },
  server: {
    port: 3001,
    host: true, // Allow access from any IP (required for Docker)
    hmr: {
      port: 3001, // Ensure HMR uses the same port
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // CORS proxy for NASA Earth imagery
      '/nasa-proxy': {
        target: 'https://eoimages.gsfc.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nasa-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://eoimages.gsfc.nasa.gov')
          })
        },
      },
      // CORS proxy for ESA imagery
      '/esa-proxy': {
        target: 'https://s2maps-tiles.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/esa-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://s2maps-tiles.eu')
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
