# AI Sidebar Extension - Sider.ai Clone

A powerful Chrome sidebar extension built with Next.js and TypeScript that provides AI-powered assistance for web browsing, similar to Sider.ai.

## 🚀 Features

- **AI Chat Interface**: Interactive chat with OpenAI models
- **Page Analysis**: Summarize and analyze web page content
- **Text Selection**: Explain, translate, or analyze selected text
- **Context Menus**: Right-click options for quick AI actions
- **Multiple AI Models**: Support for GPT-3.5, GPT-4, and GPT-4 Turbo
- **Dark/Light Mode**: Adaptive theme system
- **Persistent Storage**: Chat history and settings persistence
- **Floating Action Button**: Quick access to AI features

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI API
- **Build Tools**: Custom build pipeline for Chrome Extension

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- Chrome Browser
- OpenAI API Key

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file (optional, API key can be set in extension):

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Development

For development with hot reload:

```bash
npm run dev:extension
```

This starts the Next.js dev server and watches for extension changes.

### 4. Build Extension

```bash
npm run build
```

This creates a production build and packages the Chrome extension.

### 5. Install in Chrome

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
│   │   └── content.js     # Content script
│   └── pages/             # Next.js pages
├── public/
│   ├── manifest.json      # Extension manifest
│   └── icons/            # Extension icons
├── scripts/
│   └── build-extension.js # Build script
└── extension-build/       # Built extension (created after build)
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

1. Check the [Issues](https://github.com/your-username/chrome-sidebar-extension/issues) page
2. Create a new issue with detailed description
3. Include your Chrome version and extension version

## 🔄 Updates

To update the extension:

1. Pull the latest changes: `git pull origin main`
2. Install new dependencies: `npm install`
3. Rebuild the extension: `npm run build`
4. Reload the extension in Chrome extensions page

---

**Happy AI-powered browsing! 🤖✨**
