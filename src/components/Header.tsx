import { Suspense, lazy } from 'react';
import { useSettings } from '@/store/settings';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';
import { initials } from '@/lib/format';

// three.js is heavy — load it in its own chunk so the UI paints first.
const AiOrb = lazy(() => import('./AiOrb'));

interface Props {
  onAvatarClick: () => void;
}

/** Top bar: brand on the left, user avatar (opens the menu) on the right. */
export default function Header({ onAvatarClick }: Props) {
  const t = useT();
  const name = useSettings((s) => s.name);
  const isLoading = useChat((s) => s.isLoading);

  return (
    <div className="header">
      <div className="logo-section">
        <Suspense fallback={<div className="logo" />}>
          <AiOrb active={isLoading} className="logo logo-orb" />
        </Suspense>
        <div className="title-wrap">
          <div className="title">{t('appName')}</div>
          <div className="subtitle">
            <span className="dot" />
            {t('online')}
          </div>
        </div>
      </div>
      <div className="header-actions">
        <button className="avatar-btn" onClick={onAvatarClick} title={name.trim() || t('you')}>
          <span className="avatar">{initials(name)}</span>
        </button>
      </div>
    </div>
  );
}
