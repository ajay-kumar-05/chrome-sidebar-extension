// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Sidebar Extension installed');
  
  // Create context menu items
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

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case 'explain-selection':
      if (info.selectionText) {
        sendMessageToSidebar(tab.id, {
          action: 'explain',
          text: info.selectionText,
          pageUrl: tab.url,
        });
      }
      break;
    
    case 'summarize-page':
      sendMessageToSidebar(tab.id, {
        action: 'summarize',
        pageUrl: tab.url,
      });
      break;
    
    case 'translate-selection':
      if (info.selectionText) {
        sendMessageToSidebar(tab.id, {
          action: 'translate',
          text: info.selectionText,
          pageUrl: tab.url,
        });
      }
      break;
  }
});

// Handle action button click (opens side panel)
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Handle messages from content script or sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getPageContent':
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'getPageContent' }, (response) => {
          sendResponse(response);
        });
        return true; // Keep message channel open for async response
      }
      break;
    
    case 'openSidePanel':
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id });
      }
      break;
      
    case 'setSelectedText':
      // Forward selected text to sidebar
      if (sender.tab?.id) {
        sendMessageToSidebar(sender.tab.id, {
          action: 'setSelectedText',
          text: message.text,
          pageUrl: sender.tab.url,
        });
      }
      break;
  }
});

// Helper function to send messages to sidebar
function sendMessageToSidebar(tabId, message) {
  // In a real extension, you might need to store sidebar instances
  // For now, we'll use chrome.runtime.sendMessage to communicate
  chrome.runtime.sendMessage({
    target: 'sidebar',
    tabId: tabId,
    ...message,
  });
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Notify sidebar of page change
    sendMessageToSidebar(tabId, {
      action: 'pageChanged',
      pageUrl: tab.url,
      title: tab.title,
    });
  }
});

// Keep service worker alive
let keepAliveInterval;

chrome.runtime.onStartup.addListener(() => {
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // This keeps the service worker alive
    });
  }, 25000); // 25 seconds
});

if (keepAliveInterval) clearInterval(keepAliveInterval);
