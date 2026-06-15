import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'extension-build',
    emptyOutDir: true,
  },
  server: {
    // Stable port keeps CRXJS HMR working when the side panel reloads.
    port: 5173,
    strictPort: true,
  },
});
