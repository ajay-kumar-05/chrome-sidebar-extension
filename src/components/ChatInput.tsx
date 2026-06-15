import { useRef, useState, type KeyboardEvent } from 'react';
import { SendIcon } from './icons';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';

interface Props {
  onSend: (text: string) => void;
}

/** Auto-growing message composer. Enter sends, Shift+Enter inserts a newline. */
export default function ChatInput({ onSend }: Props) {
  const t = useT();
  const isLoading = useChat((s) => s.isLoading);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoGrow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSend(text);
    setValue('');
    requestAnimationFrame(autoGrow);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="input-section">
      <div className="input-group">
        <textarea
          ref={ref}
          className="input"
          rows={1}
          placeholder={t('placeholder')}
          value={value}
          disabled={isLoading}
          onChange={(e) => {
            setValue(e.target.value);
            autoGrow();
          }}
          onKeyDown={onKeyDown}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={isLoading || !value.trim()}
          title={t('send')}
        >
          <SendIcon />
        </button>
      </div>
      <div className="input-hint">{t('hint')}</div>
    </div>
  );
}
