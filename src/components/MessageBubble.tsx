import { BotIcon } from './icons';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';
import { formatContent, initials, timeLabel } from '@/lib/format';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
}

/** A single chat row (user or assistant). */
export default function MessageBubble({ message }: Props) {
  const t = useT();
  const name = useSettings((s) => s.name);
  const isUser = message.role === 'user';
  const who = isUser ? name.trim() || t('you') : t('assistant');

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">{isUser ? initials(name) : <BotIcon />}</div>
      <div className="message-col">
        <div className="message-meta">
          {who} · {timeLabel(message.timestamp)}
        </div>
        <div
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
      </div>
    </div>
  );
}
