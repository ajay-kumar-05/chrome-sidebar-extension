/**
 * NOTE: Do NOT edit files in extension-build/ directly.
 * This is the source version of the sidebar. Run `npm run build:extension` to regenerate.
 */
console.log('🚀 AI Sidebar: Starting (source)...');

/* ============================================================================
   Inline SVG icons (no emoji — crisp on every DPI / theme)
   ========================================================================== */
const ICON = {
    bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2M16 7l3 3M14 9l3 3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg>',
    lang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7M9 3v2c0 4-2 7-5 9M5 9c0 2.5 2.5 4.5 6 4.5M12 20l4-9 4 9M13.5 17h5"/></svg>',
};

/* ============================================================================
   i18n
   ========================================================================== */
const LANGS = [
    { code: 'en', label: 'English', flag: '🇬🇧', name: 'English' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', name: 'Hindi' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'French' },
    { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Spanish' },
];

const I18N = {
    en: {
        appName: 'AI Sidebar', tagline: 'Your browsing copilot', online: 'Online',
        welcomeTitle: 'How can I help?', welcomeText: 'Ask anything, or use a quick action to work with the current page.',
        sugSummarizeT: 'Summarize this page', sugSummarizeD: 'Get the key points instantly',
        sugExplainT: 'Explain selection', sugExplainD: 'Highlight text, then ask',
        sugTranslateT: 'Translate selection', sugTranslateD: 'Into your language',
        placeholder: 'Ask me anything…', hint: 'Enter to send · Shift+Enter for new line',
        menuTheme: 'Appearance', menuLanguage: 'Language', menuSettings: 'Settings', menuClear: 'Clear conversation',
        themeLight: 'Light', themeDark: 'Dark',
        settings: 'Settings', yourName: 'Your name', namePh: 'e.g. Ajay',
        apiKey: 'API key', baseUrl: 'Base URL', model: 'Model ID', save: 'Save changes', resetKey: 'Reset API key',
        setupTitle: 'Connect your AI', setupText: 'Enter your OpenAI-compatible API details. Everything is stored locally in your browser.',
        setupSave: 'Save & continue',
        setupNote: 'Uses an OpenAI-compatible Chat Completions API. Requests go directly from your browser to the endpoint you set.',
        you: 'You', assistant: 'Assistant', thinking: 'Thinking…', send: 'Send',
        clearConfirm: 'Clear all messages?', resetConfirm: 'Reset API key? Base URL & model are kept.',
        getKey: 'Get an API key',
        noPage: "I couldn't read this page. It may be a protected page (like chrome:// or the extensions page). Open a normal website and try again.",
        ctxHeading: 'Refresh to connect', ctxMessage: 'This page was open before AI Sidebar loaded, so I can’t read it yet. Refresh the page to enable AI here.', ctxRefresh: 'Refresh page',
    },
    hi: {
        appName: 'एआई साइडबार', tagline: 'आपका ब्राउज़िंग सहायक', online: 'ऑनलाइन',
        welcomeTitle: 'मैं कैसे मदद करूँ?', welcomeText: 'कुछ भी पूछें, या मौजूदा पेज पर त्वरित क्रिया का उपयोग करें।',
        sugSummarizeT: 'इस पेज का सारांश', sugSummarizeD: 'तुरंत मुख्य बिंदु पाएं',
        sugExplainT: 'चयन समझाएँ', sugExplainD: 'टेक्स्ट चुनें, फिर पूछें',
        sugTranslateT: 'चयन का अनुवाद', sugTranslateD: 'आपकी भाषा में',
        placeholder: 'मुझसे कुछ भी पूछें…', hint: 'भेजने के लिए Enter · नई लाइन के लिए Shift+Enter',
        menuTheme: 'दिखावट', menuLanguage: 'भाषा', menuSettings: 'सेटिंग्स', menuClear: 'बातचीत साफ़ करें',
        themeLight: 'लाइट', themeDark: 'डार्क',
        settings: 'सेटिंग्स', yourName: 'आपका नाम', namePh: 'जैसे अजय',
        apiKey: 'एपीआई कुंजी', baseUrl: 'बेस यूआरएल', model: 'मॉडल आईडी', save: 'सहेजें', resetKey: 'एपीआई कुंजी रीसेट करें',
        setupTitle: 'अपना एआई कनेक्ट करें', setupText: 'अपनी OpenAI-संगत एपीआई जानकारी दर्ज करें। सब कुछ आपके ब्राउज़र में स्थानीय रूप से सहेजा जाता है।',
        setupSave: 'सहेजें और जारी रखें',
        setupNote: 'OpenAI-संगत Chat Completions API का उपयोग करता है। अनुरोध सीधे आपके ब्राउज़र से एंडपॉइंट पर जाते हैं।',
        you: 'आप', assistant: 'सहायक', thinking: 'सोच रहा हूँ…', send: 'भेजें',
        clearConfirm: 'सभी संदेश साफ़ करें?', resetConfirm: 'एपीआई कुंजी रीसेट करें? बेस यूआरएल और मॉडल रहेंगे।',
        getKey: 'एपीआई कुंजी प्राप्त करें',
        noPage: 'मैं इस पेज को नहीं पढ़ सका। यह एक सुरक्षित पेज हो सकता है (जैसे chrome:// या एक्सटेंशन पेज)। कोई सामान्य वेबसाइट खोलें और पुनः प्रयास करें।',
        ctxHeading: 'कनेक्ट करने के लिए रिफ़्रेश करें', ctxMessage: 'यह पेज AI Sidebar लोड होने से पहले खुला था, इसलिए मैं इसे अभी पढ़ नहीं सकता। यहाँ AI सक्षम करने के लिए पेज रिफ़्रेश करें।', ctxRefresh: 'पेज रिफ़्रेश करें',
    },
    fr: {
        appName: 'Barre IA', tagline: 'Votre copilote de navigation', online: 'En ligne',
        welcomeTitle: 'Comment puis-je aider ?', welcomeText: 'Posez une question ou utilisez une action rapide sur la page actuelle.',
        sugSummarizeT: 'Résumer cette page', sugSummarizeD: 'Les points clés en un instant',
        sugExplainT: 'Expliquer la sélection', sugExplainD: 'Sélectionnez du texte, puis demandez',
        sugTranslateT: 'Traduire la sélection', sugTranslateD: 'Dans votre langue',
        placeholder: 'Demandez-moi n’importe quoi…', hint: 'Entrée pour envoyer · Maj+Entrée nouvelle ligne',
        menuTheme: 'Apparence', menuLanguage: 'Langue', menuSettings: 'Paramètres', menuClear: 'Effacer la conversation',
        themeLight: 'Clair', themeDark: 'Sombre',
        settings: 'Paramètres', yourName: 'Votre nom', namePh: 'ex. Ajay',
        apiKey: 'Clé API', baseUrl: 'URL de base', model: 'ID du modèle', save: 'Enregistrer', resetKey: 'Réinitialiser la clé API',
        setupTitle: 'Connectez votre IA', setupText: 'Saisissez vos identifiants API compatibles OpenAI. Tout est stocké localement dans votre navigateur.',
        setupSave: 'Enregistrer et continuer',
        setupNote: 'Utilise une API Chat Completions compatible OpenAI. Les requêtes vont directement de votre navigateur au point de terminaison.',
        you: 'Vous', assistant: 'Assistant', thinking: 'Réflexion…', send: 'Envoyer',
        clearConfirm: 'Effacer tous les messages ?', resetConfirm: 'Réinitialiser la clé API ? L’URL et le modèle sont conservés.',
        getKey: 'Obtenir une clé API',
        noPage: "Je n'ai pas pu lire cette page. C'est peut-être une page protégée (comme chrome:// ou la page des extensions). Ouvrez un site web normal et réessayez.",
        ctxHeading: 'Actualisez pour connecter', ctxMessage: 'Cette page était ouverte avant le chargement d’AI Sidebar, je ne peux donc pas la lire. Actualisez la page pour activer l’IA ici.', ctxRefresh: 'Actualiser la page',
    },
    es: {
        appName: 'Barra IA', tagline: 'Tu copiloto de navegación', online: 'En línea',
        welcomeTitle: '¿Cómo puedo ayudar?', welcomeText: 'Pregunta lo que sea o usa una acción rápida en la página actual.',
        sugSummarizeT: 'Resumir esta página', sugSummarizeD: 'Los puntos clave al instante',
        sugExplainT: 'Explicar selección', sugExplainD: 'Selecciona texto y pregunta',
        sugTranslateT: 'Traducir selección', sugTranslateD: 'A tu idioma',
        placeholder: 'Pregúntame lo que sea…', hint: 'Enter para enviar · Shift+Enter nueva línea',
        menuTheme: 'Apariencia', menuLanguage: 'Idioma', menuSettings: 'Ajustes', menuClear: 'Borrar conversación',
        themeLight: 'Claro', themeDark: 'Oscuro',
        settings: 'Ajustes', yourName: 'Tu nombre', namePh: 'p. ej. Ajay',
        apiKey: 'Clave API', baseUrl: 'URL base', model: 'ID del modelo', save: 'Guardar cambios', resetKey: 'Restablecer clave API',
        setupTitle: 'Conecta tu IA', setupText: 'Introduce tus datos de API compatibles con OpenAI. Todo se guarda localmente en tu navegador.',
        setupSave: 'Guardar y continuar',
        setupNote: 'Usa una API de Chat Completions compatible con OpenAI. Las solicitudes van directamente de tu navegador al endpoint.',
        you: 'Tú', assistant: 'Asistente', thinking: 'Pensando…', send: 'Enviar',
        clearConfirm: '¿Borrar todos los mensajes?', resetConfirm: '¿Restablecer la clave API? Se conservan URL y modelo.',
        getKey: 'Obtener una clave API',
        noPage: 'No pude leer esta página. Puede ser una página protegida (como chrome:// o la página de extensiones). Abre un sitio web normal e inténtalo de nuevo.',
        ctxHeading: 'Actualiza para conectar', ctxMessage: 'Esta página estaba abierta antes de que se cargara AI Sidebar, así que aún no puedo leerla. Actualiza la página para habilitar la IA aquí.', ctxRefresh: 'Actualizar página',
    },
};

class AISidebar {
    constructor() {
        this.apiKey = localStorage.getItem('ai-sidebar-api-key') || '';
        this.baseUrl = localStorage.getItem('ai-sidebar-base-url') || '';
        this.modelId = localStorage.getItem('ai-sidebar-model-id') || '';
        this.userName = localStorage.getItem('ai-sidebar-name') || '';
        this.theme = localStorage.getItem('ai-sidebar-theme') || 'light';
        this.lang = localStorage.getItem('ai-sidebar-lang') || 'en';
        this.messages = JSON.parse(localStorage.getItem('ai-sidebar-messages') || '[]');
        this.isLoading = false;
        this.applyTheme();
        this.syncConfig();
        console.log('✅ AISidebar: Data loaded');
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
        this.registerRuntimeListener();
        // If configured, make sure we actually have a live connection to the
        // active tab (content script). If not, prompt the user to refresh it.
        if (this.apiKey) this.ensureActiveTabContext();
        console.log('✅ AISidebar: Ready!');
    }

    /* ---- helpers ---- */
    t(key) { return (I18N[this.lang] && I18N[this.lang][key]) || I18N.en[key] || key; }

    applyTheme() { document.documentElement.setAttribute('data-theme', this.theme); }

    /* Mirror "configured" state to chrome.storage so the page content script
       (which can't read this page's localStorage) knows whether to show the
       in-page selection popup. */
    syncConfig() {
        try {
            chrome.storage?.local?.set({ 'ai-sidebar-configured': !!this.apiKey });
        } catch (e) { /* storage unavailable outside extension */ }
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('ai-sidebar-theme', theme);
        this.applyTheme();
        this.refreshMenu();
    }

    setLang(code) {
        this.lang = code;
        localStorage.setItem('ai-sidebar-lang', code);
        this.render();
        this.attachEventListeners();
        this.refreshMenu();
    }

    langName() { return (LANGS.find(l => l.code === this.lang) || LANGS[0]).name; }

    initials(name) {
        const n = (name || '').trim();
        if (!n) return 'U';
        const parts = n.split(/\s+/).filter(Boolean);
        const txt = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
        return txt.toUpperCase();
    }

    displayName() { return (this.userName || '').trim() || this.t('you'); }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatContent(text) {
        let s = this.escapeHtml(text);
        s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        return s;
    }

    timeLabel(ts) {
        try {
            return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    }

    /* ============================================================
       Render
       ============================================================ */
    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.apiKey ? this.renderSidebar() : this.renderSetup();
    }

    renderSetup() {
        return `
            <div class="setup-container">
                <div class="setup-content">
                    <div class="setup-form">
                        <div class="setup-icon">${ICON.key}</div>
                        <div class="setup-title">${this.t('setupTitle')}</div>
                        <div class="setup-text">${this.t('setupText')}</div>

                        <div class="field">
                            <label class="field-label">${this.t('apiKey')}</label>
                            <input type="password" class="setup-input" id="api-key-input" placeholder="sk-… / ak-…" autocomplete="off">
                        </div>
                        <div class="field">
                            <label class="field-label">${this.t('baseUrl')}</label>
                            <input type="text" class="setup-input" id="base-url-input" placeholder="https://api.provider.com" value="${this.escapeHtml(this.baseUrl)}">
                        </div>
                        <div class="field">
                            <label class="field-label">${this.t('model')}</label>
                            <input type="text" class="setup-input" id="model-id-input" placeholder="e.g. claude-sonnet-4 or gpt-4.1" value="${this.escapeHtml(this.modelId)}">
                        </div>
                        <div class="field">
                            <label class="field-label">${this.t('yourName')}</label>
                            <input type="text" class="setup-input" id="name-input" placeholder="${this.t('namePh')}" value="${this.escapeHtml(this.userName)}">
                        </div>

                        <button class="setup-btn" id="save-api-key">${this.t('setupSave')}</button>
                        <div class="setup-note">${this.t('setupNote')}</div>
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
                        <div class="logo">${ICON.bot}</div>
                        <div class="title-wrap">
                            <div class="title">${this.t('appName')}</div>
                            <div class="subtitle"><span class="dot"></span>${this.t('online')}</div>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="avatar-btn" id="user-menu-btn" title="${this.escapeHtml(this.displayName())}">
                            <span class="avatar">${this.escapeHtml(this.initials(this.userName))}</span>
                        </button>
                    </div>
                </div>

                <div class="messages" id="messages">
                    ${this.renderMessages()}
                </div>

                <div class="input-section">
                    <div class="input-group">
                        <textarea class="input" id="message-input" rows="1" placeholder="${this.t('placeholder')}" ${this.isLoading ? 'disabled' : ''}></textarea>
                        <button class="send-btn" id="send-btn" ${this.isLoading ? 'disabled' : ''} title="${this.t('send')}">${ICON.send}</button>
                    </div>
                    <div class="input-hint">${this.t('hint')}</div>
                </div>
            </div>
        `;
    }

    renderMessages() {
        let html = '';
        if (this.messages.length === 0 && !this.isLoading) {
            const sug = (icon, t, d, action) => `
                <button class="suggestion" data-action="${action}">
                    <span class="s-icon">${icon}</span>
                    <span>
                        <span style="display:block;font-weight:600">${t}</span>
                        <span style="display:block;font-size:11.5px;color:var(--text-muted)">${d}</span>
                    </span>
                    <span class="s-arrow">${ICON.chevron}</span>
                </button>`;
            return `
                <div class="welcome">
                    <div class="welcome-icon">${ICON.sparkle}</div>
                    <div class="welcome-title">${this.t('welcomeTitle')}</div>
                    <div class="welcome-text">${this.t('welcomeText')}</div>
                    <div class="suggestions">
                        ${sug(ICON.doc, this.t('sugSummarizeT'), this.t('sugSummarizeD'), 'summarize')}
                        ${sug(ICON.sparkle, this.t('sugExplainT'), this.t('sugExplainD'), 'explain')}
                        ${sug(ICON.globe, this.t('sugTranslateT'), this.t('sugTranslateD'), 'translate')}
                    </div>
                </div>
            `;
        }

        html += this.messages.map(msg => {
            const isUser = msg.role === 'user';
            const avatar = isUser ? this.escapeHtml(this.initials(this.userName)) : ICON.bot;
            const who = isUser ? this.displayName() : this.t('assistant');
            return `
                <div class="message ${msg.role}">
                    <div class="message-avatar">${avatar}</div>
                    <div class="message-col">
                        <div class="message-meta">${this.escapeHtml(who)} · ${this.timeLabel(msg.timestamp)}</div>
                        <div class="message-bubble">${this.formatContent(msg.content)}</div>
                    </div>
                </div>
            `;
        }).join('');

        if (this.isLoading) html += this.renderTyping();
        return html;
    }

    renderTyping() {
        return `
            <div class="message assistant" id="typing-row">
                <div class="message-avatar">${ICON.bot}</div>
                <div class="message-col">
                    <div class="message-meta">${this.t('assistant')} · ${this.t('thinking')}</div>
                    <div class="message-bubble typing-bubble"><span></span><span></span><span></span></div>
                </div>
            </div>
        `;
    }

    /* ============================================================
       User menu (popover)
       ============================================================ */
    refreshMenu() {
        if (document.getElementById('user-menu')) { this.closeMenu(); this.openMenu(); }
    }

    openMenu() {
        this.closeMenu();
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menu-overlay';
        overlay.innerHTML = `
            <div class="menu" id="user-menu">
                <div class="menu-profile">
                    <span class="avatar">${this.escapeHtml(this.initials(this.userName))}</span>
                    <div class="info">
                        <div class="name">${this.escapeHtml(this.displayName())}</div>
                        <div class="meta">${this.escapeHtml(this.modelId || 'AI Assistant')}</div>
                    </div>
                </div>

                <div class="menu-section">
                    <div class="menu-label">${this.t('menuTheme')}</div>
                    <div class="theme-toggle">
                        <button class="theme-opt ${this.theme === 'light' ? 'active' : ''}" data-theme="light">${ICON.sun}${this.t('themeLight')}</button>
                        <button class="theme-opt ${this.theme === 'dark' ? 'active' : ''}" data-theme="dark">${ICON.moon}${this.t('themeDark')}</button>
                    </div>
                </div>

                <div class="menu-section">
                    <div class="menu-label">${this.t('menuLanguage')}</div>
                    <div class="lang-grid">
                        ${LANGS.map(l => `
                            <button class="lang-opt ${this.lang === l.code ? 'active' : ''}" data-lang="${l.code}">
                                <span class="flag">${l.flag}</span><span>${l.label}</span>
                            </button>`).join('')}
                    </div>
                </div>

                <div class="menu-section">
                    <button class="menu-item" data-act="settings">${ICON.settings}<span class="menu-item-text">${this.t('menuSettings')}</span><span class="chev">${ICON.chevron}</span></button>
                    <button class="menu-item danger" data-act="clear">${ICON.trash}<span class="menu-item-text">${this.t('menuClear')}</span></button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeMenu(); });
        overlay.querySelectorAll('.theme-opt').forEach(b =>
            b.addEventListener('click', () => this.setTheme(b.dataset.theme)));
        overlay.querySelectorAll('.lang-opt').forEach(b =>
            b.addEventListener('click', () => this.setLang(b.dataset.lang)));
        overlay.querySelector('[data-act="settings"]').addEventListener('click', () => { this.closeMenu(); this.openSettings(); });
        overlay.querySelector('[data-act="clear"]').addEventListener('click', () => { this.closeMenu(); this.clearChat(); });
    }

    closeMenu() {
        const o = document.getElementById('menu-overlay');
        if (o) o.remove();
    }

    /* ============================================================
       Settings modal
       ============================================================ */
    openSettings() {
        this.closeSettings();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'settings-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">${this.t('settings')}</div>
                    <button class="btn" id="settings-close">${ICON.close}</button>
                </div>
                <div class="modal-body">
                    <div class="field">
                        <label class="field-label">${this.t('yourName')}</label>
                        <input type="text" class="setup-input" id="set-name" placeholder="${this.t('namePh')}" value="${this.escapeHtml(this.userName)}">
                    </div>
                    <div class="field">
                        <label class="field-label">${this.t('apiKey')}</label>
                        <input type="password" class="setup-input" id="set-key" placeholder="••••••••" value="${this.escapeHtml(this.apiKey)}" autocomplete="off">
                    </div>
                    <div class="field">
                        <label class="field-label">${this.t('baseUrl')}</label>
                        <input type="text" class="setup-input" id="set-url" placeholder="https://api.provider.com" value="${this.escapeHtml(this.baseUrl)}">
                    </div>
                    <div class="field">
                        <label class="field-label">${this.t('model')}</label>
                        <input type="text" class="setup-input" id="set-model" placeholder="e.g. claude-sonnet-4" value="${this.escapeHtml(this.modelId)}">
                    </div>
                    <button class="setup-btn" id="settings-save">${this.t('save')}</button>
                    <button class="setup-btn ghost" id="settings-reset">${this.t('resetKey')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.closeSettings(); });
        overlay.querySelector('#settings-close').addEventListener('click', () => this.closeSettings());
        overlay.querySelector('#settings-save').addEventListener('click', () => this.saveSettings());
        overlay.querySelector('#settings-reset').addEventListener('click', () => {
            if (confirm(this.t('resetConfirm'))) {
                localStorage.removeItem('ai-sidebar-api-key');
                this.apiKey = '';
                this.syncConfig();
                this.closeSettings();
                this.render();
                this.attachEventListeners();
            }
        });
    }

    closeSettings() {
        const o = document.getElementById('settings-overlay');
        if (o) o.remove();
    }

    saveSettings() {
        const name = (document.getElementById('set-name')?.value || '').trim();
        const key = (document.getElementById('set-key')?.value || '').trim();
        const url = (document.getElementById('set-url')?.value || '').trim().replace(/\/$/, '');
        const model = (document.getElementById('set-model')?.value || '').trim();

        if (!key) { alert(this.t('apiKey') + ' ?'); return; }
        if (!url) { alert(this.t('baseUrl') + ' ?'); return; }
        if (!model) { alert(this.t('model') + ' ?'); return; }

        this.userName = name; this.apiKey = key; this.baseUrl = url; this.modelId = model;
        localStorage.setItem('ai-sidebar-name', name);
        localStorage.setItem('ai-sidebar-api-key', key);
        localStorage.setItem('ai-sidebar-base-url', url);
        localStorage.setItem('ai-sidebar-model-id', model);
        this.syncConfig();
        this.closeSettings();
        this.render();
        this.attachEventListeners();
        console.log('✅ Settings saved');
    }

    /* ============================================================
       Events
       ============================================================ */
    attachEventListeners() {
        const saveBtn = document.getElementById('save-api-key');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveApiKey());
            document.querySelectorAll('.setup-input').forEach(inp =>
                inp.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.saveApiKey(); }));
        }

        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());

        const input = document.getElementById('message-input');
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
            });
            input.addEventListener('input', () => this.autoGrow(input));
            input.focus();
        }

        const menuBtn = document.getElementById('user-menu-btn');
        if (menuBtn) menuBtn.addEventListener('click', () => this.openMenu());

        document.querySelectorAll('.suggestion').forEach(s =>
            s.addEventListener('click', () => this.quickAction(s.dataset.action)));
    }

    autoGrow(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }

    /* ============================================================
       First-run save
       ============================================================ */
    saveApiKey() {
        const key = (document.getElementById('api-key-input')?.value || '').trim();
        const baseUrl = (document.getElementById('base-url-input')?.value || '').trim().replace(/\/$/, '');
        const modelId = (document.getElementById('model-id-input')?.value || '').trim();
        const name = (document.getElementById('name-input')?.value || '').trim();

        if (!key) { alert('Please enter an API key'); return; }
        if (!baseUrl) { alert('Please enter a Base URL'); return; }
        if (!modelId) { alert('Please enter a Model ID'); return; }
        if (!/^([a-z]{2,3}-)?[A-Za-z0-9-_]{10,}$/.test(key)) {
            if (!confirm('The API key format looks unusual. Save anyway?')) return;
        }

        localStorage.setItem('ai-sidebar-api-key', key);
        localStorage.setItem('ai-sidebar-base-url', baseUrl);
        localStorage.setItem('ai-sidebar-model-id', modelId);
        localStorage.setItem('ai-sidebar-name', name);
        this.apiKey = key; this.baseUrl = baseUrl; this.modelId = modelId; this.userName = name;
        this.syncConfig();
        this.render();
        this.attachEventListeners();
        console.log('✅ API configuration saved');
    }

    /* ============================================================
       Chat
       ============================================================ */
    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = (input?.value || '').trim();
        if (!message || this.isLoading) return;
        this.addMessage({ role: 'user', content: message });
        input.value = '';
        this.autoGrow(input);
        await this.sendToAI(message);
    }

    addMessage(message) {
        this.messages.push({ ...message, id: Date.now().toString(), timestamp: Date.now() });
        this.saveMessages();
        this.updateMessages();
    }

    updateMessages() {
        const c = document.getElementById('messages');
        if (c) { c.innerHTML = this.renderMessages(); this.scrollToBottom(); this.attachSuggestionEvents(); }
    }

    attachSuggestionEvents() {
        document.querySelectorAll('.suggestion').forEach(s =>
            s.addEventListener('click', () => this.quickAction(s.dataset.action)));
    }

    scrollToBottom() {
        const c = document.getElementById('messages');
        if (c) c.scrollTop = c.scrollHeight;
    }

    saveMessages() {
        localStorage.setItem('ai-sidebar-messages', JSON.stringify(this.messages.slice(-50)));
    }

    async sendToAI(message, contextText) {
        this.isLoading = true;
        this.updateMessages();
        this.updateInputState();
        try {
            const endpoint = `${this.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
            const model = this.modelId || 'claude-sonnet-4';
            const apiMessages = [
                { role: 'system', content: `You are a helpful AI assistant integrated into a browser sidebar. Be concise and helpful, and adapt to quick actions like summarize, explain, translate. Always reply in ${this.langName()} unless the user explicitly asks otherwise.` },
            ];
            // Optional one-off context (e.g. the current page's text for "Summarize this page")
            if (contextText) apiMessages.push({ role: 'system', content: contextText });
            apiMessages.push(...this.messages.slice(-10).map(m => ({ role: m.role, content: m.content })));

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
                body: JSON.stringify({
                    model,
                    messages: apiMessages,
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            });
            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                const aiContent = data.choices[0].message?.content || data.choices[0].text || '[No content in response]';
                this.isLoading = false;
                this.addMessage({ role: 'assistant', content: aiContent });
            } else throw new Error('Invalid response from AI provider');
        } catch (error) {
            console.error('AI Error:', error);
            this.isLoading = false;
            this.addMessage({ role: 'assistant', content: `⚠️ ${error.message}. Please verify your API key, base URL, and model in Settings, then try again.` });
        } finally {
            this.isLoading = false;
            this.updateInputState();
        }
    }

    updateInputState() {
        const sendBtn = document.getElementById('send-btn');
        const input = document.getElementById('message-input');
        if (sendBtn) sendBtn.disabled = this.isLoading;
        if (input) input.disabled = this.isLoading;
        if (input && !this.isLoading) input.focus();
    }

    clearChat() {
        if (confirm(this.t('clearConfirm'))) {
            this.messages = [];
            this.saveMessages();
            this.updateMessages();
        }
    }

    /* ============================================================
       Quick actions & external (context menu) integration
       ============================================================ */
    quickAction(action) {
        this.handleExternalAction(action, this.selectedText, this.currentPage?.url);
    }

    registerRuntimeListener() {
        if (this._runtimeRegistered) return;
        try {
            chrome.runtime.onMessage.addListener((msg) => {
                if (msg.target && msg.target !== 'sidebar') return;
                switch (msg.action) {
                    case 'setSelectedText': this.selectedText = msg.text || ''; break;
                    case 'explain':
                    case 'translate':
                    case 'summarize': this.handleExternalAction(msg.action, msg.text, msg.pageUrl, msg.targetLang); break;
                    case 'pageChanged': this.currentPage = { url: msg.pageUrl, title: msg.title }; break;
                }
            });
            this._runtimeRegistered = true;
        } catch (e) { console.warn('runtime listener unavailable', e); }
    }

    handleExternalAction(action, text, pageUrl, targetLang) {
        const selected = text || this.selectedText || '';
        let prompt;
        switch (action) {
            case 'explain':
                if (!selected) return this.fetchLatestSelection().then(sel => sel && this.handleExternalAction(action, sel, pageUrl, targetLang));
                prompt = `Explain the following text clearly and concisely:\n\n${selected}`;
                break;
            case 'translate':
                if (!selected) return this.fetchLatestSelection().then(sel => sel && this.handleExternalAction(action, sel, pageUrl, targetLang));
                prompt = `Translate the following text to ${targetLang || this.langName()} while preserving meaning and tone:\n\n${selected}`;
                break;
            case 'summarize':
                if (selected) { prompt = `Summarize this text:\n\n${selected}`; break; }
                // No selection → summarize the whole active page (fetch its content first)
                return this.summarizePage();
        }
        if (prompt) { this.addMessage({ role: 'user', content: prompt }); this.sendToAI(prompt); }
    }

    async summarizePage() {
        // Show a friendly user bubble while the full page text travels as context
        this.addMessage({ role: 'user', content: this.t('sugSummarizeT') });
        const page = await this.fetchPageContent();
        if (!page || !page.text || !page.text.trim()) {
            this.addMessage({ role: 'assistant', content: this.t('noPage') });
            return;
        }
        const body = page.text.replace(/\n{3,}/g, '\n\n').slice(0, 12000);
        const context = `The user wants a summary of the web page they are currently viewing. Summarize it clearly with the main points as concise bullet points.\n\nPage title: ${page.title || ''}\nPage URL: ${page.url || ''}\n\nPage content:\n${body}`;
        await this.sendToAI(null, context);
    }

    /* Restricted pages where we cannot inject scripts at all */
    isRestrictedUrl(url) {
        return !url || /^(chrome|edge|brave|about|chrome-extension|moz-extension|view-source|file|data):/i.test(url) ||
            /^https?:\/\/(chrome\.google\.com\/webstore|chromewebstore\.google\.com)/i.test(url);
    }

    /* Verify the active tab has our content script. If not (e.g. the page was
       open before the extension loaded/reloaded), inject a refresh banner.
       Returns a promise<boolean> — true when the tab context is available. */
    ensureActiveTabContext() {
        return new Promise(resolve => {
            try {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tab = tabs && tabs[0];
                    if (!tab?.id || this.isRestrictedUrl(tab.url)) return resolve(false);
                    chrome.tabs.sendMessage(tab.id, { action: 'ping' }, (res) => {
                        if (chrome.runtime.lastError || !res || !res.pong) {
                            this.showRefreshBanner(tab.id);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                });
            } catch (e) { resolve(false); }
        });
    }

    /* Inject a small top-right "refresh to connect" banner into the page. */
    showRefreshBanner(tabId) {
        const labels = { heading: this.t('ctxHeading'), message: this.t('ctxMessage'), refresh: this.t('ctxRefresh') };
        try {
            chrome.scripting.executeScript({
                target: { tabId },
                args: [labels],
                func: (L) => {
                    if (document.getElementById('ai-sidebar-refresh-banner')) return;
                    const card = document.createElement('div');
                    card.id = 'ai-sidebar-refresh-banner';
                    card.setAttribute('style', [
                        'position:fixed', 'top:16px', 'right:16px', 'z-index:2147483647',
                        'width:300px', 'max-width:calc(100vw - 32px)', 'box-sizing:border-box',
                        'padding:14px 14px 14px 16px', 'border-radius:14px',
                        'background:#ffffff', 'border:1px solid #e7e8ec',
                        'box-shadow:0 18px 44px -16px rgba(20,22,40,.4)',
                        "font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
                        'color:#0f1222', 'animation:aiBannerIn .22s cubic-bezier(.16,1,.3,1)',
                    ].join(';'));
                    card.innerHTML =
                        '<style>@keyframes aiBannerIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}' +
                        '#ai-sidebar-refresh-banner *{box-sizing:border-box}</style>' +
                        '<div style="display:flex;gap:11px;align-items:flex-start">' +
                          '<div style="flex:none;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 6px 14px -6px rgba(99,102,241,.8)">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>' +
                          '</div>' +
                          '<div style="flex:1;min-width:0">' +
                            '<div style="font-size:13.5px;font-weight:700;letter-spacing:-.01em;margin-bottom:2px">' + L.heading + '</div>' +
                            '<div style="font-size:12px;line-height:1.45;color:#6b7280">' + L.message + '</div>' +
                          '</div>' +
                          '<button id="ai-sb-x" aria-label="Dismiss" style="flex:none;border:none;background:transparent;color:#9ca3af;cursor:pointer;padding:2px;border-radius:6px;line-height:0">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
                          '</button>' +
                        '</div>' +
                        '<button id="ai-sb-refresh" style="margin-top:12px;width:100%;padding:9px;border:none;border-radius:10px;cursor:pointer;color:#fff;font-size:13px;font-weight:700;font-family:inherit;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 10px 22px -10px rgba(99,102,241,.9)">' + L.refresh + '</button>';
                    document.documentElement.appendChild(card);
                    card.querySelector('#ai-sb-refresh').addEventListener('click', () => location.reload());
                    card.querySelector('#ai-sb-x').addEventListener('click', () => card.remove());
                    setTimeout(() => { const el = document.getElementById('ai-sidebar-refresh-banner'); if (el) el.remove(); }, 20000);
                },
            });
        } catch (e) { console.warn('Could not inject refresh banner', e); }
    }

    fetchPageContent() {
        return new Promise(resolve => {
            try {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tab = tabs && tabs[0];
                    if (!tab?.id || /^(chrome|edge|about|chrome-extension):/i.test(tab.url || '')) {
                        return resolve(null); // restricted page — can't read content
                    }
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: () => ({
                            title: document.title,
                            url: location.href,
                            text: document.body ? document.body.innerText : '',
                        }),
                    }, (results) => {
                        if (chrome.runtime.lastError || !results || !results[0]) {
                            return resolve({ title: tab.title, url: tab.url, text: '' });
                        }
                        resolve(results[0].result);
                    });
                });
            } catch (e) {
                console.error('Page content fetch error', e);
                resolve(null);
            }
        });
    }

    fetchLatestSelection() {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({ action: 'requestSelectedText' }, (res) => {
                    if (chrome.runtime.lastError || res === undefined) {
                        // Background couldn't reach the content script → tab not connected
                        this.ensureActiveTabContext();
                        resolve('');
                        return;
                    }
                    const sel = res?.selectedText?.trim();
                    if (sel) { this.selectedText = sel; resolve(sel); }
                    else { this.addMessage({ role: 'assistant', content: 'No text is selected. Highlight some page text first, then retry.' }); resolve(''); }
                });
            } catch (e) {
                console.error('Selection fetch error', e);
                this.ensureActiveTabContext();
                resolve('');
            }
        });
    }
}

function initSidebar() {
    try {
        window.aiSidebar = new AISidebar();
        console.log('✅ AI Sidebar successfully initialized!');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        document.getElementById('app').innerHTML = `<div class="error">Failed to initialize: ${error.message}</div>`;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}
