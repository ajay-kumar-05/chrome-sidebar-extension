import type { LangCode, Message, QuickAction } from './types';
import { langName } from './i18n';
import { MAX_CONTEXT_MESSAGES } from './constants';
import { ApiError, NetworkError, errorFromStatus, isAbortError } from './errors';

export interface ChatConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  lang: LangCode;
}

interface SendChatOptions extends ChatConfig {
  /** Conversation so far (only the last MAX_CONTEXT_MESSAGES are sent). */
  messages: Message[];
  /** Optional one-off context, e.g. page text for "summarize this page". */
  contextText?: string;
  signal?: AbortSignal;
  /**
   * When provided, the response is streamed and this is called with each text
   * delta as it arrives. The full text is still returned when the stream ends.
   */
  onToken?: (delta: string) => void;
}

type TextPart = { type: 'text'; text: string };
type ImagePart = { type: 'image_url'; image_url: { url: string } };
type ApiContent = string | Array<TextPart | ImagePart>;

/** Build the OpenAI-style messages array from settings + conversation. */
function buildApiMessages(
  lang: LangCode,
  messages: Message[],
  contextText?: string,
): Array<{ role: string; content: ApiContent }> {
  const apiMessages: Array<{ role: string; content: ApiContent }> = [
    {
      role: 'system',
      content: `You are a helpful AI assistant integrated into a browser sidebar. Be concise and helpful, and adapt to quick actions like summarize, explain, translate. Always reply in ${langName(lang)} unless the user explicitly asks otherwise.`,
    },
  ];
  if (contextText) apiMessages.push({ role: 'system', content: contextText });
  apiMessages.push(
    ...messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => {
      // Attach images (data URLs) as vision parts when present.
      if (m.images?.length) {
        const parts: Array<TextPart | ImagePart> = [];
        if (m.content) parts.push({ type: 'text', text: m.content });
        for (const url of m.images) parts.push({ type: 'image_url', image_url: { url } });
        return { role: m.role, content: parts };
      }
      return { role: m.role, content: m.content };
    }),
  );
  return apiMessages;
}

function extractContent(data: unknown): string {
  const choice = (data as { choices?: Array<{ message?: { content?: string }; text?: string }> })
    ?.choices?.[0];
  if (!choice) throw new ApiError('Invalid response from AI provider');
  return choice.message?.content || choice.text || '';
}

/**
 * Call an OpenAI-compatible Chat Completions endpoint and return the reply.
 * Provider-agnostic: works with OpenAI, Claude proxies, fuelix, etc.
 * Pass `onToken` to stream the reply token-by-token.
 *
 * @throws {AuthError|RateLimitError|ApiError} on a non-OK HTTP response
 * @throws {NetworkError} if the request never reaches the provider
 * @throws {DOMException} ('AbortError') if `signal` aborts the request
 */
export async function sendChat({
  baseUrl,
  apiKey,
  model,
  lang,
  messages,
  contextText,
  signal,
  onToken,
}: SendChatOptions): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
  const stream = typeof onToken === 'function';
  const apiMessages = buildApiMessages(lang, messages, contextText);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: apiMessages, max_tokens: 1000, temperature: 0.7, stream }),
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new NetworkError(err instanceof Error ? err.message : undefined);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const detail = body
      ? `${response.status} ${response.statusText} — ${body.slice(0, 200)}`
      : `${response.status} ${response.statusText}`;
    throw errorFromStatus(response.status, detail);
  }

  // Non-streaming request, or a provider that ignored the stream flag.
  const contentType = response.headers.get('content-type') ?? '';
  if (!stream || !response.body || !contentType.includes('text/event-stream')) {
    const content = extractContent(await response.json());
    onToken?.(content); // emit once so streaming callers still get the text
    return content;
  }

  return readStream(response.body, onToken!);
}

/** Parse an OpenAI SSE stream, invoking onToken per delta; returns the full text. */
async function readStream(
  body: ReadableStream<Uint8Array>,
  onToken: (delta: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // keep the trailing partial line
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onToken(delta);
        }
      } catch {
        /* keepalive comment or partial JSON — ignore */
      }
    }
  }
  return full;
}

/** Build the user prompt for a quick action on selected text. */
export function buildActionPrompt(
  action: QuickAction,
  text: string,
  lang: LangCode,
  targetLang?: string,
): string {
  switch (action) {
    case 'explain':
      return `Explain the following text clearly and concisely:\n\n${text}`;
    case 'translate':
      return `Translate the following text to ${targetLang || langName(lang)} while preserving meaning and tone:\n\n${text}`;
    case 'summarize':
      return `Summarize this text:\n\n${text}`;
  }
}
