/** Shared domain types for the sidebar, background and content scripts. */

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
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
 */
export interface RuntimeMessage {
  action:
    | 'ping'
    | 'openSidePanel'
    | 'setSelectedText'
    | 'requestSelectedText'
    | 'getSelectedText'
    | 'getPageContent'
    | 'explain'
    | 'translate'
    | 'summarize'
    | 'pageChanged';
  /** Restricts a broadcast to a specific surface (e.g. 'sidebar'). */
  target?: 'sidebar';
  text?: string;
  pageUrl?: string;
  title?: string;
  targetLang?: string;
}
