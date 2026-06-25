import { useEffect, useState } from 'react';
import { BotIcon, SpeakerIcon } from './icons';
import Markdown from './Markdown';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';
import { initials, timeLabel } from '@/lib/format';
import { speak, stopSpeaking, ttsSupported } from '@/lib/speech';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
  /** True while this assistant message is actively being streamed into. */
  streaming?: boolean;
}

/** A single chat row (user or assistant). */
export default function MessageBubble({ message, streaming }: Props) {
  const t = useT();
  const name = useSettings((s) => s.name);
  const lang = useSettings((s) => s.lang);
  const [speaking, setSpeaking] = useState(false);
  const isUser = message.role === 'user';
  const who = isUser ? name.trim() || t('you') : t('assistant');
  const canSpeak = !isUser && !streaming && ttsSupported() && !!message.content;

  // Stop any in-progress speech if this bubble unmounts.
  useEffect(() => () => stopSpeaking(), []);

  const toggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(message.content, lang, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">{isUser ? initials(name) : <BotIcon />}</div>
      <div className="message-col">
        <div className="message-meta">
          {who} · {timeLabel(message.timestamp)}
          {canSpeak && (
            <button
              className={`speak-btn${speaking ? ' on' : ''}`}
              onClick={toggleSpeak}
              title={speaking ? t('stopListen') : t('listen')}
              aria-label={speaking ? t('stopListen') : t('listen')}
            >
              <SpeakerIcon />
            </button>
          )}
        </div>
        <div className="message-bubble">
          {message.images?.length ? (
            <div className="message-images">
              {message.images.map((src, i) => (
                <img key={i} className="message-image" src={src} alt={t('attachAlt')} />
              ))}
            </div>
          ) : null}
          {isUser ? (
            message.content && <span>{message.content}</span>
          ) : (
            <>
              <Markdown>{message.content}</Markdown>
              {streaming && <span className="stream-caret" aria-hidden />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
