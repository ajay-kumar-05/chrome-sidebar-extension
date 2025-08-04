console.log('🚀 AI Sidebar: Starting immediately...');

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
        return `
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
                            placeholder="Secret Key"
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
                
                <div class="quick-actions">
                    <div class="actions-grid">
                        <button class="action-btn blue" id="summarize-page">Summarize Page</button>
                        <button class="action-btn green" id="explain-selected">Explain Selected</button>
                        <button class="action-btn purple" id="translate-text">Translate</button>
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
                    'Authorization': `Bearer ${this.apiKey}`
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
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
                content: `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`
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
        document.getElementById('app').innerHTML = `<div class="error">Failed to initialize: ${error.message}</div>`;
    }
}

// Initialize immediately or wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
