import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, './tests/setup/vitest.setup.ts')],
    include: ['**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      enabled: false,
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      'server-only': path.resolve(__dirname, './tests/setup/server-only.ts'),
    },
  },
});
