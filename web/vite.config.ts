import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@urfmp/types': resolve(__dirname, '../packages/types/src/index.ts'),
      '@urfmp/sdk': resolve(__dirname, '../packages/sdk/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  optimizeDeps: {
    exclude: ['@urfmp/types', '@urfmp/sdk'],
  },
  server: {
    port: 3001,
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
        }
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
        }
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
