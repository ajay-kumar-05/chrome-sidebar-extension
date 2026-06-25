import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Welcome from './Welcome';
import { useChat, activeMessages } from '@/store/chat';
import type { QuickAction } from '@/lib/types';

interface Props {
  onAction: (action: QuickAction) => void;
}

/** Scrollable conversation area: welcome → messages → typing indicator. */
export default function MessageList({ onAction }: Props) {
  const messages = useChat(activeMessages);
  const isLoading = useChat((s) => s.isLoading);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // The assistant placeholder is empty until the first streamed token arrives;
  // hide it and show the typing indicator in its place during that window.
  const visible = messages.filter((m) => !(m.role === 'assistant' && m.content === ''));
  const last = messages[messages.length - 1];
  // Show the typing indicator while waiting on the request (last msg is the
  // user's, e.g. during page-context retrieval) or before the first token.
  const awaitingFirstToken =
    isLoading && (last?.role === 'user' || (last?.role === 'assistant' && last.content === ''));
  // The last assistant message is "streaming" once it has content while loading.
  const streamingId =
    isLoading && last?.role === 'assistant' && last.content !== '' ? last.id : null;
  const empty = visible.length === 0 && !isLoading;

  return (
    <div className="messages">
      {empty ? (
        <Welcome onAction={onAction} />
      ) : (
        <>
          {visible.map((m) => (
            <MessageBubble key={m.id} message={m} streaming={m.id === streamingId} />
          ))}
          {awaitingFirstToken && <TypingIndicator />}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
}
