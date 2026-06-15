import type { PageContext, RuntimeMessage } from './types';

/** True when running inside the extension (vs. the plain `vite` web preview). */
export const isExtension = (): boolean =>
  typeof chrome !== 'undefined' && !!chrome.runtime?.id;

/** Pages where we cannot inject scripts at all. */
export function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return (
    /^(chrome|edge|brave|about|chrome-extension|moz-extension|view-source|file|data):/i.test(url) ||
    /^https?:\/\/(chrome\.google\.com\/webstore|chromewebstore\.google\.com)/i.test(url)
  );
}

/**
 * Mirror the "configured" state to chrome.storage so the content script (which
 * can't read the side panel's localStorage) knows whether to show the in-page
 * selection popup.
 */
export function syncConfigured(configured: boolean): void {
  if (!isExtension()) return;
  try {
    chrome.storage.local.set({ 'ai-sidebar-configured': configured });
  } catch {
    /* storage unavailable */
  }
}

/** Open the side panel for the active tab (called from in-page actions). */
export function openSidePanel(): void {
  if (!isExtension()) return;
  chrome.runtime.sendMessage({ action: 'openSidePanel' } satisfies RuntimeMessage);
}

/** Subscribe to runtime messages addressed to the sidebar. Returns an unsubscribe fn. */
export function onRuntimeMessage(handler: (msg: RuntimeMessage) => void): () => void {
  if (!isExtension()) return () => {};
  const listener = (msg: RuntimeMessage) => {
    if (msg.target && msg.target !== 'sidebar') return;
    handler(msg);
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

/** Read the active tab's title/url/text via an injected script. */
export function fetchPageContent(): Promise<PageContext | null> {
  return new Promise((resolve) => {
    if (!isExtension()) return resolve(null);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs?.[0];
        if (!tab?.id || isRestrictedUrl(tab.url)) return resolve(null);
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => ({
              title: document.title,
              url: location.href,
              text: document.body ? document.body.innerText : '',
            }),
          },
          (results) => {
            if (chrome.runtime.lastError || !results?.[0]) {
              return resolve({ title: tab.title ?? '', url: tab.url ?? '', text: '' });
            }
            resolve(results[0].result as PageContext);
          },
        );
      });
    } catch {
      resolve(null);
    }
  });
}

/** Ask the background/content script for the most recent selection. */
export function fetchLatestSelection(): Promise<string> {
  return new Promise((resolve) => {
    if (!isExtension()) return resolve('');
    try {
      chrome.runtime.sendMessage({ action: 'requestSelectedText' }, (res) => {
        if (chrome.runtime.lastError || res === undefined) {
          ensureActiveTabContext();
          return resolve('');
        }
        resolve(res?.selectedText?.trim() ?? '');
      });
    } catch {
      ensureActiveTabContext();
      resolve('');
    }
  });
}

/**
 * Verify the active tab has our content script. If not (e.g. the page was open
 * before the extension loaded), inject a "refresh to connect" banner.
 * Resolves true when the tab context is available.
 */
export function ensureActiveTabContext(labels?: BannerLabels): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isExtension()) return resolve(false);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs?.[0];
        if (!tab?.id || isRestrictedUrl(tab.url)) return resolve(false);
        chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (res) => {
          if (chrome.runtime.lastError || !res?.pong) {
            if (labels) showRefreshBanner(tab.id!, labels);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch {
      resolve(false);
    }
  });
}

export interface BannerLabels {
  heading: string;
  message: string;
  refresh: string;
}

/** Inject a small top-right "refresh to connect" banner into the page. */
export function showRefreshBanner(tabId: number, labels: BannerLabels): void {
  if (!isExtension()) return;
  try {
    chrome.scripting.executeScript({
      target: { tabId },
      args: [labels],
      func: (L: BannerLabels) => {
        if (document.getElementById('ai-sidebar-refresh-banner')) return;
        const card = document.createElement('div');
        card.id = 'ai-sidebar-refresh-banner';
        card.setAttribute(
          'style',
          [
            'position:fixed',
            'top:16px',
            'right:16px',
            'z-index:2147483647',
            'width:300px',
            'max-width:calc(100vw - 32px)',
            'box-sizing:border-box',
            'padding:14px 14px 14px 16px',
            'border-radius:14px',
            'background:#ffffff',
            'border:1px solid #e7e8ec',
            'box-shadow:0 18px 44px -16px rgba(20,22,40,.4)',
            "font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            'color:#0f1222',
            'animation:aiBannerIn .22s cubic-bezier(.16,1,.3,1)',
          ].join(';'),
        );
        card.innerHTML =
          '<style>@keyframes aiBannerIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}' +
          '#ai-sidebar-refresh-banner *{box-sizing:border-box}</style>' +
          '<div style="display:flex;gap:11px;align-items:flex-start">' +
          '<div style="flex:none;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 6px 14px -6px rgba(99,102,241,.8)">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>' +
          '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:700;letter-spacing:-.01em;margin-bottom:2px">' +
          L.heading +
          '</div>' +
          '<div style="font-size:12px;line-height:1.45;color:#6b7280">' +
          L.message +
          '</div>' +
          '</div>' +
          '<button id="ai-sb-x" aria-label="Dismiss" style="flex:none;border:none;background:transparent;color:#9ca3af;cursor:pointer;padding:2px;border-radius:6px;line-height:0">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
          '</div>' +
          '<button id="ai-sb-refresh" style="margin-top:12px;width:100%;padding:9px;border:none;border-radius:10px;cursor:pointer;color:#fff;font-size:13px;font-weight:700;font-family:inherit;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 10px 22px -10px rgba(99,102,241,.9)">' +
          L.refresh +
          '</button>';
        document.documentElement.appendChild(card);
        card.querySelector('#ai-sb-refresh')?.addEventListener('click', () => location.reload());
        card.querySelector('#ai-sb-x')?.addEventListener('click', () => card.remove());
        setTimeout(() => document.getElementById('ai-sidebar-refresh-banner')?.remove(), 20000);
      },
    });
  } catch {
    /* could not inject */
  }
}
