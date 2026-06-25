/** Centralized constants: storage keys and tunable limits used across surfaces. */

/** Keys used in chrome.storage.local and the Zustand persist middleware. */
export const STORAGE_KEYS = {
  /** Mirror of the "user finished setup" flag, read by the content script. */
  configured: 'ai-sidebar-configured',
  /** Persisted conversation. */
  chat: 'ai-sidebar-chat',
  /** Persisted user settings (key, base URL, model, name, theme, lang). */
  settings: 'ai-sidebar-settings',
  /** Mirror of the UI language, read by the content script for the popup. */
  lang: 'ai-sidebar-lang',
} as const;

/** Max messages retained in the store (and persisted). */
export const MAX_MESSAGES = 50;

/** Max conversation messages sent to the model on each request. */
export const MAX_CONTEXT_MESSAGES = 10;

/** Max characters of page text fed into a "summarize this page" request. */
export const MAX_PAGE_TEXT = 12_000;

/** Abort an in-flight model request after this long with no completion. */
export const REQUEST_TIMEOUT_MS = 60_000;
