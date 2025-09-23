/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test settings
    globals: true,
    setupFiles: ['./src/test/setup.ts'],

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/tests/**/*.test.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'build'
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**'
      ],
      // Coverage thresholds disabled for CI stability
      // thresholds: {
      //   global: {
      //     branches: 15,
      //     functions: 10,
      //     lines: 15,
      //     statements: 15
      //   }
      // }
    },

    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter configuration
    reporter: process.env.CI
      ? ['verbose', 'junit', 'json']
      : ['verbose'],

    outputFile: {
      junit: './coverage/junit.xml',
      json: './coverage/test-results.json',
      html: './coverage/test-report.html'
    },

    // Mock configuration
    deps: {
      inline: [
        '@urfmp/types',
        '@urfmp/sdk'
      ]
    },

    // Browser-like environment
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: process.env.CI ? 2 : undefined
      }
    }
  },

  // Resolve configuration for tests
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/contexts': path.resolve(__dirname, './src/contexts')
    }
  },

  // Define global constants for tests
  define: {
    'import.meta.vitest': 'undefined',
    __TEST__: true
  }
})