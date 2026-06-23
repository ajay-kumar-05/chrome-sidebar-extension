import type { LangCode, Message, QuickAction } from './types';
import { langName } from './i18n';

export interface ChatConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  lang: LangCode;
}

interface SendChatOptions extends ChatConfig {
  /** Conversation so far (only the last 10 are sent). */
  messages: Message[];
  /** Optional one-off context, e.g. page text for "summarize this page". */
  contextText?: string;
  signal?: AbortSignal;
}

/**
 * Call an OpenAI-compatible Chat Completions endpoint and return the reply.
 * Provider-agnostic: works with OpenAI, Claude proxies, fuelix, etc.
 */
export async function sendChat({
  baseUrl,
  apiKey,
  model,
  lang,
  messages,
  contextText,
  signal,
}: SendChatOptions): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/v1/chat/completions`;

  type TextPart = { type: 'text'; text: string };
  type ImagePart = { type: 'image_url'; image_url: { url: string } };
  type ApiContent = string | Array<TextPart | ImagePart>;

  const apiMessages: Array<{ role: string; content: ApiContent }> = [
    {
      role: 'system',
      content: `You are a helpful AI assistant integrated into a browser sidebar. Be concise and helpful, and adapt to quick actions like summarize, explain, translate. Always reply in ${langName(lang)} unless the user explicitly asks otherwise.`,
    },
  ];
  if (contextText) apiMessages.push({ role: 'system', content: contextText });
  apiMessages.push(
    ...messages.slice(-10).map((m) => {
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

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: apiMessages, max_tokens: 1000, temperature: 0.7 }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  if (!choice) throw new Error('Invalid response from AI provider');
  return choice.message?.content || choice.text || '[No content in response]';
}

/** Build the user prompt for a quick action on selected text. */
export function buildActionPrompt(
  action: Exclude<QuickAction, 'summarize'> | 'summarize',
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
