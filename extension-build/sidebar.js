console.log('🚀 AI Sidebar: Starting immediately...');

class AISidebar {
    constructor() {
        this.messages = JSON.parse(localStorage.getItem('ai-sidebar-messages') || '[]');
        this.isLoading = false;
        this.selectedFiles = [];
        console.log('✅ AISidebar: Data loaded');
        this.init();
    }

    init() {
        console.log('📱 AISidebar: Initializing UI...');
        this.render();
        this.attachEventListeners();
        this.setupMessageListener();
        console.log('✅ AISidebar: Ready!');
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.renderSidebar();
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
                    <div class="file-actions">
                    <button id="regionScreenshotBtn" class="screenshot-btn region-screenshot">
                    ✂️ Screenshot
                    </button>
                    <button class="file-btn" id="upload-btn" title="Upload File">📎</button>
                    <input type="file" id="file-input" style="display: none" multiple accept="image/*,.pdf,.doc,.docx,.txt">
                        
                </div>

                <div class="selected-files" id="selected-files"></div>

                <div class="input-group">
                        <textarea 
                            class="input" 
                            id="message-input" 
                            placeholder="Ask me anything..."
                            rows="1"
                            ${this.isLoading ? 'disabled' : ''}
                        ></textarea>
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
    `; }

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
                    <div class="message-bubble">
                        ${this.escapeHtml(msg.content)}
                        ${msg.files ? this.renderFiles(msg.files) : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderFiles(files) {
        if (!files || files.length === 0) return '';

        return `
            <div class="message-files">
                ${files.map(file => `
                    <div class="message-file">
                        ${file.isScreenshot ? '📸' : '📎'} ${file.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    attachEventListeners() {
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

            // Auto-resize textarea
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
            });
        }

        // Clear chat
        const clearBtn = document.getElementById('clear-chat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChat());
        }

        // File upload functionality
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        // Screenshot functionality
        const regionScreenshotBtn = document.getElementById('regionScreenshotBtn');
        if (regionScreenshotBtn) {
            regionScreenshotBtn.addEventListener('click', () => this.takeScreenshot('region'));
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


    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        console.log('Sending message: ', message);
        console.log('Selected files before sending:', this.selectedFiles);

        if (!message || this.isLoading) return;

        // Store files for the message before clearing
        const filesForMessage = this.selectedFiles.length > 0 ? [...this.selectedFiles] : undefined;

        // Add user message
        this.addMessage({
            role: 'user',
            content: message,
            files: filesForMessage
        });
        input.value = '';
        input.style.height = 'auto';

        // Send to your API BEFORE clearing files
        await this.sendToYourAPI(message);

        // Clear selected files AFTER sending to API
        this.selectedFiles = [];
        this.updateSelectedFiles();
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return;
            }

            this.selectedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                file: file
            });
        });

        this.updateSelectedFiles();
        event.target.value = ''; // Reset input
    }

    updateSelectedFiles() {
        const container = document.getElementById('selected-files');
        if (!container) return;

        if (this.selectedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="selected-file">
                <span class="file-name">${file.name}</span>
                <button class="remove-file" data-index="${index}">×</button>
            </div>
        `).join('');

        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFile(index);
            });
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateSelectedFiles();
    }

    takeScreenshot(type = 'full') {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            const action = type === 'region' ? 'takeRegionScreenshot' : 'takeScreenshot';
            chrome.runtime.sendMessage({ action: action, type: type }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Screenshot error:', chrome.runtime.lastError);
                    alert(`Failed to take screenshot: ${chrome.runtime.lastError.message}`);
                    return;
                }

                if (response && response.success) {
                    if (response.dataUrl) {
                        // Handle both full screenshots and fallback region screenshots
                        const screenshotName = response.type === 'full' && type === 'region'
                            ? `fallback_screenshot_${Date.now()}.png`
                            : `screenshot_${Date.now()}.png`;

                        this.selectedFiles.push({
                            name: screenshotName,
                            type: 'image/png',
                            dataUrl: response.dataUrl,
                            isScreenshot: true
                        });
                        this.updateSelectedFiles();

                        if (response.message) {
                            console.log(response.message);
                            // Optionally show a brief notification to user
                            if (response.message.includes('not available')) {
                                this.showBriefNotification('Region selection not available on this page. Full screenshot captured instead.');
                            }
                        } else {
                            console.log('Screenshot captured successfully');
                        }
                    } else if (type === 'region' && !response.dataUrl) {
                        // For region screenshots, the result comes via screenshotCaptured message
                        console.log('Region selector activated');
                    }
                } else {
                    const errorMsg = response?.error || 'Unknown error occurred';
                    console.error('Failed to take screenshot:', errorMsg);
                    alert(`Failed to take screenshot: ${errorMsg}`);
                }
            });
        } else {
            alert('Screenshot functionality is not available in this context.');
        }
    }

    setupMessageListener() {
        // Listen for text selection from content script and screenshot results
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'SELECTED_TEXT') {
                    const input = document.getElementById('message-input');
                    if (input && message.text) {
                        // Add selected text to input
                        const existingText = input.value.trim();
                        const newText = existingText ? `${existingText}\n\n"${message.text}"` : `"${message.text}"`;

                        input.value = newText;
                        input.focus();

                        // Auto-resize
                        input.style.height = 'auto';
                        input.style.height = Math.min(input.scrollHeight, 120) + 'px';

                        // Add visual feedback
                        input.style.borderColor = '#10b981';
                        input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';

                        // Remove visual feedback after 2 seconds
                        setTimeout(() => {
                            input.style.borderColor = '';
                            input.style.boxShadow = '';
                        }, 2000);

                        console.log('✅ Selected text added to input:', message.text.substring(0, 50) + '...');
                    }
                } else if (message.action === 'screenshotCaptured') {
                    // Handle region screenshot result
                    if (message.screenshot && message.type === 'region') {
                        this.selectedFiles.push({
                            name: `region_screenshot_${Date.now()}.png`,
                            type: 'image/png',
                            dataUrl: message.screenshot,
                            isScreenshot: true
                        });
                        this.updateSelectedFiles();
                        console.log('Region screenshot captured successfully');
                    }
                } else if (message.action === 'screenshotError') {
                    // Handle screenshot errors
                    console.error('Screenshot error received:', message.error);
                    alert(`Screenshot error: ${message.error}`);
                }
            });
        }
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


    async sendToYourAPI(message) {
        this.isLoading = true;
        this.updateUI();

        try {
            console.log('🔍 Selected files at API call time:', this.selectedFiles);

            // Prepare the payload for your API
            const payload = {
                message: message,
                conversation_history: this.messages.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                timestamp: Date.now()
            };

            // Add files if any are selected
            if (this.selectedFiles.length > 0) {
                console.log('📎 Preparing files for API...');
                payload.files = await this.prepareFiles();
                console.log('📎 Prepared files:', payload.files.length, 'files');
            } else {
                console.log('📎 No files selected for this message');
            }

            let API_ENDPOINT = 'https://your-domain.com/api/chat';

            if (API_ENDPOINT === 'YOUR_API_ENDPOINT_HERE') {
                throw new Error('Please configure your API endpoint in sidebar.js');
            }

            console.log('🌐 Making API request to:', API_ENDPOINT);
            console.log('📤 Payload:', payload);

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any authentication headers you need
                    // 'Authorization': 'Bearer YOUR_TOKEN',
                    // 'X-API-Key': 'YOUR_API_KEY'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Adjust this based on your API response format
            if (data.response || data.message || data.content) {
                this.addMessage({
                    role: 'assistant',
                    content: data.response || data.message || data.content
                });
            } else {
                throw new Error('Invalid response format from API');
            }

        } catch (error) {
            console.error('API Error:', error);
            this.addMessage({
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Please try again later.`
            });
        } finally {
            this.isLoading = false;
            this.updateUI();
        }
    }

    async prepareFiles() {
        const fileData = [];
        console.log('🔄 Preparing files:', this.selectedFiles);

        for (const file of this.selectedFiles) {
            console.log('📁 Processing file:', file.name, 'isScreenshot:', file.isScreenshot);

            if (file.isScreenshot) {
                // Screenshot data is already available
                fileData.push({
                    name: file.name,
                    type: file.type,
                    data: file.dataUrl,
                    isScreenshot: true
                });
                console.log('📸 Added screenshot:', file.name);
            } else if (file.file) {
                // Convert file to base64
                try {
                    const base64 = await this.fileToBase64(file.file);
                    fileData.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64
                    });
                    console.log('📎 Added file:', file.name, 'size:', file.size);
                } catch (error) {
                    console.error('Error converting file:', error);
                }
            }
        }

        console.log('✅ Final prepared files:', fileData.length, 'files');
        return fileData;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
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
            this.selectedFiles = [];
            this.saveMessages();
            this.updateMessages();
            this.updateSelectedFiles();
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
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            this.sendMessage();
        }
    }

    showBriefNotification(message) {
        // Create a brief notification overlay
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => notification.style.opacity = '1', 100);

        // Fade out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
function initSidebar() {
    console.log('🎯 Creating AISidebar instance...');
    try {
        window.sidebar = new AISidebar();
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
