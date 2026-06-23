import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LangCode, Theme } from '@/lib/types';
import { syncConfigured, syncLang } from '@/lib/messaging';

export interface SettingsState {
  apiKey: string;
  baseUrl: string;
  model: string;
  name: string;
  theme: Theme;
  lang: LangCode;
  /** Merge a partial settings update and persist it. */
  update: (patch: Partial<Omit<SettingsState, 'update' | 'resetApiKey'>>) => void;
  /** Clear only the API key; base URL and model are kept. */
  resetApiKey: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      baseUrl: '',
      model: '',
      name: '',
      theme: 'light',
      lang: 'en',

      update: (patch) => {
        set(patch);
        if ('apiKey' in patch) syncConfigured(!!get().apiKey);
        if ('lang' in patch) syncLang(get().lang);
      },

      resetApiKey: () => {
        set({ apiKey: '' });
        syncConfigured(false);
      },
    }),
    {
      name: 'ai-sidebar-settings',
      onRehydrateStorage: () => (state) => {
        // Keep the content script's "configured" flag in sync on load.
        if (state) syncConfigured(!!state.apiKey);
        if (state) syncLang(state.lang);
      },
    },
  ),
);

/** Whether the user has finished first-run setup. */
export const isConfigured = (s: SettingsState): boolean => !!s.apiKey;
