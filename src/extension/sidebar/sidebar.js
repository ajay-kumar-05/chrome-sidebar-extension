/**
 * NOTE: Do NOT edit files in extension-build/ directly.
 * This is the source version of the sidebar. Run `npm run build:extension` to regenerate.
 */
console.log('🚀 AI Sidebar: Starting (source)...');

class AISidebar {
    constructor() {
    this.apiKey = localStorage.getItem('ai-sidebar-api-key') || '';
    this.baseUrl = localStorage.getItem('ai-sidebar-base-url') || '';
    this.modelId = localStorage.getItem('ai-sidebar-model-id') || '';
        this.messages = JSON.parse(localStorage.getItem('ai-sidebar-messages') || '[]');
        this.isLoading = false;
        console.log('✅ AISidebar: Data loaded');
        this.init();
    }
    
    init() {
        console.log('📱 AISidebar: Initializing UI...');
        this.render();
        this.attachEventListeners();
        this.registerRuntimeListener();
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
        return `
            <div class="setup-container">
                <div class="setup-header">
                    <div class="title">AI Sidebar Setup</div>
                </div>
                <div class="setup-content">
                    <div class="setup-form">
                        <div class="setup-icon">🔑</div>
                        <div class="setup-title">API Configuration Required</div>
                        <div class="setup-text">
                            Enter your OpenAI-compatible API details. Your key is stored locally only.
                        </div>
                        <input 
                            type="password" 
                            class="setup-input" 
                            id="api-key-input"
                            placeholder="ak-... or sk-..."
                        >
                        <input 
                            type="text" 
                            class="setup-input" 
                            id="base-url-input"
                            placeholder="(e.g. https://base-url-of-api-provider.com)"
                            value="${this.baseUrl}"
                        >
                        <input 
                            type="text" 
                            class="setup-input" 
                            id="model-id-input"
                            placeholder="(e.g. claude-sonnet-4 or GPT-4.1)"
                            value="${this.modelId}"
                        >
                        <button class="setup-btn" id="save-api-key">
                            Save & Continue
                        </button>
                        <div style="margin-top:8px; font-size:11px; color:#6b7280; line-height:1.4;">
                            Uses an <strong>OpenAI-compatible</strong> Chat Completions API.<br>
                            Data is sent directly from your browser to the configured endpoint.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSidebar() {
        return `
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
                
                <div class="messages" id="messages">
                    ${this.renderMessages()}
                </div>
                
                <div class="input-section">
                    <div class="input-group">
                        <input 
                            type="text" 
                            class="input" 
                            id="message-input" 
                            placeholder="Ask me anything..."
                            ${this.isLoading ? 'disabled' : ''}
                        >
                        <button 
                            class="send-btn" 
                            id="send-btn"
                            ${this.isLoading ? 'disabled' : ''}
                        >
                            ${this.isLoading ? '<span class="loading"><span></span><span></span><span></span></span>' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMessages() {
        if (this.messages.length === 0) {
            return `
                <div class="welcome">
                    <div class="welcome-icon">💬</div>
                    <div class="welcome-title">Welcome to AI Sidebar</div>
                    <div class="welcome-text">Start a conversation or use quick actions to analyze the current page.</div>
                </div>
            `;
        }
        
        return this.messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-content">
                    <div class="message-avatar">${msg.role === 'user' ? 'U' : 'AI'}</div>
                    <div class="message-bubble">${this.escapeHtml(msg.content)}</div>
                </div>
            </div>
        `).join('');
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

    registerRuntimeListener() {
        if (this._runtimeRegistered) return;
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.target && msg.target !== 'sidebar') return; // only handle sidebar-targeted
            switch (msg.action) {
                case 'setSelectedText':
                    this.selectedText = msg.text || '';
                    break;
                case 'explain':
                case 'translate':
                case 'summarize':
                    this.handleExternalAction(msg.action, msg.text, msg.pageUrl);
                    break;
                case 'pageChanged':
                    this.currentPage = { url: msg.pageUrl, title: msg.title };
                    break;
            }
        });
        this._runtimeRegistered = true;
    }

    handleExternalAction(action, text, pageUrl) {
        // If text not passed but we stored one, use stored
        let selected = text || this.selectedText || '';
        let prompt;
        switch (action) {
            case 'explain':
                if (!selected) {
                    return this.fetchLatestSelection().then(sel => this.handleExternalAction(action, sel, pageUrl));
                }
                prompt = `Explain the following text clearly and concisely:\n\n${selected}`;
                break;
            case 'translate':
                if (!selected) {
                    return this.fetchLatestSelection().then(sel => this.handleExternalAction(action, sel, pageUrl));
                }
                prompt = `Translate the following text to English while preserving meaning and tone:\n\n${selected}`;
                break;
            case 'summarize':
                if (selected) {
                    prompt = `Summarize this text:\n\n${selected}`;
                } else {
                    prompt = `Summarize the current page briefly.${this.currentPage?.title ? ' Page title: ' + this.currentPage.title : ''}`;
                }
                break;
        }
        if (prompt) {
            this.addMessage({ role: 'user', content: prompt });
            this.sendToAI(prompt);
        }
    }

    fetchLatestSelection() {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({ action: 'requestSelectedText' }, (res) => {
                    const sel = res?.selectedText?.trim();
                    if (sel) {
                        this.selectedText = sel;
                        resolve(sel);
                    } else {
                        this.addMessage({ role: 'assistant', content: 'No text is selected. Highlight some page text first, then retry.' });
                        resolve('');
                    }
                });
            } catch (e) {
                console.error('Selection fetch error', e);
                this.addMessage({ role: 'assistant', content: 'Could not retrieve selection. Please highlight text and try again.' });
                resolve('');
            }
        });
    }
    
    saveApiKey() {
        const keyInput = document.getElementById('api-key-input');
        const baseUrlInput = document.getElementById('base-url-input');
        const modelIdInput = document.getElementById('model-id-input');
        const key = (keyInput?.value || '').trim();
        const baseUrl = (baseUrlInput?.value || '').trim().replace(/\/$/, '');
        const modelId = (modelIdInput?.value || '').trim();

        if (!key) { alert('Please enter an API key'); return; }
        if (!baseUrl) { alert('Please enter a Base URL'); return; }
        if (!modelId) { alert('Please enter a Model ID'); return; }
        if (!/^([a-z]{2,3}-)?[A-Za-z0-9-_]{10,}$/.test(key)) {
            if (!confirm('The API key format looks unusual. Save anyway?')) { return; }
        }

        localStorage.setItem('ai-sidebar-api-key', key);
        localStorage.setItem('ai-sidebar-base-url', baseUrl);
        localStorage.setItem('ai-sidebar-model-id', modelId);
        this.apiKey = key; this.baseUrl = baseUrl; this.modelId = modelId;
        this.render();
        this.attachEventListeners();
        console.log('✅ API configuration saved');
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
            const endpoint = `${this.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
            const model = this.modelId || 'claude-sonnet-4';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: 'You are a helpful AI assistant integrated into a browser sidebar. Be concise, helpful, and adapt to user quick actions like summarize, explain, translate.' },
                        ...this.messages.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });
            if (!response.ok) { throw new Error(`API Error: ${response.status} ${response.statusText}`); }
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const aiContent = data.choices[0].message?.content || data.choices[0].text || '[No content in response]';
                this.addMessage({ role: 'assistant', content: aiContent });
            } else { throw new Error('Invalid response from AI provider'); }
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage({ role: 'assistant', content: `Sorry, I encountered an error: ${error.message}. Please verify your API key, base URL, and model then try again.` });
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
        if (confirm('Reset API key (Base URL & Model will stay)?')) {
            localStorage.removeItem('ai-sidebar-api-key');
            this.apiKey = '';
            this.render();
            this.attachEventListeners();
        }
    }
    
    quickAction(action) {
        // Reuse external action handler logic
        this.handleExternalAction(action, this.selectedText, this.currentPage?.url);
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
        document.getElementById('app').innerHTML = `<div class="error">Failed to initialize: ${error.message}</div>`;
    }
}

// Initialize immediately or wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
