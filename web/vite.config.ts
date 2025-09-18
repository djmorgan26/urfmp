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
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
