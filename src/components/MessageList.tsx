import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Welcome from './Welcome';
import { useChat } from '@/store/chat';
import type { QuickAction } from '@/lib/types';

interface Props {
  onAction: (action: QuickAction) => void;
}

/** Scrollable conversation area: welcome → messages → typing indicator. */
export default function MessageList({ onAction }: Props) {
  const messages = useChat((s) => s.messages);
  const isLoading = useChat((s) => s.isLoading);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // The assistant placeholder is empty until the first streamed token arrives;
  // hide it and show the typing indicator in its place during that window.
  const visible = messages.filter((m) => !(m.role === 'assistant' && m.content === ''));
  const last = messages[messages.length - 1];
  const awaitingFirstToken = isLoading && last?.role === 'assistant' && last.content === '';
  const empty = visible.length === 0 && !isLoading;

  return (
    <div className="messages">
      {empty ? (
        <Welcome onAction={onAction} />
      ) : (
        <>
          {visible.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {awaitingFirstToken && <TypingIndicator />}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
}
