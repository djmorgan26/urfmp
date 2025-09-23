/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@urfmp/types': resolve(__dirname, './src/lib/types/index.ts'),
      '@urfmp/sdk': resolve(__dirname, './src/lib/sdk/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})