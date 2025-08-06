# Chrome Sidebar Extension with XavChatWidget

A powerful Chrome sidebar extension built with Next.js and TypeScript that integrates XavChatWidget for professional AI-powered assistance during web browsing.

## 🚀 Features

- **XavChatWidget Integration**: Professional third-party chatbot service
- **Chrome Side Panel**: Modern sidebar interface using Chrome's sidePanel API
- **Page Context Awareness**: Can analyze and interact with current webpage content
- **Dark/Light Mode**: Adaptive theme system with user preferences
- **Easy Configuration**: Simple plugin setup and customization
- **Persistent Storage**: Settings and preferences persistence
- **Modern Architecture**: Built with latest web technologies

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Chatbot Service**: XavChatWidget (third-party plugin)
- **Chrome APIs**: Manifest V3 with sidePanel API
- **Build Tools**: Custom build pipeline for Chrome Extension

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- Chrome Browser
- XavChatWidget account and configuration

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure XavChatWidget

Edit `public/botPlugin.js` with your XavChatWidget settings:

```javascript
// Configure your XavChatWidget settings
// Update the plugin configuration as needed
```

### 3. Development

For development with hot reload and auto-extension rebuild:

```bash
npm run dev:extension
```

This starts the Next.js dev server and watches for extension changes.

### 4. Build Extension

```bash
npm run build:extension
```

This creates a production build and packages the Chrome extension.

### 5. Verify Extension

```bash
node scripts/verify-extension.js
```

This checks that all required files are present and valid.

### 6. Install in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension-build` folder from your project directory
5. The extension should now appear in your extensions list

## 🔧 Configuration

### Setting up OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open the extension sidebar
3. Click the settings gear icon
4. Enter your API key and select your preferred model
5. Save settings

### Available Models

- **GPT-3.5 Turbo**: Fast and cost-effective (recommended)
- **GPT-4**: More capable but slower
- **GPT-4 Turbo**: Latest model with improved performance

## 📱 Usage

### Basic Chat

1. Click the extension icon or floating button to open sidebar
2. Type your question in the chat input
3. AI will respond with context from the current page

### Quick Actions

- **Summarize Page**: Click the blue button to get page summary
- **Explain Selected**: Select text and click green button
- **Translate**: Select text and click purple button

### Context Menu

Right-click on any selected text to access:
- Explain with AI
- Translate with AI
- Summarize page with AI

### Text Selection

1. Select any text on a webpage
2. A popup will appear with quick action buttons
3. Choose an action or type a custom question

## 🎨 Customization

### Themes

- **Light Mode**: Clean, minimal interface
- **Dark Mode**: Easy on the eyes for dark environments  
- **Auto Mode**: Follows system preference

### Sidebar Size

The sidebar width can be adjusted and the preference is saved automatically.

## 🔒 Privacy & Security

- API keys are stored locally in Chrome extension storage
- No data is sent to external servers except OpenAI API
- Chat history is stored locally and can be cleared anytime
- No tracking or analytics

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.tsx     # Main sidebar component
│   │   ├── ChatMessage.tsx # Message display component
│   │   ├── ChatInput.tsx   # Message input component
│   │   └── ...
│   ├── services/           # Service layer
│   │   └── ai.ts          # OpenAI integration
│   ├── store/             # State management
│   │   └── index.ts       # Zustand stores
│   ├── extension/         # Chrome extension scripts
│   │   ├── background.js  # Background service worker
│   │   ├── content.js     # Content script
│   │   ├── content.css    # Content styles
│   │   ├── manifest.template.json # Manifest template
│   │   └── sidebar/       # Sidebar specific files
│   │       ├── index.html # Sidebar HTML
│   │       ├── sidebar.js # Sidebar JavaScript
│   │       └── styles.css # Sidebar styles
│   └── pages/             # Next.js pages
├── public/
│   ├── manifest.json      # Extension manifest template
│   └── icons/            # Extension icons (SVG source)
├── scripts/
│   ├── build-extension.js # Main build script
│   ├── create-icons.js   # Icon generator (SVG to PNG)
│   └── verify-extension.js # Extension verification
└── extension-build/       # Built extension (created after build)
    └── icons/            # Generated PNG icons
```

## 🚀 Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic sidebar interface
- [x] OpenAI integration
- [x] Text selection handling
- [x] Context menus
- [x] Settings panel

### Phase 2: Enhanced Features
- [ ] Voice input/output
- [ ] Document upload and analysis
- [ ] Custom prompts and templates
- [ ] Export chat history
- [ ] Multi-language support

### Phase 3: Advanced Features
- [ ] Website-specific AI assistants
- [ ] Integration with popular websites
- [ ] Team collaboration features
- [ ] Analytics and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Sider.ai](https://sider.ai)
- Built with [Next.js](https://nextjs.org)
- Powered by [OpenAI](https://openai.com)
- UI components inspired by [Tailwind UI](https://tailwindui.com)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ajay-kumar-05/chrome-sidebar-extension/issues) page
2. Create a new issue with detailed description
3. Include your Chrome version and extension version

## 🔄 Updates

To update the extension:

1. Pull the latest changes: `git pull origin main`
2. Install new dependencies: `npm install`
3. Rebuild the extension: `npm run build`
4. Verify the build: `node scripts/verify-extension.js`
5. Reload the extension in Chrome extensions page

### Development Commands

```bash
# Start development with auto-rebuild
npm run dev:extension

# Build production version
npm run build

# Build extension only
npm run build:extension

# Verify extension build
node scripts/verify-extension.js

# Generate icons from SVG
node scripts/create-icons.js
```

---

**Happy AI-powered browsing! 🤖✨**
