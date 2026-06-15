/**
 * Content script: tracks the current text selection, shows an in-page action
 * popup (Explain / Translate / Summarize) and exposes page info to the sidebar.
 * Runs in every page, so it stays plain DOM — no React / Tailwind here.
 */
import './content.css';

interface IncomingMessage {
  action: string;
  text?: string;
}

const TRANSLATE_LANGS = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Hindi', flag: '🇮🇳' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Arabic', flag: '🇸🇦' },
];

let selectedText = '';
let isConfigured = false;
let popupTimer: ReturnType<typeof setTimeout> | null = null;

function init(): void {
  // Load the "configured" flag and keep it in sync with the sidebar.
  try {
    chrome.storage?.local?.get('ai-sidebar-configured', (res) => {
      isConfigured = !!res?.['ai-sidebar-configured'];
    });
    chrome.storage?.onChanged?.addListener((changes, area) => {
      if (area === 'local' && changes['ai-sidebar-configured']) {
        isConfigured = !!changes['ai-sidebar-configured'].newValue;
        if (!isConfigured) hideSelectionPopup();
      }
    });
  } catch {
    /* storage unavailable */
  }

  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
  chrome.runtime.onMessage.addListener(handleMessage);
  createFloatingButton();
}

function handleTextSelection(e: Event): void {
  const target = e.target as HTMLElement | null;
  if (target?.closest?.('#ai-sidebar-selection-popup')) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim() ?? '';

  if (text && text !== selectedText) {
    selectedText = text;
    chrome.runtime.sendMessage({ action: 'setSelectedText', text });
    if (isConfigured && selection) showSelectionPopup(selection);
  } else if (!text) {
    selectedText = '';
    hideSelectionPopup();
  }
}

function handleMessage(
  request: IncomingMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): void {
  switch (request.action) {
    case 'ping':
      sendResponse({ pong: true });
      break;
    case 'getPageContent':
      sendResponse({
        title: document.title,
        url: window.location.href,
        text: document.body.innerText,
        selectedText,
      });
      break;
    case 'getSelectedText':
      sendResponse({ selectedText });
      break;
  }
}

function createFloatingButton(): void {
  const button = document.createElement('div');
  button.id = 'ai-sidebar-float-btn';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '80px',
    right: '0px',
    width: '45px',
    height: '40px',
    borderRadius: '50% 0 0 50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '10000',
    transition: 'all 0.3s ease',
    opacity: '0.9',
  } as Partial<CSSStyleDeclaration>);

  button.addEventListener('mouseenter', () => {
    button.style.opacity = '1';
    button.style.transform = 'scale(1.1)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.opacity = '0.9';
    button.style.transform = 'scale(1)';
  });
  button.addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openSidePanel' }));

  document.body.appendChild(button);
}

function ensurePopupStyles(): void {
  if (document.getElementById('ai-sidebar-popup-styles')) return;
  const style = document.createElement('style');
  style.id = 'ai-sidebar-popup-styles';
  style.textContent = `
    #ai-sidebar-selection-popup {
      position: absolute; z-index: 2147483646;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: aiPopIn .16s cubic-bezier(.16,1,.3,1);
    }
    @keyframes aiPopIn { from { opacity:0; transform: translateY(-6px) scale(.97);} to { opacity:1; transform:none; } }
    .ai-popup-bar {
      display: flex; align-items: stretch; gap: 2px;
      background: #ffffff; border: 1px solid #e7e8ec; border-radius: 12px;
      box-shadow: 0 12px 30px -10px rgba(20,22,40,.32); padding: 5px;
    }
    .ai-popup-btn {
      display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px;
      border: none; background: transparent; color: #1f2433; border-radius: 8px;
      cursor: pointer; font-size: 13px; font-weight: 600; line-height: 1;
      transition: background .15s ease, color .15s ease; white-space: nowrap;
    }
    .ai-popup-btn svg { width: 16px; height: 16px; color: #6366f1; }
    .ai-popup-btn:hover { background: #f1f2f5; }
    .ai-popup-split { display: flex; align-items: stretch; }
    .ai-popup-split .ai-popup-btn { padding-right: 6px; }
    .ai-popup-caret {
      display: inline-flex; align-items: center; justify-content: center; width: 26px;
      border: none; background: transparent; color: #6b7280; border-radius: 8px;
      cursor: pointer; transition: background .15s ease;
    }
    .ai-popup-caret:hover, .ai-popup-caret.open { background: #ece9ff; color: #6366f1; }
    .ai-popup-caret svg { width: 14px; height: 14px; transition: transform .2s ease; }
    .ai-popup-caret.open svg { transform: rotate(180deg); }
    .ai-popup-langs {
      margin-top: 6px; background: #ffffff; border: 1px solid #e7e8ec; border-radius: 12px;
      box-shadow: 0 12px 30px -10px rgba(20,22,40,.32); padding: 6px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 2px; max-width: 280px;
      animation: aiPopIn .14s cubic-bezier(.16,1,.3,1);
    }
    .ai-popup-langs.hidden { display: none; }
    .ai-popup-lang {
      display: flex; align-items: center; gap: 8px; padding: 8px 10px;
      border: none; background: transparent; color: #1f2433; border-radius: 8px;
      cursor: pointer; font-size: 12.5px; font-weight: 500; text-align: left;
      transition: background .15s ease;
    }
    .ai-popup-lang:hover { background: #f1f2f5; }
    .ai-popup-lang .ai-flag { font-size: 15px; }
  `;
  document.head.appendChild(style);
}

function showSelectionPopup(selection: Selection): void {
  hideSelectionPopup();
  ensurePopupStyles();

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const popup = document.createElement('div');
  popup.id = 'ai-sidebar-selection-popup';
  popup.innerHTML = `
    <div class="ai-popup-bar">
      <button class="ai-popup-btn" data-action="explain">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
        Explain
      </button>
      <span class="ai-popup-split">
        <button class="ai-popup-btn" data-action="translate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7M9 3v2c0 4-2 7-5 9M5 9c0 2.5 2.5 4.5 6 4.5M12 20l4-9 4 9M13.5 17h5"/></svg>
          Translate
        </button>
        <button class="ai-popup-caret" id="ai-translate-caret" title="Choose language">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </span>
      <button class="ai-popup-btn" data-action="summarize">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>
        Summarize
      </button>
    </div>
    <div class="ai-popup-langs hidden" id="ai-popup-langs">
      ${TRANSLATE_LANGS.map(
        (l) => `<button class="ai-popup-lang" data-lang="${l.name}"><span class="ai-flag">${l.flag}</span>${l.name}</button>`,
      ).join('')}
    </div>`;

  const left = Math.min(
    Math.max(10, rect.left + window.scrollX),
    window.scrollX + document.documentElement.clientWidth - 360,
  );
  Object.assign(popup.style, {
    top: `${rect.bottom + window.scrollY + 8}px`,
    left: `${Math.max(10, left)}px`,
  });

  popup.querySelectorAll<HTMLButtonElement>('.ai-popup-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleSelectionAction(btn.dataset.action ?? '');
      hideSelectionPopup();
    });
  });

  const caret = popup.querySelector('#ai-translate-caret');
  const langs = popup.querySelector('#ai-popup-langs');
  caret?.addEventListener('click', (e) => {
    e.stopPropagation();
    langs?.classList.toggle('hidden');
    caret.classList.toggle('open');
  });

  langs?.querySelectorAll<HTMLButtonElement>('.ai-popup-lang').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      handleSelectionAction('translate', b.dataset.lang);
      hideSelectionPopup();
    });
  });

  document.body.appendChild(popup);
  popupTimer = setTimeout(hideSelectionPopup, 12000);
}

function hideSelectionPopup(): void {
  if (popupTimer) {
    clearTimeout(popupTimer);
    popupTimer = null;
  }
  document.getElementById('ai-sidebar-selection-popup')?.remove();
}

function handleSelectionAction(action: string, targetLang?: string): void {
  if (!selectedText) return;
  chrome.runtime.sendMessage({ action: 'openSidePanel' });
  // Give the side panel a moment to open before routing the action to it.
  setTimeout(() => {
    chrome.runtime.sendMessage({
      action,
      text: selectedText,
      pageUrl: window.location.href,
      targetLang: targetLang || undefined,
    });
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
