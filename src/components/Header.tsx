import { PlusIcon, HistoryIcon } from './icons';
import AiOrb from './AiOrb';
import { useSettings } from '@/store/settings';
import { useChat, activeMessages } from '@/store/chat';
import { useT } from '@/hooks/useT';
import { initials } from '@/lib/format';

interface Props {
  onAvatarClick: () => void;
  onNewChat: () => void;
  onToggleThreads: () => void;
}

/** Top bar: brand on the left, user avatar (opens the menu) on the right. */
export default function Header({ onAvatarClick, onNewChat, onToggleThreads }: Props) {
  const t = useT();
  const name = useSettings((s) => s.name);
  const isLoading = useChat((s) => s.isLoading);
  // The active conversation is already "new" when it has no messages, so there's
  // nothing to start — disable the button until the user has chatted.
  const isEmptyChat = useChat((s) => activeMessages(s).length === 0);

  return (
    <div className="header">
      <div className="header-inner">
        <div className="logo-section">
          <AiOrb active={isLoading} className="logo-orb" />
          <div className="title-wrap">
            <div className="title">{t('appName')}</div>
            <div className="subtitle">
              <span className="dot" />
              {t('online')}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn"
            onClick={onNewChat}
            disabled={isEmptyChat}
            title={t('newChat')}
            aria-label={t('newChat')}
          >
            <PlusIcon />
          </button>
          <button
            className="btn"
            onClick={onToggleThreads}
            title={t('threads')}
            aria-label={t('threads')}
          >
            <HistoryIcon />
          </button>
          <button className="avatar-btn" onClick={onAvatarClick} title={name.trim() || t('you')}>
            <span className="avatar">{initials(name)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
