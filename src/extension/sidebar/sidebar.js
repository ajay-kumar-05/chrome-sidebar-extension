console.log('🚀 XavChatWidget Sidebar: Starting...');

class XavChatSidebar {
    constructor() {
        this.show = false;
        this.scriptLoaded = false;
        this.isInitialized = false;
        console.log('✅ XavChatSidebar: Initializing...');
        this.init();
    }

    init() {
        console.log('📱 XavChatSidebar: Loading script and UI...');
        this.render();
        this.loadXavChatWidget();
    }

    loadXavChatWidget() {
        // Check if script is already loaded
        if (window?.XavChatWidget?.BotPlugin) {
            console.log('XavChatWidget already available');
            this.scriptLoaded = true;
            this.updateUI();
            this.initChatbot(); // Auto-initialize on script load
            return;
        }

        // Create script element to load the bot plugin
        const script = document.createElement('script');
        script.src = './botPlugin.js'; // Relative path in extension
        script.async = true;
        script.onload = () => {
            console.log('botPlugin.js script loaded');
            
            // Wait for XavChatWidget to be available after script load
            const checkAvailability = () => {
                if (window?.XavChatWidget?.BotPlugin) {
                    console.log('XavChatWidget.BotPlugin is now available');
                    this.scriptLoaded = true;
                    this.updateUI();
                    this.initChatbot(); // Auto-initialize when available
                } else {
                    console.log('Waiting for XavChatWidget to initialize...');
                    setTimeout(checkAvailability, 100);
                }
            };
            
            // Start checking after a small delay
            setTimeout(checkAvailability, 100);
        };
        script.onerror = () => {
            console.error('Failed to load XavChatWidget plugin');
            this.showError();
        };
        
        document.head.appendChild(script);
    }

    initChatbot() {
        // Wait for XavChatWidget to be available
        const checkAndInit = () => {
            if (!window?.XavChatWidget?.BotPlugin) {
                console.log('XavChatWidget.BotPlugin not available yet, retrying...');
                setTimeout(checkAndInit, 200);
                return;
            }

            if (this.isInitialized) {
                console.log('Chatbot already initialized, just showing it');
                this.show = true;
                this.updateUI();
                if (window?.XavChatWidget?.BotPlugin) {
                    window.XavChatWidget.BotPlugin.toggleChat(true);
                }
                return;
            }

            try {
                console.log('Initializing XavChatWidget...');
                // Set show to true immediately to render the interface
                this.show = true;
                this.updateUI();
                
                window.XavChatWidget.BotPlugin.init("2FkwUtiHl1VzTRhwWmsC3CpiutY", {
                    language: 'en',
                    parentElementId: "chatbot-container",
                    extraData: {
                        toggler: false,
                        isCustomizedWidth: true,
                        persistChat: false,
                        isMoreText: true,
                        additionalData: {
                            isInAppWebView: true
                        }
                    }
                });
                
                // Toggle chat and update state immediately
                setTimeout(() => {
                    window.XavChatWidget.BotPlugin.toggleChat(true);
                    this.isInitialized = true;
                    console.log('Chatbot auto-initialized and opened successfully');
                    
                    // Force height adjustments after initialization
                    setTimeout(() => {
                        this.forceFullHeight();
                    }, 500);
                }, 300);
                
            } catch (error) {
                console.error('Error initializing chatbot:', error);
                this.showError();
            }
        };

        if (!this.scriptLoaded) {
            console.log('Script not loaded yet');
            return;
        }

        checkAndInit();
    }

    closePopup() {
        if (!window?.XavChatWidget?.BotPlugin) {
            console.error('XavChatWidget.BotPlugin not available for closing');
            this.show = false;
            this.updateUI();
            return;
        }
        
        try {
            window.XavChatWidget.BotPlugin.endChat();
            this.show = false;
            this.updateUI();
            console.log('Chatbot closed');
        } catch (error) {
            console.error('Error closing chatbot:', error);
            this.show = false;
            this.updateUI();
        }
    }

    forceFullHeight() {
        console.log('🔧 Starting forceFullHeight...');
        const container = document.getElementById('chatbot-container');
        if (container) {
            console.log('📦 Container found, applying styles...');
            
            // Force container height to match React component
            container.style.height = 'calc(90vh - 60px)';
            container.style.minHeight = 'calc(90vh - 60px)';
            container.style.maxHeight = 'calc(90vh - 60px)';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.flex = '1';
            
            // Force all possible iframe selectors
            this.forceIframeHeight(container);
            
            console.log('✅ Forced full height adjustments applied');
        } else {
            console.log('❌ Container not found!');
        }
    }

    forceIframeHeight(container) {
        // Find and adjust any iframes or nested containers
        const iframes = container.querySelectorAll('iframe');
        console.log(`📺 Found ${iframes.length} iframes`);
        
        iframes.forEach((iframe, index) => {
            const oldHeight = iframe.style.height;
            iframe.style.height = 'calc(90vh - 60px)';
            iframe.style.minHeight = 'calc(90vh - 60px)';
            iframe.style.width = '100%';
            iframe.style.border = 'none';
            iframe.style.display = 'block';
            
            // Also try setting attributes
            iframe.setAttribute('height', '100%');
            iframe.setAttribute('width', '100%');
            
            if (oldHeight !== 'calc(90vh - 60px)') {
                console.log(`🔧 Updated iframe ${index}: ${oldHeight} → calc(90vh - 60px)`);
            }
        });
        
        // Find and adjust any XavChatWidget containers with more aggressive selectors
        const selectors = [
            '[class*="xav"]',
            '[class*="chat"]', 
            '[id*="chat"]',
            '[class*="widget"]',
            '[class*="bot"]',
            'div[style*="height"]',
            'div > div', // Generic nested divs
            '.chatbot', 
            '#chatbot'
        ];
        
        selectors.forEach(selector => {
            const elements = container.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.height = 'calc(90vh - 60px)';
                element.style.minHeight = 'calc(90vh - 60px)';
                element.style.flex = '1';
                element.style.display = 'flex';
                element.style.flexDirection = 'column';
            });
        });
    }

    showError() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Failed to Load Chatbot</h3>
                    <p>Unable to load XavChatWidget. Please check your configuration.</p>
                    <button onclick="location.reload()" class="retry-btn">Retry</button>
                </div>
            </div>
        `;
    }

    updateUI() {
        if (!this.scriptLoaded) {
            return; // Initial render will show loading
        }
        
        const app = document.getElementById('app');
        app.innerHTML = this.renderChatbot();
        this.attachEventListeners();
    }

    render() {
        const app = document.getElementById('app');
        if (!this.scriptLoaded) {
            app.innerHTML = this.renderLoading();
        } else {
            app.innerHTML = this.renderChatbot();
            this.attachEventListeners();
        }
    }

    renderLoading() {
        return `
            <div class="container">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <h3>Loading FueliX Bot...</h3>
                    <p>Please wait while we initialize the chatbot.</p>
                </div>
            </div>
        `;
    }

    renderChatbot() {
        return `
            <div class="container">
                ${this.renderChatInterface()}
            </div>
        `;
    }

    renderChatIcon() {
        return `
            <div class="container-chat-icon" style="display: block; cursor: pointer;">
                <div class="chat-icon">
                    <img id="chat-trigger" src="chat_button.png" alt="Chat" style="cursor: pointer; width: 60px; height: 60px;" />
                </div>
            </div>
        `;
    }

    renderChatInterface() {
        return `
            <div style="width: 400px; height: 90vh; position: absolute; display: block;">                
                <div id="chatbot-container" style="width: 100%; height: 100%; position: static;"></div>
            </div>
        `;
    }

    attachEventListeners() {
        const chatTrigger = document.getElementById('chat-trigger');
        if (chatTrigger) {
            chatTrigger.addEventListener('click', () => {
                if (this.isInitialized) {
                    // If already initialized, just show the chat
                    this.show = true;
                    this.updateUI();
                    if (window?.XavChatWidget?.BotPlugin) {
                        window.XavChatWidget.BotPlugin.toggleChat(true);
                    }
                } else {
                    // Initialize for the first time
                    this.initChatbot();
                }
            });
        }

        const closeBtn = document.getElementById('close-chat');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePopup();
            });
        }
    }
}

// Initialize when DOM is ready
function initSidebar() {
    console.log('🎯 Creating XavChatSidebar instance...');
    try {
        window.sidebar = new XavChatSidebar();
        console.log('✅ XavChat Sidebar successfully initialized!');
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
