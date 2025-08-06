// Content script that runs on all web pages
(function() {
  'use strict';

  let selectedText = '';
  // Extension state flag for future use

  // Initialize content script
  function init() {
    console.log('AI Sidebar content script loaded');
    
    // Check if extension context is valid
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.warn('Chrome runtime not available, skipping content script initialization');
        return;
      }
      
      // Test if we can access the extension context
      chrome.runtime.getManifest();
    } catch (error) {
      console.warn('Extension context invalid, skipping content script initialization:', error);
      return;
    }
    
    // Add selection listener
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    // Add message listener for background script
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Create floating action button
    createFloatingButton();
  }

  // Handle text selection
  function handleTextSelection() {
    const selection = window.getSelection();
    const newSelectedText = selection.toString().trim();
    
    if (newSelectedText && newSelectedText !== selectedText && newSelectedText.length > 2) {
      selectedText = newSelectedText;
      
      // Send selected text to background script immediately
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
          console.warn('Extension context not available for text selection');
          return;
        }
        
        chrome.runtime.sendMessage({
          action: 'setSelectedText',
          text: selectedText,
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('Failed to send selected text:', chrome.runtime.lastError);
          } else {
            console.log('✅ Selected text sent to sidebar:', selectedText.substring(0, 50) + '...');
          }
        });
        
        // Also show selection popup for quick actions
        showSelectionPopup(selection);
      } catch (error) {
        console.warn('Extension context error during text selection:', error);
      }
    } else if (!newSelectedText) {
      selectedText = '';
      hideSelectionPopup();
    }
  }

  // Handle messages from background script or popup
  function handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getPageContent':
        const content = {
          title: document.title,
          url: window.location.href,
          text: document.body.innerText,
          selectedText: selectedText,
        };
        sendResponse(content);
        break;
        
      case 'getSelectedText':
        sendResponse({ selectedText });
        break;
        
      case 'scrollToText':
        if (request.text) {
          scrollToText(request.text);
        }
        break;
    }
  }

  // Create floating action button
  function createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'ai-sidebar-float-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Styles for floating button
    Object.assign(button.style, {
      position: 'fixed',
      top: 'auto',
      bottom: '80px',
      right: '0px',
      width: '40px',
      height: '35px',
      borderRadius: '50% 0 0 50%',
      backgroundColor: '#9d00e0ff',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '10000',
      transition: 'all 0.3s ease',
      opacity: '0.9',
    });
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.opacity = '0.9';
      button.style.transform = 'scale(1)';
    });
    
    // Click handler
    button.addEventListener('click', () => {
      try {
        console.log('🔍 Float button clicked, checking extension context...');
        
        // More robust check for chrome runtime
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
          console.warn('Chrome runtime not available or extension context lost');
          showExtensionReloadNotice();
          return;
        }
        
        // Test the connection first
        chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Extension context error on ping:', chrome.runtime.lastError);
            showExtensionReloadNotice();
            return;
          }
          
          // If ping successful, try to open side panel
          console.log('✅ Extension context verified, opening side panel...');
          chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Failed to open side panel:', chrome.runtime.lastError);
              showExtensionReloadNotice();
            } else {
              console.log('✅ Side panel opened successfully');
            }
          });
        });
        
      } catch (error) {
        console.error('Exception in float button click:', error);
        showExtensionReloadNotice();
      }
    });
    
    document.body.appendChild(button);
  }

  // Show selection popup with AI actions
  function showSelectionPopup(selection) {
    hideSelectionPopup(); // Remove existing popup
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const popup = document.createElement('div');
    popup.id = 'ai-sidebar-selection-popup';
    popup.innerHTML = `
      <div class="ai-popup-content">
        <button class="ai-popup-btn" data-action="explain">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <point cx="12" cy="17" rx="1" ry="1"/>
          </svg>
          Explain
        </button>
        <button class="ai-popup-btn" data-action="translate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 8l6 6"/>
            <path d="M4 14l6-6 2-3"/>
            <path d="M2 5h12"/>
            <path d="M7 2h1"/>
            <path d="M22 22l-5-10-5 10"/>
            <path d="M14 18h6"/>
          </svg>
          Translate
        </button>
        <button class="ai-popup-btn" data-action="summarize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          Summarize
        </button>
      </div>
    `;
    
    // Styles for popup
    Object.assign(popup.style, {
      position: 'absolute',
      top: (rect.bottom + window.scrollY + 8) + 'px',
      left: Math.max(10, rect.left + window.scrollX) + 'px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      zIndex: '10001',
      padding: '8px',
      fontSize: '14px',
    });
    
    // Add CSS for popup content
    const style = document.createElement('style');
    style.textContent = `
      .ai-popup-content {
        display: flex;
        gap: 4px;
      }
      .ai-popup-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border: none;
        background: white;
        color: #374151;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      }
      .ai-popup-btn:hover {
        background-color: #f3f4f6;
      }
    `;
    document.head.appendChild(style);
    
    // Add click handlers
    popup.querySelectorAll('.ai-popup-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        handleSelectionAction(action);
        hideSelectionPopup();
      });
    });
    
    document.body.appendChild(popup);
    
    // Auto-hide after delay
    setTimeout(() => {
      hideSelectionPopup();
    }, 10000);
  }

  // Hide selection popup
  function hideSelectionPopup() {
    const popup = document.getElementById('ai-sidebar-selection-popup');
    if (popup) {
      popup.remove();
    }
  }

  // Handle selection action
  function handleSelectionAction(action) {
    if (!selectedText) return;
    
    try {
      // Check if chrome runtime is available
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        console.warn('Extension context not available for selection action');
        showExtensionReloadNotice();
        return;
      }
      
      // Test connection first, then open sidebar and send action
      chrome.runtime.sendMessage({ action: 'ping' }, (pingResponse) => {
        if (chrome.runtime.lastError) {
          console.error('Ping failed:', chrome.runtime.lastError);
          showExtensionReloadNotice();
          return;
        }
        
        // Open sidebar
        chrome.runtime.sendMessage({
          action: 'openSidePanel',
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to open side panel:', chrome.runtime.lastError);
            showExtensionReloadNotice();
            return;
          }
          
          // Send the specific action to background script
          setTimeout(() => {
            chrome.runtime.sendMessage({
              action: action,
              text: selectedText,
              pageUrl: window.location.href,
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn('Failed to send action:', chrome.runtime.lastError);
              }
            });
          }, 500);
        });
      });
    } catch (error) {
      console.error('Extension context error during selection action:', error);
      showExtensionReloadNotice();
    }
  }
  
  // Show extension reload notice
  function showExtensionReloadNotice() {
    // Remove any existing notice
    const existingNotice = document.getElementById('ai-extension-reload-notice');
    if (existingNotice) existingNotice.remove();
    
    const notice = document.createElement('div');
    notice.id = 'ai-extension-reload-notice';
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      border: 2px solid #fca5a5;
      color: #dc2626;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 100000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    
    notice.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">⚠️</span>
        <strong>Extension Context Lost</strong>
      </div>
      <div style="margin-bottom: 12px; font-size: 13px;">
        The extension was reloaded. Please refresh this page to restore functionality.
      </div>
      <button id="reload-page-btn" style="
        background: #dc2626;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 8px;
      ">Refresh Page</button>
      <button id="dismiss-notice-btn" style="
        background: transparent;
        color: #dc2626;
        border: 1px solid #dc2626;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">Dismiss</button>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    notice.querySelector('#reload-page-btn').addEventListener('click', () => {
      window.location.reload();
    });
    
    notice.querySelector('#dismiss-notice-btn').addEventListener('click', () => {
      notice.remove();
    });
    
    document.body.appendChild(notice);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notice.parentNode) notice.remove();
    }, 10000);
  }

  // Scroll to specific text
  function scrollToText(text) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes(text)) {
        const range = document.createRange();
        const startIndex = node.textContent.indexOf(text);
        range.setStart(node, startIndex);
        range.setEnd(node, startIndex + text.length);
        
        const rect = range.getBoundingClientRect();
        window.scrollTo({
          top: rect.top + window.scrollY - 100,
          behavior: 'smooth'
        });
        
        // Highlight the text briefly
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.style.transition = 'background-color 2s';
        
        range.surroundContents(span);
        setTimeout(() => {
          span.style.backgroundColor = 'transparent';
          setTimeout(() => {
            span.outerHTML = span.innerHTML;
          }, 2000);
        }, 1000);
        
        break;
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
