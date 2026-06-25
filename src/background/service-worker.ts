/**
 * Background service worker: context menus, side-panel opening and message
 * routing between the content script and the side panel.
 */
import type { RuntimeMessage } from '@/lib/types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'explain-selection',
    title: 'Explain with AI',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'summarize-page',
    title: 'Summarize page with AI',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id: 'translate-selection',
    title: 'Translate with AI',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  switch (info.menuItemId) {
    case 'explain-selection':
      if (info.selectionText) {
        relayToSidebar({ action: 'explain', text: info.selectionText, pageUrl: tab.url });
      }
      break;
    case 'summarize-page':
      relayToSidebar({ action: 'summarize', pageUrl: tab.url });
      break;
    case 'translate-selection':
      if (info.selectionText) {
        relayToSidebar({ action: 'translate', text: info.selectionText, pageUrl: tab.url });
      }
      break;
  }
});

// Toolbar icon opens the side panel for the current tab.
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  switch (message.action) {
    case 'requestSelectedText':
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'getSelectedText' }, (response) => {
          sendResponse(response);
        });
        return true; // async response
      }
      break;
    case 'openSidePanel':
      if (sender.tab?.id) chrome.sidePanel.open({ tabId: sender.tab.id });
      break;
    case 'setSelectedText':
      if (sender.tab?.id) {
        relayToSidebar({ action: 'setSelectedText', text: message.text, pageUrl: sender.tab.url });
      }
      break;
  }
  return undefined;
});

// Notify the sidebar when the active page finishes loading.
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    relayToSidebar({ action: 'pageChanged', pageUrl: tab.url, title: tab.title });
  }
});

/** Broadcast a message tagged for the side panel surface. */
function relayToSidebar(message: RuntimeMessage): void {
  chrome.runtime.sendMessage({ target: 'sidebar', ...message }).catch(() => {
    /* no receiver (side panel closed) — safe to ignore */
  });
}
