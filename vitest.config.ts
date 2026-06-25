import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// A standalone Vitest config (no CRXJS plugin) so unit tests run in plain Node
// without the extension build pipeline.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
