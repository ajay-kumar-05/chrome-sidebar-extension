import { BotIcon } from './icons';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';
import { initials } from '@/lib/format';

interface Props {
  onAvatarClick: () => void;
}

/** Top bar: brand on the left, user avatar (opens the menu) on the right. */
export default function Header({ onAvatarClick }: Props) {
  const t = useT();
  const name = useSettings((s) => s.name);

  return (
    <div className="header">
      <div className="logo-section">
        <div className="logo">
          <BotIcon />
        </div>
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
