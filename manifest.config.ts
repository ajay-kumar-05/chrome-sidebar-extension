import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

/**
 * MV3 manifest — the single source of truth for the extension.
 * CRXJS bundles the referenced TS/HTML entry points and rewrites the paths
 * in the generated manifest.json.
 */
export default defineManifest({
  manifest_version: 3,
  name: 'AI Sidebar Assistant',
  version: pkg.version,
  description: pkg.description,
  permissions: ['activeTab', 'storage', 'sidePanel', 'contextMenus', 'scripting', 'tabs'],
  // Wildcards cover any OpenAI-compatible endpoint the user configures.
  host_permissions: ['http://*/*', 'https://*/*'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content-script.ts'],
    },
  ],
  side_panel: {
    default_path: 'index.html',
  },
  action: {
    default_title: 'Open AI Sidebar',
  },
  icons: {
    16: 'icons/icon16.png',
    32: 'icons/icon32.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },
});
