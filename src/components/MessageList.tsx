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

  const empty = messages.length === 0 && !isLoading;

  return (
    <div className="messages">
      {empty ? (
        <Welcome onAction={onAction} />
      ) : (
        <>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
}
