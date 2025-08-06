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
    case 'ping':
      // Simple ping to test extension context
      sendResponse({ status: 'alive', timestamp: Date.now() });
      break;
      
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
        try {
          chrome.sidePanel.open({ tabId: sender.tab.id });
          sendResponse({ status: 'opened' });
        } catch (error) {
          console.error('Failed to open side panel:', error);
          sendResponse({ status: 'error', error: error.message });
        }
      } else {
        sendResponse({ status: 'error', error: 'No tab ID available' });
      }
      break;
      
    case 'setSelectedText':
      // Forward selected text to sidebar
      if (sender.tab?.id) {
        sendMessageToSidebar(sender.tab.id, {
          type: 'SELECTED_TEXT',
          text: message.text,
          pageUrl: sender.tab.url,
        });
      }
      break;
      
    case 'takeScreenshot':
      // Handle screenshot request
      handleScreenshot(sender, sendResponse, message.type || 'full');
      return true; // Keep the message channel open for async response
      
    case 'takeRegionScreenshot':
      // Handle region screenshot request
      handleRegionScreenshot(sender, sendResponse);
      return true;
      
    case 'regionSelected':
      // Handle region selection - delegate cropping to content script
      handleRegionCropping(message, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'registerSidebar':
      // Sidebar has registered, acknowledge
      sendResponse({ status: 'registered' });
      break;
  }
});

// Handle screenshot functionality
async function handleScreenshot(sender, sendResponse, type = 'full') {
  try {
    // Get the current active tab instead of relying on sender.tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab?.id) {
      throw new Error('No active tab found');
    }
    
    // Check if we have the necessary permissions
    const hasPermission = await chrome.permissions.contains({
      permissions: ['activeTab', 'tabs'],
      origins: ['<all_urls>']
    });
    
    if (!hasPermission) {
      // Request permissions if we don't have them
      const granted = await chrome.permissions.request({
        permissions: ['activeTab', 'tabs'],
        origins: ['<all_urls>']
      });
      
      if (!granted) {
        throw new Error('Screenshot permission denied');
      }
    }
    
    if (type === 'region') {
      // For region screenshots, we need to use the region screenshot handler
      return handleRegionScreenshot(sender, sendResponse);
    }
    
    // Capture the visible tab (full screenshot) - try different approaches
    let dataUrl;
    try {
      // First try with windowId
      dataUrl = await chrome.tabs.captureVisibleTab(
        activeTab.windowId,
        { format: 'png', quality: 90 }
      );
    } catch (error) {
      console.log('First capture attempt failed, trying without windowId:', error);
      // Fallback: try without specifying windowId
      dataUrl = await chrome.tabs.captureVisibleTab(
        null,
        { format: 'png', quality: 90 }
      );
    }
    
    if (!dataUrl) {
      throw new Error('Failed to capture screenshot');
    }
    
    sendResponse({
      success: true,
      dataUrl: dataUrl,
      type: 'full'
    });
    
  } catch (error) {
    console.error('Screenshot error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle region screenshot functionality
async function handleRegionScreenshot(sender, sendResponse) {
  try {
    // Get the current active tab instead of relying on sender.tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab?.id) {
      throw new Error('No active tab found');
    }
    
    // Check if we have the necessary permissions
    const hasPermission = await chrome.permissions.contains({
      permissions: ['activeTab', 'tabs'],
      origins: ['<all_urls>']
    });
    
    if (!hasPermission) {
      // Request permissions if we don't have them
      const granted = await chrome.permissions.request({
        permissions: ['activeTab', 'tabs'],
        origins: ['<all_urls>']
      });
      
      if (!granted) {
        throw new Error('Screenshot permission denied');
      }
    }
    
    // First capture the full page - try different approaches
    let fullScreenshot;
    try {
      // First try with windowId
      fullScreenshot = await chrome.tabs.captureVisibleTab(
        activeTab.windowId,
        { format: 'png', quality: 90 }
      );
    } catch (error) {
      console.log('First capture attempt failed, trying without windowId:', error);
      // Fallback: try without specifying windowId
      fullScreenshot = await chrome.tabs.captureVisibleTab(
        null,
        { format: 'png', quality: 90 }
      );
    }
    
    if (!fullScreenshot) {
      throw new Error('Failed to capture base screenshot');
    }
    
    // Inject the region selector with the base screenshot
    try {
      // Check if the page can be scripted before injecting
      console.log('Attempting to inject region selector on:', activeTab.url);
      
      // Don't attempt injection on restricted pages
      if (activeTab.url.startsWith('chrome://') ||
          activeTab.url.startsWith('edge://') ||
          activeTab.url.startsWith('chrome-extension://') ||
          activeTab.url.startsWith('extension://') ||
          activeTab.url.includes('extensions') ||
          activeTab.url.startsWith('about:') ||
          activeTab.url.startsWith('moz-extension://')) {
        
        console.log('Restricted page detected, falling back to full screenshot');
        sendResponse({
          success: true,
          dataUrl: fullScreenshot,
          type: 'full',
          message: 'Region selection not available on browser pages. Full screenshot captured instead.'
        });
        return;
      }
      
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: initRegionSelector,
        args: [fullScreenshot]
      });
      
      sendResponse({
        success: true,
        message: 'Region selector activated'
      });
    } catch (scriptError) {
      // Handle pages that can't be scripted
      console.error('Script injection failed:', scriptError);
      
      if (scriptError.message.includes('cannot be scripted') || 
          scriptError.message.includes('extensions gallery') ||
          scriptError.message.includes('Cannot access') ||
          scriptError.message.includes('The extensions gallery')) {
        
        console.log('Cannot inject script on this page, falling back to full screenshot');
        
        // Fallback: just return the full screenshot since we can't inject region selector
        sendResponse({
          success: true,
          dataUrl: fullScreenshot,
          type: 'full',
          message: 'Region selection not available on this page. Full screenshot captured instead.'
        });
      } else {
        throw scriptError;
      }
    }
    
  } catch (error) {
    console.error('Region screenshot error:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Function to be injected into the page for region selection
function initRegionSelector(baseScreenshot) {
  console.log('🎯 Initializing region selector...');
  
  // Remove any existing selector
  const existing = document.getElementById('ai-screenshot-selector');
  if (existing) existing.remove();
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'ai-screenshot-selector';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999999;
    cursor: crosshair;
    user-select: none;
    backdrop-filter: blur(1px);
  `;
  
  // Create selection box
  const selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: absolute;
    border: 2px solid #4F46E5;
    background: rgba(79, 70, 229, 0.1);
    display: none;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
  `;
  
  // Create instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1F2937;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.3s ease;
  `;
  instructions.innerHTML = `
    <div style="text-align: center;">
      <strong>📸 Select Screenshot Area</strong><br>
      <small style="opacity: 0.8;">Click and drag to select • Press ESC to cancel</small>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  overlay.appendChild(selectionBox);
  overlay.appendChild(instructions);
  document.body.appendChild(overlay);
  
  let isSelecting = false;
  let startX, startY;
  
  console.log('✅ Region selector UI created and attached');
  
  // Handle mouse events
  overlay.addEventListener('mousedown', (e) => {
    console.log('🖱️ Mouse down - starting selection');
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
    
    // Update instructions
    instructions.innerHTML = `
      <div style="text-align: center;">
        <strong>📸 Selecting Area...</strong><br>
        <small style="opacity: 0.8;">Release mouse to capture • Press ESC to cancel</small>
      </div>
    `;
  });
  
  overlay.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    
    // Show dimensions
    if (width > 50 && height > 50) {
      instructions.innerHTML = `
        <div style="text-align: center;">
          <strong>📸 Area: ${width}×${height}px</strong><br>
          <small style="opacity: 0.8;">Release mouse to capture • Press ESC to cancel</small>
        </div>
      `;
    }
  });
  
  overlay.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;
    console.log('🖱️ Mouse up - finishing selection');
    isSelecting = false;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    if (width > 10 && height > 10) {
      console.log(`📸 Capturing region: ${width}×${height} at (${left}, ${top})`);
      
      // Show processing message
      instructions.innerHTML = `
        <div style="text-align: center;">
          <strong>📸 Processing Screenshot...</strong><br>
          <small style="opacity: 0.8;">Please wait...</small>
        </div>
      `;
      
      // Send the selection coordinates to the extension
      chrome.runtime.sendMessage({
        action: 'regionSelected',
        region: { left, top, width, height },
        baseScreenshot: baseScreenshot
      });
    } else {
      console.log('❌ Selection too small, canceling');
      instructions.innerHTML = `
        <div style="text-align: center;">
          <strong>❌ Selection too small</strong><br>
          <small style="opacity: 0.8;">Try again or press ESC to cancel</small>
        </div>
      `;
      
      setTimeout(() => {
        instructions.innerHTML = `
          <div style="text-align: center;">
            <strong>📸 Select Screenshot Area</strong><br>
            <small style="opacity: 0.8;">Click and drag to select • Press ESC to cancel</small>
          </div>
        `;
      }, 2000);
    }
    
    // Remove overlay after successful selection
    if (width > 10 && height > 10) {
      setTimeout(() => overlay.remove(), 500);
    }
  });
  
  // Handle escape key
  function escHandler(e) {
    if (e.key === 'Escape') {
      console.log('⏹️ User canceled region selection');
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  }
  
  document.addEventListener('keydown', escHandler);
}

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

// Handle region cropping
async function handleRegionCropping(message, sendResponse) {
  try {
    const { region, baseScreenshot } = message;
    
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab?.id) {
      throw new Error('No active tab found for cropping');
    }
    
    // Send the cropping task to the content script where DOM APIs are available
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: cropScreenshotInPage,
      args: [region, baseScreenshot]
    });
    
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Region crop error:', error);
    // Send error to sidebar
    chrome.runtime.sendMessage({
      action: 'screenshotError',
      error: error.message
    });
    sendResponse({ success: false, error: error.message });
  }
}

// Function to be injected into the page for image cropping
function cropScreenshotInPage(region, baseScreenshot) {
  try {
    console.log('🖼️ Cropping screenshot in page context...');
    
    // Create a canvas to crop the image
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate device pixel ratio for retina displays
      const dpr = window.devicePixelRatio || 1;
      
      // Set canvas size to the selected region
      canvas.width = region.width * dpr;
      canvas.height = region.height * dpr;
      
      // Scale the context for retina displays
      ctx.scale(dpr, dpr);
      
      // Crop the image
      ctx.drawImage(
        img,
        region.left * dpr, region.top * dpr, // Source position
        region.width * dpr, region.height * dpr, // Source size
        0, 0, // Destination position
        region.width, region.height // Destination size
      );
      
      // Convert to data URL
      const croppedDataUrl = canvas.toDataURL('image/png');
      
      console.log('✅ Screenshot cropped successfully');
      
      // Send to sidebar
      chrome.runtime.sendMessage({
        action: 'screenshotCaptured',
        screenshot: croppedDataUrl,
        type: 'region'
      });
    };
    
    img.onerror = (error) => {
      console.error('Image loading error:', error);
      chrome.runtime.sendMessage({
        action: 'screenshotError',
        error: 'Failed to load screenshot for cropping'
      });
    };
    
    img.src = baseScreenshot;
    
  } catch (error) {
    console.error('Cropping error in page:', error);
    chrome.runtime.sendMessage({
      action: 'screenshotError',
      error: error.message
    });
  }
}
