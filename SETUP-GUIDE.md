# Setup Guide

A step-by-step guide to building, loading and configuring the AI Sidebar Assistant.

## 1. Prerequisites

- **Node.js 18+**
- **Google Chrome** (or a Chromium browser with side-panel support)
- An **API key** for any OpenAI-compatible Chat Completions endpoint

## 2. Install dependencies

```bash
npm install
npm run icons    # generate public/icons/icon{16,32,48,128}.png (one-time)
```

## 3. Build the extension

```bash
npm run build
```

The loadable extension is written to **`extension-build/`** (gitignored — it is build
output, not source).

## 4. Load it in Chrome

1. Open `chrome://extensions/`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the **`extension-build`** folder in this project
5. The "AI Sidebar Assistant" entry appears — pin it for quick access
6. Click the toolbar icon (or use a page's floating button) to open the side panel

## 5. Configure your AI connection

On first open you'll see the setup screen. Provide:

| Field      | Example                         | Notes                                            |
| ---------- | ------------------------------- | ------------------------------------------------ |
| API key    | `sk-…` / `ak-…`                 | Stored locally in your browser only              |
| Base URL   | `https://api.openai.com`        | Any OpenAI-compatible host (no trailing `/v1`)   |
| Model ID   | `gpt-4.1`, `claude-sonnet-4`, … | Whatever your endpoint accepts                   |
| Your name  | `Ajay`                          | Optional — used for the avatar and message label |

Requests are sent to `<Base URL>/v1/chat/completions`. Change any of these later from the
avatar menu → **Settings**, or **Reset API key** to disconnect.

## 6. Using it

- **Chat** — type in the input; `Enter` sends, `Shift+Enter` adds a newline
- **Summarize page** — suggestion card or right-click → *Summarize page with AI*
- **Explain / Translate selection** — highlight text → in-page popup, or right-click menu;
  the translate caret lets you pick a target language
- **Theme & language** — avatar menu (light/dark, EN/HI/FR/ES)
- **Clear conversation** — avatar menu

## 7. Development workflow

```bash
npm run dev      # UI preview at http://localhost:5173 (chrome.* features no-op here)
npm run build    # produce extension-build/
npm run lint     # eslint
npm run icons    # regenerate PNG icons from the source SVG
```

For an extension-side live-reload loop, run `npm run dev` and load `extension-build/` in
Chrome — CRXJS hot-reloads the side panel on save.

## Troubleshooting

- **"Refresh to connect" banner** — the page was open before the extension loaded; refresh
  it so the content script can attach.
- **Selection popup not showing** — it only appears after you've configured an API key.
- **API errors** — verify the key, base URL and model in Settings; the base URL should not
  include `/v1` (it's appended automatically).
- **Restricted pages** — `chrome://`, the Web Store and other protected pages can't be read
  or injected into; open a normal website.
