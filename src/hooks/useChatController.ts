import { useCallback } from 'react';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';
import { buildActionPrompt, sendChat } from '@/lib/ai';
import { fetchLatestSelection, fetchPageContent } from '@/lib/messaging';
import { t } from '@/lib/i18n';
import type { QuickAction } from '@/lib/types';

/**
 * Central chat logic shared by the input, suggestions and the runtime listener.
 * Mirrors the behaviour of the original vanilla `AISidebar` send pipeline.
 */
export function useChatController() {
  const addMessage = useChat((s) => s.addMessage);
  const setLoading = useChat((s) => s.setLoading);

  /** Run the model against the current conversation, plus optional one-off context. */
  const runAI = useCallback(
    async (contextText?: string) => {
      const { apiKey, baseUrl, model, lang } = useSettings.getState();
      setLoading(true);
      try {
        const reply = await sendChat({
          apiKey,
          baseUrl,
          model,
          lang,
          messages: useChat.getState().messages,
          contextText,
        });
        addMessage({ role: 'assistant', content: reply });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addMessage({
          role: 'assistant',
          content: `⚠️ ${message}. Please verify your API key, base URL, and model in Settings, then try again.`,
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, setLoading],
  );

  /** Send a free-form user message. */
  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || useChat.getState().isLoading) return;
      addMessage({ role: 'user', content });
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
    const body = page.text.replace(/\n{3,}/g, '\n\n').slice(0, 12000);
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
          addMessage({
            role: 'assistant',
            content: 'No text is selected. Highlight some page text first, then retry.',
          });
          return;
        }
      }

      const prompt = buildActionPrompt(action, selected, lang, targetLang);
      addMessage({ role: 'user', content: prompt });
      void runAI();
    },
    [addMessage, runAI, summarizePage],
  );

  return { send, handleAction, summarizePage };
}
