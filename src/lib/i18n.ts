import type { LangCode } from './types';

export interface Language {
  code: LangCode;
  label: string;
  flag: string;
  name: string;
}

export const LANGS: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', name: 'English' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', name: 'Hindi' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'French' },
  { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Spanish' },
];

const en = {
  appName: 'AI Sidebar',
  tagline: 'Your browsing copilot',
  online: 'Online',
  welcomeTitle: 'How can I help?',
  welcomeText: 'Ask anything, or use a quick action to work with the current page.',
  sugSummarizeT: 'Summarize this page',
  sugSummarizeD: 'Get the key points instantly',
  sugExplainT: 'Explain selection',
  sugExplainD: 'Highlight text, then ask',
  sugTranslateT: 'Translate selection',
  sugTranslateD: 'Into your language',
  placeholder: 'Ask me anything…',
  hint: 'Enter to send · Shift+Enter for new line',
  menuTheme: 'Appearance',
  menuLanguage: 'Language',
  menuSettings: 'Settings',
  menuClear: 'Clear conversation',
  themeLight: 'Light',
  themeDark: 'Dark',
  settings: 'Settings',
  yourName: 'Your name',
  namePh: 'e.g. Ajay',
  apiKey: 'API key',
  baseUrl: 'Base URL',
  model: 'Model ID',
  save: 'Save changes',
  resetKey: 'Reset API key',
  setupTitle: 'Connect your AI',
  setupText:
    'Enter your OpenAI-compatible API details. Everything is stored locally in your browser.',
  setupSave: 'Save & continue',
  setupNote:
    'Uses an OpenAI-compatible Chat Completions API. Requests go directly from your browser to the endpoint you set.',
  you: 'You',
  assistant: 'Assistant',
  thinking: 'Thinking…',
  send: 'Send',
  clearConfirm: 'Clear all messages?',
  resetConfirm: 'Reset API key? Base URL & model are kept.',
  getKey: 'Get an API key',
  noPage:
    "I couldn't read this page. It may be a protected page (like chrome:// or the extensions page). Open a normal website and try again.",
  ctxHeading: 'Refresh to connect',
  ctxMessage:
    'This page was open before AI Sidebar loaded, so I can’t read it yet. Refresh the page to enable AI here.',
  ctxRefresh: 'Refresh page',
};

export type TranslationKey = keyof typeof en;

type Dict = Record<TranslationKey, string>;

const I18N: Record<LangCode, Dict> = {
  en,
  hi: {
    appName: 'एआई साइडबार',
    tagline: 'आपका ब्राउज़िंग सहायक',
    online: 'ऑनलाइन',
    welcomeTitle: 'मैं कैसे मदद करूँ?',
    welcomeText: 'कुछ भी पूछें, या मौजूदा पेज पर त्वरित क्रिया का उपयोग करें।',
    sugSummarizeT: 'इस पेज का सारांश',
    sugSummarizeD: 'तुरंत मुख्य बिंदु पाएं',
    sugExplainT: 'चयन समझाएँ',
    sugExplainD: 'टेक्स्ट चुनें, फिर पूछें',
    sugTranslateT: 'चयन का अनुवाद',
    sugTranslateD: 'आपकी भाषा में',
    placeholder: 'मुझसे कुछ भी पूछें…',
    hint: 'भेजने के लिए Enter · नई लाइन के लिए Shift+Enter',
    menuTheme: 'दिखावट',
    menuLanguage: 'भाषा',
    menuSettings: 'सेटिंग्स',
    menuClear: 'बातचीत साफ़ करें',
    themeLight: 'लाइट',
    themeDark: 'डार्क',
    settings: 'सेटिंग्स',
    yourName: 'आपका नाम',
    namePh: 'जैसे अजय',
    apiKey: 'एपीआई कुंजी',
    baseUrl: 'बेस यूआरएल',
    model: 'मॉडल आईडी',
    save: 'सहेजें',
    resetKey: 'एपीआई कुंजी रीसेट करें',
    setupTitle: 'अपना एआई कनेक्ट करें',
    setupText:
      'अपनी OpenAI-संगत एपीआई जानकारी दर्ज करें। सब कुछ आपके ब्राउज़र में स्थानीय रूप से सहेजा जाता है।',
    setupSave: 'सहेजें और जारी रखें',
    setupNote:
      'OpenAI-संगत Chat Completions API का उपयोग करता है। अनुरोध सीधे आपके ब्राउज़र से एंडपॉइंट पर जाते हैं।',
    you: 'आप',
    assistant: 'सहायक',
    thinking: 'सोच रहा हूँ…',
    send: 'भेजें',
    clearConfirm: 'सभी संदेश साफ़ करें?',
    resetConfirm: 'एपीआई कुंजी रीसेट करें? बेस यूआरएल और मॉडल रहेंगे।',
    getKey: 'एपीआई कुंजी प्राप्त करें',
    noPage:
      'मैं इस पेज को नहीं पढ़ सका। यह एक सुरक्षित पेज हो सकता है (जैसे chrome:// या एक्सटेंशन पेज)। कोई सामान्य वेबसाइट खोलें और पुनः प्रयास करें।',
    ctxHeading: 'कनेक्ट करने के लिए रिफ़्रेश करें',
    ctxMessage:
      'यह पेज AI Sidebar लोड होने से पहले खुला था, इसलिए मैं इसे अभी पढ़ नहीं सकता। यहाँ AI सक्षम करने के लिए पेज रिफ़्रेश करें।',
    ctxRefresh: 'पेज रिफ़्रेश करें',
  },
  fr: {
    appName: 'Barre IA',
    tagline: 'Votre copilote de navigation',
    online: 'En ligne',
    welcomeTitle: 'Comment puis-je aider ?',
    welcomeText: 'Posez une question ou utilisez une action rapide sur la page actuelle.',
    sugSummarizeT: 'Résumer cette page',
    sugSummarizeD: 'Les points clés en un instant',
    sugExplainT: 'Expliquer la sélection',
    sugExplainD: 'Sélectionnez du texte, puis demandez',
    sugTranslateT: 'Traduire la sélection',
    sugTranslateD: 'Dans votre langue',
    placeholder: 'Demandez-moi n’importe quoi…',
    hint: 'Entrée pour envoyer · Maj+Entrée nouvelle ligne',
    menuTheme: 'Apparence',
    menuLanguage: 'Langue',
    menuSettings: 'Paramètres',
    menuClear: 'Effacer la conversation',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    settings: 'Paramètres',
    yourName: 'Votre nom',
    namePh: 'ex. Ajay',
    apiKey: 'Clé API',
    baseUrl: 'URL de base',
    model: 'ID du modèle',
    save: 'Enregistrer',
    resetKey: 'Réinitialiser la clé API',
    setupTitle: 'Connectez votre IA',
    setupText:
      'Saisissez vos identifiants API compatibles OpenAI. Tout est stocké localement dans votre navigateur.',
    setupSave: 'Enregistrer et continuer',
    setupNote:
      'Utilise une API Chat Completions compatible OpenAI. Les requêtes vont directement de votre navigateur au point de terminaison.',
    you: 'Vous',
    assistant: 'Assistant',
    thinking: 'Réflexion…',
    send: 'Envoyer',
    clearConfirm: 'Effacer tous les messages ?',
    resetConfirm: 'Réinitialiser la clé API ? L’URL et le modèle sont conservés.',
    getKey: 'Obtenir une clé API',
    noPage:
      "Je n'ai pas pu lire cette page. C'est peut-être une page protégée (comme chrome:// ou la page des extensions). Ouvrez un site web normal et réessayez.",
    ctxHeading: 'Actualisez pour connecter',
    ctxMessage:
      'Cette page était ouverte avant le chargement d’AI Sidebar, je ne peux donc pas la lire. Actualisez la page pour activer l’IA ici.',
    ctxRefresh: 'Actualiser la page',
  },
  es: {
    appName: 'Barra IA',
    tagline: 'Tu copiloto de navegación',
    online: 'En línea',
    welcomeTitle: '¿Cómo puedo ayudar?',
    welcomeText: 'Pregunta lo que sea o usa una acción rápida en la página actual.',
    sugSummarizeT: 'Resumir esta página',
    sugSummarizeD: 'Los puntos clave al instante',
    sugExplainT: 'Explicar selección',
    sugExplainD: 'Selecciona texto y pregunta',
    sugTranslateT: 'Traducir selección',
    sugTranslateD: 'A tu idioma',
    placeholder: 'Pregúntame lo que sea…',
    hint: 'Enter para enviar · Shift+Enter nueva línea',
    menuTheme: 'Apariencia',
    menuLanguage: 'Idioma',
    menuSettings: 'Ajustes',
    menuClear: 'Borrar conversación',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    settings: 'Ajustes',
    yourName: 'Tu nombre',
    namePh: 'p. ej. Ajay',
    apiKey: 'Clave API',
    baseUrl: 'URL base',
    model: 'ID del modelo',
    save: 'Guardar cambios',
    resetKey: 'Restablecer clave API',
    setupTitle: 'Conecta tu IA',
    setupText:
      'Introduce tus datos de API compatibles con OpenAI. Todo se guarda localmente en tu navegador.',
    setupSave: 'Guardar y continuar',
    setupNote:
      'Usa una API de Chat Completions compatible con OpenAI. Las solicitudes van directamente de tu navegador al endpoint.',
    you: 'Tú',
    assistant: 'Asistente',
    thinking: 'Pensando…',
    send: 'Enviar',
    clearConfirm: '¿Borrar todos los mensajes?',
    resetConfirm: '¿Restablecer la clave API? Se conservan URL y modelo.',
    getKey: 'Obtener una clave API',
    noPage:
      'No pude leer esta página. Puede ser una página protegida (como chrome:// o la página de extensiones). Abre un sitio web normal e inténtalo de nuevo.',
    ctxHeading: 'Actualiza para conectar',
    ctxMessage:
      'Esta página estaba abierta antes de que se cargara AI Sidebar, así que aún no puedo leerla. Actualiza la página para habilitar la IA aquí.',
    ctxRefresh: 'Actualizar página',
  },
};

/** Translate a key for the given language, falling back to English. */
export function t(lang: LangCode, key: TranslationKey): string {
  return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}

/** Human-readable language name for the system prompt ("reply in X"). */
export function langName(lang: LangCode): string {
  return (LANGS.find((l) => l.code === lang) ?? LANGS[0]).name;
}
