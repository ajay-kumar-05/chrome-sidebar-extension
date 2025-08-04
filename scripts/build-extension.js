const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  const srcDir = path.join(__dirname, '..');
  const extensionDir = path.join(srcDir, 'extension-build');
  
  try {
    // Clean and create extension build directory
    await fs.remove(extensionDir);
    await fs.ensureDir(extensionDir);
    console.log('✅ Created clean extension build directory');
    
    // 1. Generate manifest.json
    const manifest = {
      "manifest_version": 3,
      "name": "AI Sidebar Assistant",
      "version": "1.0.0",
      "description": "AI-powered sidebar extension for enhanced browsing experience",
      "permissions": [
        "activeTab",
        "storage",
        "sidePanel",
        "contextMenus",
        "scripting"
      ],
      "host_permissions": [
        "http://*/*",
        "https://*/*",
        "https://api.openai.com/*"
      ],
      "background": {
        "service_worker": "background.js"
      },
      "content_scripts": [
        {
          "matches": ["<all_urls>"],
          "js": ["content.js"],
          "css": ["content.css"]
        }
      ],
      "side_panel": {
        "default_path": "index.html"
      },
      "action": {
        "default_title": "Open AI Sidebar",
        "default_icon": {
          "16": "icons/icon16.png",
          "32": "icons/icon32.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      },
      "icons": {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      },
      "web_accessible_resources": [
        {
          "resources": ["*.js", "*.css", "*.html"],
          "matches": ["<all_urls>"]
        }
      ]
    };
    
    await fs.writeJson(path.join(extensionDir, 'manifest.json'), manifest, { spaces: 2 });
    console.log('✅ Generated manifest.json');
    
    // 2. Generate index.html (Sidebar page)
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Sidebar Assistant</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 400px;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            overflow: hidden;
        }
        
        .container {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background: #ffffff;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .logo {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
        }
        
        .title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
        }
        
        .header-actions {
            display: flex;
            gap: 4px;
        }
        
        .btn {
            padding: 8px;
            border: none;
            background: transparent;
            border-radius: 8px;
            cursor: pointer;
            color: #6b7280;
            transition: all 0.2s;
        }
        
        .btn:hover {
            background: #f3f4f6;
            color: #374151;
        }
        
        .btn-danger:hover {
            color: #dc2626;
        }
        
        .quick-actions {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            background: #ffffff;
        }
        
        .actions-grid {
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .action-btn.blue {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .action-btn.blue:hover {
            background: #bfdbfe;
        }
        
        .action-btn.green {
            background: #dcfce7;
            color: #166534;
        }
        
        .action-btn.green:hover {
            background: #bbf7d0;
        }
        
        .action-btn.purple {
            background: #e9d5ff;
            color: #7c3aed;
        }
        
        .action-btn.purple:hover {
            background: #ddd6fe;
        }
        
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #ffffff;
        }
        
        .welcome {
            text-align: center;
            padding: 32px 16px;
        }
        
        .welcome-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 16px;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            font-size: 32px;
        }
        
        .welcome-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
        }
        
        .welcome-text {
            color: #6b7280;
            font-size: 14px;
        }
        
        .message {
            margin-bottom: 16px;
            display: flex;
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
        .message-content {
            max-width: 85%;
        }
        
        .message-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .message.user .message-avatar {
            background: #2563eb;
            color: white;
            margin-left: auto;
        }
        
        .message.assistant .message-avatar {
            background: #10b981;
            color: white;
        }
        
        .message-bubble {
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        
        .message.user .message-bubble {
            background: #2563eb;
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message.assistant .message-bubble {
            background: #f3f4f6;
            color: #111827;
            border-bottom-left-radius: 4px;
        }
        
        .input-section {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: #ffffff;
        }
        
        .input-group {
            display: flex;
            gap: 8px;
        }
        
        .input {
            flex: 1;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        
        .input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .send-btn {
            padding: 12px 16px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .send-btn:hover {
            background: #1d4ed8;
        }
        
        .send-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        .setup-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .setup-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .setup-content {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        
        .setup-form {
            text-align: center;
            max-width: 320px;
        }
        
        .setup-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            background: #dbeafe;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            font-size: 24px;
        }
        
        .setup-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
        }
        
        .setup-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
        }
        
        .setup-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
            outline: none;
        }
        
        .setup-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .setup-btn {
            width: 100%;
            padding: 12px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .setup-btn:hover {
            background: #1d4ed8;
        }
        
        .setup-link {
            color: #2563eb;
            text-decoration: none;
            font-size: 12px;
            margin-top: 8px;
            display: inline-block;
        }
        
        .setup-link:hover {
            text-decoration: underline;
        }
        
        .loading {
            display: inline-flex;
            gap: 2px;
        }
        
        .loading span {
            width: 4px;
            height: 4px;
            background: currentColor;
            border-radius: 50%;
            animation: loading 1.4s infinite ease-in-out;
        }
        
        .loading span:nth-child(1) { animation-delay: -0.32s; }
        .loading span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes loading {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
        }
        
        .error {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin: 8px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="app">
        <div class="setup-container">
            <div class="setup-header">
                <div class="title">AI Sidebar Loading...</div>
            </div>
            <div class="setup-content">
                <div class="setup-form">
                    <div class="setup-icon">🚀</div>
                    <div class="setup-title">Initializing AI Sidebar</div>
                    <div class="setup-text">Please wait while we set up your AI assistant...</div>
                </div>
            </div>
        </div>
    </div>

    <script src="sidebar.js"></script>
</body>
</html>`;
    
    await fs.writeFile(path.join(extensionDir, 'index.html'), indexHtml, 'utf8');
    console.log('✅ Generated index.html');
    
    // 3. Generate sidebar.js (Main sidebar functionality)
    const sidebarJs = `console.log('🚀 AI Sidebar: Starting immediately...');

class AISidebar {
    constructor() {
        this.apiKey = localStorage.getItem('ai-sidebar-api-key') || '';
        this.messages = JSON.parse(localStorage.getItem('ai-sidebar-messages') || '[]');
        this.isLoading = false;
        console.log('✅ AISidebar: Data loaded');
        this.init();
    }
    
    init() {
        console.log('📱 AISidebar: Initializing UI...');
        this.render();
        this.attachEventListeners();
        console.log('✅ AISidebar: Ready!');
    }
    
    render() {
        const app = document.getElementById('app');
        if (!this.apiKey) {
            app.innerHTML = this.renderSetup();
        } else {
            app.innerHTML = this.renderSidebar();
        }
    }
    
    renderSetup() {
        return \`
            <div class="setup-container">
                <div class="setup-header">
                    <div class="title">AI Sidebar Setup</div>
                </div>
                <div class="setup-content">
                    <div class="setup-form">
                        <div class="setup-icon">🔑</div>
                        <div class="setup-title">OpenAI API Key Required</div>
                        <div class="setup-text">
                            Please enter your OpenAI API key to start using the AI assistant.
                        </div>
                        <input 
                            type="password" 
                            class="setup-input" 
                            id="api-key-input"
                            placeholder="sk-..."
                        >
                        <button class="setup-btn" id="save-api-key">
                            Save API Key
                        </button>
                        <a href="https://platform.openai.com/api-keys" target="_blank" class="setup-link">
                            Get your API key from OpenAI
                        </a>
                    </div>
                </div>
            </div>
        \`;
    }
    
    renderSidebar() {
        return \`
            <div class="container">
                <div class="header">
                    <div class="logo-section">
                        <div class="logo">🤖</div>
                        <div class="title">AI Sidebar</div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-danger" id="clear-chat" title="Clear chat">🗑️</button>
                        <button class="btn" id="settings-btn" title="Settings">⚙️</button>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <div class="actions-grid">
                        <button class="action-btn blue" id="summarize-page">Summarize Page</button>
                        <button class="action-btn green" id="explain-selected">Explain Selected</button>
                        <button class="action-btn purple" id="translate-text">Translate</button>
                    </div>
                </div>
                
                <div class="messages" id="messages">
                    \${this.renderMessages()}
                </div>
                
                <div class="input-section">
                    <div class="input-group">
                        <input 
                            type="text" 
                            class="input" 
                            id="message-input" 
                            placeholder="Ask me anything..."
                            \${this.isLoading ? 'disabled' : ''}
                        >
                        <button 
                            class="send-btn" 
                            id="send-btn"
                            \${this.isLoading ? 'disabled' : ''}
                        >
                            \${this.isLoading ? '<span class="loading"><span></span><span></span><span></span></span>' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        \`;
    }
    
    renderMessages() {
        if (this.messages.length === 0) {
            return \`
                <div class="welcome">
                    <div class="welcome-icon">💬</div>
                    <div class="welcome-title">Welcome to AI Sidebar</div>
                    <div class="welcome-text">Start a conversation or use quick actions to analyze the current page.</div>
                </div>
            \`;
        }
        
        return this.messages.map(msg => \`
            <div class="message \${msg.role}">
                <div class="message-content">
                    <div class="message-avatar">\${msg.role === 'user' ? 'U' : 'AI'}</div>
                    <div class="message-bubble">\${this.escapeHtml(msg.content)}</div>
                </div>
            </div>
        \`).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    attachEventListeners() {
        // API Key setup
        const saveBtn = document.getElementById('save-api-key');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveApiKey());
            
            const input = document.getElementById('api-key-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.saveApiKey();
                });
            }
        }
        
        // Chat functionality
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Clear chat
        const clearBtn = document.getElementById('clear-chat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }
        
        // Settings
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        // Quick actions
        const summarizeBtn = document.getElementById('summarize-page');
        if (summarizeBtn) {
            summarizeBtn.addEventListener('click', () => this.quickAction('summarize'));
        }
        
        const explainBtn = document.getElementById('explain-selected');
        if (explainBtn) {
            explainBtn.addEventListener('click', () => this.quickAction('explain'));
        }
        
        const translateBtn = document.getElementById('translate-text');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.quickAction('translate'));
        }
    }
    
    saveApiKey() {
        const input = document.getElementById('api-key-input');
        const key = input.value.trim();
        
        if (!key) {
            alert('Please enter a valid API key');
            return;
        }
        
        if (!key.startsWith('sk-')) {
            alert('API key should start with "sk-"');
            return;
        }
        
        localStorage.setItem('ai-sidebar-api-key', key);
        this.apiKey = key;
        this.render();
        this.attachEventListeners();
        console.log('✅ API key saved');
    }
    
    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;
        
        // Add user message
        this.addMessage({ role: 'user', content: message });
        input.value = '';
        
        // Send to AI
        await this.sendToAI(message);
    }
    
    addMessage(message) {
        this.messages.push({
            ...message,
            id: Date.now().toString(),
            timestamp: Date.now()
        });
        this.saveMessages();
        this.updateMessages();
    }
    
    updateMessages() {
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = this.renderMessages();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    saveMessages() {
        localStorage.setItem('ai-sidebar-messages', JSON.stringify(this.messages.slice(-50)));
    }
    
    async sendToAI(message) {
        this.isLoading = true;
        this.updateUI();
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${this.apiKey}\`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant integrated into a browser sidebar. Be concise and helpful.' },
                        ...this.messages.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                throw new Error(\`API Error: \${response.status} \${response.statusText}\`);
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                this.addMessage({
                    role: 'assistant',
                    content: data.choices[0].message.content
                });
            } else {
                throw new Error('Invalid response from OpenAI');
            }
            
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage({
                role: 'assistant',
                content: \`Sorry, I encountered an error: \${error.message}. Please check your API key and try again.\`
            });
        } finally {
            this.isLoading = false;
            this.updateUI();
        }
    }
    
    updateUI() {
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        
        if (sendBtn) {
            sendBtn.disabled = this.isLoading;
            sendBtn.innerHTML = this.isLoading ? '<span class="loading"><span></span><span></span><span></span></span>' : 'Send';
        }
        
        if (messageInput) {
            messageInput.disabled = this.isLoading;
        }
    }
    
    clearChat() {
        if (confirm('Clear all messages?')) {
            this.messages = [];
            this.saveMessages();
            this.updateMessages();
        }
    }
    
    showSettings() {
        if (confirm('Reset API key?')) {
            localStorage.removeItem('ai-sidebar-api-key');
            this.apiKey = '';
            this.render();
            this.attachEventListeners();
        }
    }
    
    quickAction(action) {
        switch (action) {
            case 'summarize':
                this.sendQuickMessage('Please summarize the current page');
                break;
            case 'explain':
                this.sendQuickMessage('Please explain the selected text');
                break;
            case 'translate':
                this.sendQuickMessage('Please translate the selected text to English');
                break;
        }
    }
    
    sendQuickMessage(message) {
        const input = document.getElementById('message-input');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }
}

// Initialize when DOM is ready
function initSidebar() {
    console.log('🎯 Creating AISidebar instance...');
    try {
        window.aiSidebar = new AISidebar();
        console.log('✅ AI Sidebar successfully initialized!');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        document.getElementById('app').innerHTML = \`<div class="error">Failed to initialize: \${error.message}</div>\`;
    }
}

// Initialize immediately or wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}`;
    
    await fs.writeFile(path.join(extensionDir, 'sidebar.js'), sidebarJs, 'utf8');
    console.log('✅ Generated sidebar.js');
    
    // 4. Copy background.js
    await fs.copy(
      path.join(srcDir, 'src/extension/background.js'),
      path.join(extensionDir, 'background.js')
    );
    console.log('✅ Copied background.js');
    
    // 5. Copy content.js
    await fs.copy(
      path.join(srcDir, 'src/extension/content.js'),
      path.join(extensionDir, 'content.js')
    );
    console.log('✅ Copied content.js');
    
    // 6. Generate content.css
    const contentCss = `/* Content script styles */
#ai-sidebar-float-btn {
  position: fixed;
  top: 50%;
  right: 20px;
  z-index: 10000;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#ai-sidebar-float-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

#ai-sidebar-selection-popup {
  position: absolute;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 10001;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  animation: fadeIn 0.2s ease-out;
}

#ai-sidebar-selection-popup button {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 2px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

#ai-sidebar-selection-popup button:hover {
  background: #e5e7eb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}`;
    
    await fs.writeFile(path.join(extensionDir, 'content.css'), contentCss, 'utf8');
    console.log('✅ Generated content.css');
    
    // 7. Create icons directory and generate placeholder icons
    const iconsDir = path.join(extensionDir, 'icons');
    await fs.ensureDir(iconsDir);
    
    // Generate simple PNG icons programmatically
    const iconSizes = [16, 32, 48, 128];
    for (const size of iconSizes) {
      const iconPath = path.join(iconsDir, `icon${size}.png`);
      // Create a simple colored square as base64 PNG
      const iconData = generateSimpleIcon(size);
      await fs.writeFile(iconPath, iconData, 'base64');
    }
    console.log('✅ Generated placeholder icons');
    
    console.log('🎉 Extension build completed successfully!');
    console.log(`📁 Extension files are in: ${extensionDir}`);
    console.log('');
    console.log('📋 Generated files:');
    console.log('✅ manifest.json - Extension configuration');
    console.log('✅ index.html - Sidebar page');
    console.log('✅ sidebar.js - Main sidebar functionality');
    console.log('✅ background.js - Extension background worker');
    console.log('✅ content.js - Content script for page interaction');
    console.log('✅ content.css - Content script styles');
    console.log('✅ icons/ - Extension icons');
    console.log('');
    console.log('📝 To install the extension:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log(`4. Select the folder: ${extensionDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function generateSimpleIcon(size) {
  // Simple base64 PNG for a blue square icon
  // This is a minimal PNG that Chrome will accept
  const iconBase64 = {
    16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVDiNpZM9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    32: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVFiFpZc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVGiF7Zc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVHic7Zc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj'
  };
  
  return iconBase64[size] || iconBase64[16];
}

if (require.main === module) {
  buildExtension();
}

module.exports = buildExtension;
