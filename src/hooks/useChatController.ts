import { useCallback, useEffect, useRef } from 'react';
import { useChat, activeMessages } from '@/store/chat';
import { useSettings } from '@/store/settings';
import { buildActionPrompt, sendChat } from '@/lib/ai';
import { applyInlineEdit, fetchLatestSelection, fetchPageContent } from '@/lib/messaging';
import { t } from '@/lib/i18n';
import { AuthError, NetworkError, RateLimitError, isAbortError } from '@/lib/errors';
import { MAX_PAGE_TEXT, REQUEST_TIMEOUT_MS } from '@/lib/constants';
import type { InlineEditMode, LangCode, Message, QuickAction } from '@/lib/types';

/** Localized, user-facing message for a typed AI error. */
function messageForError(err: unknown, lang: LangCode): string {
  if (err instanceof AuthError) return t(lang, 'errAuth');
  if (err instanceof RateLimitError) return t(lang, 'errRate');
  if (err instanceof NetworkError) return t(lang, 'errNetwork');
  return t(lang, 'errGeneric');
}

/**
 * Central chat logic shared by the input, suggestions and the runtime listener.
 * Streams replies token-by-token and supports cancellation + request timeouts.
 */
export function useChatController() {
  const addMessage = useChat((s) => s.addMessage);
  const updateMessage = useChat((s) => s.updateMessage);
  const removeMessage = useChat((s) => s.removeMessage);
  const setLoading = useChat((s) => s.setLoading);

  // The in-flight request's controller, so the UI can cancel it.
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight request if the panel unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Run the model against the current conversation, plus optional one-off context. */
  const runAI = useCallback(
    async (contextText?: string) => {
      const { apiKey, baseUrl, model, lang } = useSettings.getState();

      // Snapshot the conversation *before* adding the placeholder, so the empty
      // assistant bubble we stream into isn't itself sent to the model.
      const history = activeMessages(useChat.getState());
      const id = addMessage({ role: 'assistant', content: '' });
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

      let acc = '';
      try {
        await sendChat({
          apiKey,
          baseUrl,
          model,
          lang,
          messages: history,
          contextText,
          signal,
          onToken: (delta) => {
            acc += delta;
            updateMessage(id, acc);
          },
        });
      } catch (error) {
        if (isAbortError(error)) {
          // User cancelled: keep any partial text, drop an empty bubble.
          if (controller.signal.aborted) {
            if (!acc) removeMessage(id);
          } else {
            // Combined signal aborted without a user cancel ⇒ timeout.
            updateMessage(id, acc ? `${acc}\n\n${t(lang, 'errNetwork')}` : t(lang, 'errNetwork'));
          }
        } else {
          const msg = messageForError(error, lang);
          updateMessage(id, acc ? `${acc}\n\n${msg}` : msg);
        }
      } finally {
        abortRef.current = null;
        setLoading(false);
      }
    },
    [addMessage, updateMessage, removeMessage, setLoading],
  );

  /** Cancel the in-flight request, if any. */
  const stop = useCallback(() => abortRef.current?.abort(), []);

  /** Rewrite / fix a page selection and send the result back to replace it. */
  const runInlineEdit = useCallback(
    async (mode: InlineEditMode, text: string) => {
      const { apiKey, baseUrl, model, lang } = useSettings.getState();
      const prompt =
        mode === 'grammar'
          ? `Correct the grammar and spelling of the following text. Reply with ONLY the corrected text — no quotes, no commentary:\n\n${text}`
          : `Rewrite the following text to be clearer and more concise, preserving its meaning, tone and language. Reply with ONLY the rewritten text — no quotes, no commentary:\n\n${text}`;
      const msg: Message = { id: 'inline', role: 'user', content: prompt, timestamp: Date.now() };
      try {
        const result = await sendChat({ apiKey, baseUrl, model, lang, messages: [msg] });
        await applyInlineEdit(result.trim());
      } catch (error) {
        addMessage({ role: 'assistant', content: messageForError(error, lang) });
      }
    },
    [addMessage],
  );

  /** Send a free-form user message. */
  const send = useCallback(
    (text: string, images?: string[]) => {
      const content = text.trim();
      if ((!content && !images?.length) || useChat.getState().isLoading) return;
      addMessage({ role: 'user', content, images });
      void runAI();
    },
    [addMessage, runAI],
  );

  /** Summarize the active browser tab's content. */
  const summarizePage = useCallback(async () => {
    const { lang } = useSettings.getState();
    addMessage({ role: 'user', content: t(lang, 'sugSummarizeT') });
    const page = await fetchPageContent();
    if (!page?.text?.trim()) {
      addMessage({ role: 'assistant', content: t(lang, 'noPage') });
      return;
    }
    const body = page.text.replace(/\n{3,}/g, '\n\n').slice(0, MAX_PAGE_TEXT);
    const context = `The user wants a summary of the web page they are currently viewing. Summarize it clearly with the main points as concise bullet points.\n\nPage title: ${page.title}\nPage URL: ${page.url}\n\nPage content:\n${body}`;
    await runAI(context);
  }, [addMessage, runAI]);

  /** Handle a quick action (from suggestions, the in-page popup or context menu). */
  const handleAction = useCallback(
    async (action: QuickAction, text?: string, targetLang?: string): Promise<void> => {
      const { lang } = useSettings.getState();
      let selected = text || useChat.getState().selectedText || '';

      if (action === 'summarize' && !selected) {
        await summarizePage();
        return;
      }

      if ((action === 'explain' || action === 'translate') && !selected) {
        selected = await fetchLatestSelection();
        if (!selected) {
          addMessage({ role: 'assistant', content: t(lang, 'errNoSelection') });
          return;
        }
      }

      const prompt = buildActionPrompt(action, selected, lang, targetLang);
      addMessage({ role: 'user', content: prompt });
      void runAI();
    },
    [addMessage, runAI, summarizePage],
  );

  return { send, handleAction, summarizePage, stop, runInlineEdit };
}
