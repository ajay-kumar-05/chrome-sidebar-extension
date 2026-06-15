import { BotIcon } from './icons';
import { useT } from '@/hooks/useT';

/** Assistant "thinking" row shown while a request is in flight. */
export default function TypingIndicator() {
  const t = useT();
  return (
    <div className="message assistant">
      <div className="message-avatar">
        <BotIcon />
      </div>
      <div className="message-col">
        <div className="message-meta">
          {t('assistant')} · {t('thinking')}
        </div>
        <div className="message-bubble typing-bubble">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
