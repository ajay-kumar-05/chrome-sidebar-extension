import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SetupScreen from '@/components/SetupScreen';
import { useChatController } from '@/hooks/useChatController';
import { useSettings } from '@/store/settings';
import { useChat } from '@/store/chat';
import { ensureActiveTabContext, onRuntimeMessage } from '@/lib/messaging';
import { t } from '@/lib/i18n';

export default function App() {
  const apiKey = useSettings((s) => s.apiKey);
  const theme = useSettings((s) => s.theme);
  const lang = useSettings((s) => s.lang);
  const configured = !!apiKey;

  const { send, handleAction, stop } = useChatController();
  const setSelectedText = useChat((s) => s.setSelectedText);
  const setCurrentPage = useChat((s) => s.setCurrentPage);

  // Apply the theme to <html> for the CSS variables to pick up.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for context-menu / in-page actions and verify the active tab once configured.
  useEffect(() => {
    if (!configured) return;

    const unsubscribe = onRuntimeMessage((msg) => {
      switch (msg.action) {
        case 'setSelectedText':
          setSelectedText(msg.text ?? '');
          break;
        case 'explain':
        case 'translate':
        case 'summarize':
          void handleAction(msg.action, msg.text, msg.targetLang);
          break;
        case 'pageChanged':
          setCurrentPage({ url: msg.pageUrl ?? '', title: msg.title ?? '' });
          break;
      }
    });

    void ensureActiveTabContext({
      heading: t(lang, 'ctxHeading'),
      message: t(lang, 'ctxMessage'),
      refresh: t(lang, 'ctxRefresh'),
    });

    return unsubscribe;
  }, [configured, handleAction, setSelectedText, setCurrentPage, lang]);

  return configured ? (
    <Sidebar onSend={send} onStop={stop} onAction={handleAction} />
  ) : (
    <SetupScreen />
  );
}
