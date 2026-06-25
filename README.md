# AI Sidebar Assistant

A Chrome **side panel** extension that brings an AI assistant into your browser — chat,
summarize the current page, explain or translate selected text, **chat with the page** via
on-device retrieval, and let the model **use browser/web tools** to answer agentically. Built
as a single **React + TypeScript + Tailwind** codebase that powers both the browser dev
preview and the packaged extension.

It works with **any OpenAI-compatible Chat Completions API** (OpenAI, Anthropic-compatible
proxies, fuelix, local gateways, …) — you provide the base URL, model and key.

## ✨ Features

- **AI chat** in a persistent side panel, with **multiple conversation threads** (create,
  switch, rename-by-first-message, delete)
- **Provider-agnostic** — point it at any OpenAI-compatible endpoint (base URL + model + key)
- **Agent mode** — the model can call browser/web tools (`list_tabs`, `read_tab`,
  `read_active_page`, `web_search`, `open_url`) in an agentic loop to research and act
- **Chat with the page (RAG)** — page text is embedded **on-device** (transformers.js,
  `Xenova/all-MiniLM-L6-v2`) and the most relevant chunks are retrieved per question; nothing
  but the top chunks is ever sent to your provider
- **Quick actions** — summarize the current page, explain or translate the current selection
- **In-page selection popup** — highlight text on any page for one-click Explain / Translate / Summarize
- **Right-click context menus** for the same actions
- **Command palette** (`Cmd/Ctrl + K`) for fast access to actions and settings
- **Voice** — dictation (speech-to-text) and read-aloud (text-to-speech) via the Web Speech APIs
- **Image input** — attach images to messages for vision-capable models
- **Rich Markdown** rendering with GitHub-flavored markdown and syntax highlighting
- **4-language UI** — English, Hindi, French, Spanish
- **Light / dark theme**
- **Local-first** — keys, settings and history live in your browser; requests go straight to your endpoint
- **"Refresh to connect" banner** for tabs that were open before the extension loaded

## 🛠 Tech stack

- **Vite** + **@crxjs/vite-plugin** (MV3 build & HMR)
- **React 19** + **TypeScript**
- **Tailwind CSS** (+ a small ported design-system stylesheet)
- **Zustand** for state (persisted locally)
- **@huggingface/transformers** (transformers.js) for on-device embeddings (RAG)
- **react-markdown** + **remark-gfm** + **rehype-highlight** for message rendering
- **Framer Motion** for animations
- **Vitest** for unit tests

## 📦 Getting started

### Prerequisites
- Node.js 18+
- Google Chrome (or any Chromium browser with side-panel support)
- An API key for any OpenAI-compatible endpoint

### Install
```bash
npm install
npm run icons   # one-time: generate the PNG extension icons
```

### Develop the UI in the browser
```bash
npm run dev
```
Opens the side-panel UI at `http://localhost:5173` for fast iteration. Chrome-only features
(page reading, context menus, agent tools) no-op safely outside the extension.

### Build & load the extension
```bash
npm run build
```
This produces a loadable MV3 bundle in **`extension-build/`**. Then:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the **`extension-build`** folder
5. Pin the extension and click its icon to open the side panel

> For live-reloading the actual extension, you can also run `npm run dev` and load
> `extension-build/` — CRXJS wires HMR into the side panel.

### Configure
On first run the side panel shows a setup screen. Enter your **API key**, **base URL**
(e.g. `https://api.openai.com`), **model ID** (e.g. `gpt-4.1`) and optionally your name.
You can change these any time from the avatar menu → **Settings**.

## 🧰 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (browser preview + extension HMR) |
| `npm run build` | Type-check and build the MV3 bundle into `extension-build/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run icons` | Generate PNG icons from the source SVG (sharp) |

## 📁 Project structure

```
manifest.config.ts            # MV3 manifest (single source of truth)
vite.config.ts                # Vite + React + CRXJS; outputs to extension-build/
index.html                    # side panel entry
scripts/generate-icons.mjs    # SVG → PNG icon generator (sharp)
public/icons/                 # generated PNG icons
src/
  sidepanel/                  # React entry (main.tsx) + root (App.tsx)
  components/                 # Header, Sidebar, ThreadPanel, CommandPalette,
                              #   SettingsModal, SetupScreen, MessageList,
                              #   MessageBubble, ChatInput, Markdown, Welcome, …
  hooks/                      # useT (i18n), useChatController (send pipeline)
  store/                      # zustand: settings.ts, chat.ts (threads)
  lib/
    ai.ts                     # OpenAI-compatible fetch client (streaming)
    agent.ts                  # agentic tool-use loop
    tools.ts                  # browser/web tool implementations
    rag.ts                    # on-device retrieval over page text
    embeddings.worker.ts      # transformers.js embedding worker
    speech.ts                 # Web Speech (dictation + TTS) wrappers
    prompts.ts                # system/quick-action prompts
    messaging.ts              # chrome messaging glue
    i18n/ , languages.ts      # translations
    constants.ts, errors.ts, format.ts, types.ts
  background/service-worker.ts# service worker (context menus, side panel, routing)
  content/                    # content-script.ts + scoped popup styles
  styles/sidepanel.css        # Tailwind + design-system classes
```

## 🔒 Privacy

API keys, settings and chat history are stored locally in the browser. Page embeddings for
"chat with the page" are computed **on-device** and never leave your machine. Requests go
directly from your browser to the endpoint you configure — there is no intermediary server,
tracking or analytics.