# AI Sidebar Assistant

A Chrome **side panel** extension that brings an AI assistant into your browser — chat,
summarize the current page, and explain or translate any selected text. Built as a single
**React + TypeScript + Tailwind** codebase that powers both the browser dev preview and the
packaged extension.

It works with **any OpenAI-compatible Chat Completions API** (OpenAI, Anthropic-compatible
proxies, fuelix, local gateways, …) — you provide the base URL, model and key.

## ✨ Features

- **AI chat** in a persistent side panel, with conversation history
- **Provider-agnostic** — point it at any OpenAI-compatible endpoint (base URL + model + key)
- **Quick actions** — summarize the current page, explain or translate the current selection
- **In-page selection popup** — highlight text on any page for one-click Explain / Translate / Summarize
- **Right-click context menus** for the same actions
- **4-language UI** — English, Hindi, French, Spanish
- **Light / dark theme**
- **Local-first** — keys, settings and history live in your browser; requests go straight to your endpoint
- **"Refresh to connect" banner** for tabs that were open before the extension loaded

## 🛠 Tech stack

- **Vite** + **@crxjs/vite-plugin** (MV3 build & HMR)
- **React 19** + **TypeScript**
- **Tailwind CSS** (+ a small ported design-system stylesheet)
- **Zustand** for state (persisted locally)

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
(page reading, context menus) no-op safely outside the extension.

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

## 📁 Project structure

```
manifest.config.ts        # MV3 manifest (single source of truth)
vite.config.ts            # Vite + React + CRXJS; outputs to extension-build/
index.html                # side panel entry
scripts/generate-icons.mjs# SVG → PNG icon generator (sharp)
public/icons/             # generated PNG icons
src/
  sidepanel/              # React entry (main.tsx) + root (App.tsx)
  components/             # Header, UserMenu, SettingsModal, SetupScreen, MessageList, …
  hooks/                  # useT (i18n), useChatController (send pipeline)
  store/                  # zustand: settings.ts, chat.ts
  lib/                    # ai (fetch client), i18n, messaging (chrome glue), format, types
  background/index.ts     # service worker (context menus, side panel, routing)
  content/                # content script + scoped popup styles
  styles/sidepanel.css    # Tailwind + design-system classes
```

## 🔒 Privacy

API keys, settings and chat history are stored locally in the browser. Requests go directly
from your browser to the endpoint you configure — there is no intermediary server, tracking
or analytics.

## 📄 License

MIT
