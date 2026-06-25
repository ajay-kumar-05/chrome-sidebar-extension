/**
 * Agent tools: read-only browser/web actions the model can call during an
 * agentic turn. Mutating actions (open_url) ask the user to confirm. These run
 * in the side panel, which has chrome APIs and cross-origin fetch via
 * host_permissions.
 */
import { isRestrictedUrl } from './messaging';

const MAX_TAB_TEXT = 6000;

async function readTabContent(tabId: number): Promise<string> {
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({
        title: document.title,
        url: location.href,
        text: document.body?.innerText ?? '',
      }),
    });
    const r = res?.[0]?.result as { title: string; url: string; text: string } | undefined;
    if (!r) return 'No content available.';
    return `# ${r.title}\n${r.url}\n\n${r.text.slice(0, MAX_TAB_TEXT)}`;
  } catch {
    return 'Could not read that tab.';
  }
}

/** List the open tabs in the current window. */
export async function listTabs(): Promise<string> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const list = tabs.map((t, index) => ({
    index,
    title: t.title ?? '',
    url: t.url ?? '',
    active: !!t.active,
  }));
  return JSON.stringify(list);
}

/** Read the readable text of an open tab by its index (from list_tabs). */
export async function readTabByIndex(index: number): Promise<string> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tab = tabs[index];
  if (!tab?.id || isRestrictedUrl(tab.url)) return 'That tab cannot be read.';
  return readTabContent(tab.id);
}

/** Read the readable text of the user's active page. */
export async function readActivePage(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || isRestrictedUrl(tab.url)) return 'The active page cannot be read.';
  return readTabContent(tab.id);
}

interface SearchHit {
  title: string;
  url: string;
  snippet: string;
}

function parseDuckDuckGo(html: string): SearchHit[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const hits: SearchHit[] = [];
  doc.querySelectorAll('.result').forEach((el) => {
    const a = el.querySelector('a.result__a');
    if (!a) return;
    const title = a.textContent?.trim() ?? '';
    let url = a.getAttribute('href') ?? '';
    const m = /[?&]uddg=([^&]+)/.exec(url);
    if (m) url = decodeURIComponent(m[1]);
    const snippet = el.querySelector('.result__snippet')?.textContent?.trim() ?? '';
    if (title) hits.push({ title, url, snippet });
  });
  return hits;
}

/** Search the web (DuckDuckGo HTML) and return the top results. */
export async function webSearch(query: string): Promise<string> {
  if (!query.trim()) return 'Empty query.';
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'text/html' },
    });
    const hits = parseDuckDuckGo(await res.text()).slice(0, 5);
    if (!hits.length) return 'No results found.';
    return hits.map((h, i) => `${i + 1}. ${h.title}\n${h.url}\n${h.snippet}`).join('\n\n');
  } catch {
    return 'Web search failed.';
  }
}

/** Open a URL in a new background tab, after explicit user confirmation. */
export async function openUrl(url: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) return 'Invalid URL.';
  if (!confirm(`Allow the assistant to open a new tab?\n\n${url}`)) {
    return 'The user declined to open the tab.';
  }
  const tab = await chrome.tabs.create({ url, active: false });
  return `Opened ${url} (tab ${tab.id ?? '?'}).`;
}

/** Dispatch a tool call by name. Returns a string result for the model. */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'list_tabs':
      return listTabs();
    case 'read_tab':
      return readTabByIndex(Number(args.index ?? 0));
    case 'read_active_page':
      return readActivePage();
    case 'web_search':
      return webSearch(String(args.query ?? ''));
    case 'open_url':
      return openUrl(String(args.url ?? ''));
    default:
      return `Unknown tool: ${name}`;
  }
}
