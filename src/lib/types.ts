/** Shared domain types for the sidebar, background and content scripts. */

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  /** Optional image attachments as data URLs (base64), sent as vision content. */
  images?: string[];
}

export type LangCode = 'en' | 'hi' | 'fr' | 'es';

export type Theme = 'light' | 'dark';

/** Quick actions that can be triggered from the panel, popup or context menu. */
export type QuickAction = 'summarize' | 'explain' | 'translate';

export interface PageContext {
  title: string;
  url: string;
  text: string;
}

/**
 * Messages exchanged over chrome.runtime between the content script,
 * background service worker and the side panel.
 *
 * A discriminated union on `action`: switching on it narrows each branch so the
 * compiler guarantees the required fields (e.g. `text` on a selection action)
 * exist and rejects fields that don't belong to that action.
 */
export type RuntimeMessage =
  // Liveness probe — content script replies { pong: true }.
  | { action: 'ping' }
  // Open the side panel for the sender's tab.
  | { action: 'openSidePanel' }
  // Side panel ↔ background ↔ content selection plumbing.
  | { action: 'requestSelectedText' }
  | { action: 'getSelectedText' }
  | { action: 'getPageContent' }
  | { action: 'startRegionCapture' }
  | { action: 'setSelectedText'; text: string; pageUrl?: string }
  // Quick actions on a selection / page.
  | { action: 'explain'; text: string; pageUrl?: string; targetLang?: string }
  | { action: 'translate'; text: string; pageUrl?: string; targetLang?: string }
  | { action: 'summarize'; text?: string; pageUrl?: string; targetLang?: string }
  // Active tab finished loading.
  | { action: 'pageChanged'; pageUrl: string; title?: string };

/** A runtime message optionally restricted to a single surface (the sidebar). */
export type BroadcastMessage = RuntimeMessage & { target?: 'sidebar' };

/** Action names that carry a `text` selection (used to narrow safely). */
export type ActionName = RuntimeMessage['action'];
