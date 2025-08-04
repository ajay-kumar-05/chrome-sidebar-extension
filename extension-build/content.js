// Content script that runs on all web pages
(function() {
  'use strict';

  let selectedText = '';
  // Extension state flag for future use

  // Initialize content script
  function init() {
    console.log('AI Sidebar content script loaded');
    
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
    
    if (newSelectedText && newSelectedText !== selectedText) {
      selectedText = newSelectedText;
      
      // Send selected text to background script
      chrome.runtime.sendMessage({
        action: 'setSelectedText',
        text: selectedText,
      });
      
      // Show selection popup
      showSelectionPopup(selection);
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
      chrome.runtime.sendMessage({ action: 'openSidePanel' });
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
    
    // Open sidebar and send action
    chrome.runtime.sendMessage({
      action: 'openSidePanel',
    });
    
    // Send the specific action to background script
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: action,
        text: selectedText,
        pageUrl: window.location.href,
      });
    }, 500);
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
