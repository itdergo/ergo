/**
 * vitest.config.ts — Vitest test configuration.
 *
 * Configures the test environment with:
 * - jsdom environment for DOM testing
 * - React plugin for JSX transformation
 * - Path aliases matching vite.config.ts
 * - Setup file for jest-dom matchers and browser API mocks
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, '..', 'attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/playwright.config.ts'],
  },
});
