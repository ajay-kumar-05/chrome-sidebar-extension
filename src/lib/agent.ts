/**
 * Agentic tool-use loop: the model can call browser/web tools, we execute them
 * and feed results back, repeating until it produces a final answer. Uses the
 * OpenAI-compatible function-calling protocol (non-streaming).
 */
import type { ChatConfig } from './ai';
import type { Message } from './types';
import { ApiError, NetworkError, errorFromStatus, isAbortError } from './errors';
import { langName } from './i18n';
import { executeTool } from './tools';

interface ToolCall {
  id: string;
  function: { name: string; arguments: string };
}
interface ApiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

/** OpenAI-format tool definitions advertised to the model. */
export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'list_tabs',
      description: 'List the open tabs in the current window with their index, title and URL.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_tab',
      description: 'Read the readable text of an open tab by its index (from list_tabs).',
      parameters: {
        type: 'object',
        properties: { index: { type: 'integer', description: 'Tab index from list_tabs' } },
        required: ['index'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_active_page',
      description: "Read the readable text of the user's currently active page.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web and return the top results (title, URL, snippet).',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_url',
      description: 'Open a URL in a new background tab. The user is asked to confirm first.',
      parameters: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    },
  },
];

const MAX_STEPS = 6;

export interface AgentEvent {
  type: 'tool';
  name: string;
}

interface RunAgentOptions extends ChatConfig {
  history: Message[];
  onEvent?: (e: AgentEvent) => void;
  signal?: AbortSignal;
}

async function complete(
  cfg: ChatConfig,
  messages: ApiMessage[],
  signal?: AbortSignal,
): Promise<ApiMessage> {
  const endpoint = `${cfg.baseUrl.replace(/\/$/, '')}/v1/chat/completions`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.4,
      }),
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw new NetworkError(err instanceof Error ? err.message : undefined);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw errorFromStatus(response.status, body ? `${response.status} — ${body.slice(0, 200)}` : `${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const msg = data?.choices?.[0]?.message as ApiMessage | undefined;
  if (!msg) throw new ApiError('Invalid response from AI provider');
  return msg;
}

/**
 * Run the agent loop and return the final answer.
 * @throws the same typed errors as the chat client (Auth/RateLimit/Network…).
 */
export async function runAgent({
  apiKey,
  baseUrl,
  model,
  lang,
  history,
  onEvent,
  signal,
}: RunAgentOptions): Promise<string> {
  const messages: ApiMessage[] = [
    {
      role: 'system',
      content:
        `You are an AI browser agent in a side panel. You can inspect the user's open tabs and ` +
        `search the web using the provided tools. Use tools when they help answer; work step by ` +
        `step; prefer reading the active page or searching before guessing. Cite the URLs you used. ` +
        `Reply in ${langName(lang)}.`,
    },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ApiMessage),
  ];

  for (let step = 0; step < MAX_STEPS; step++) {
    const msg = await complete({ apiKey, baseUrl, model, lang }, messages, signal);

    if (msg.tool_calls?.length) {
      messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: msg.tool_calls });
      for (const call of msg.tool_calls) {
        onEvent?.({ type: 'tool', name: call.function.name });
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch {
          /* leave args empty on malformed JSON */
        }
        const result = await executeTool(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: String(result).slice(0, 8000),
        });
      }
      continue;
    }

    return msg.content ?? '';
  }

  return 'I reached the step limit before finishing. Try narrowing the request.';
}
