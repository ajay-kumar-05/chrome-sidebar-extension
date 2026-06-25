import clsx from 'clsx';
import { ChevronIcon, MoonIcon, SettingsIcon, SunIcon, TrashIcon } from './icons';
import { useSettings } from '@/store/settings';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';
import { useDialog } from './Dialog';
import { initials } from '@/lib/format';
import { LANGS } from '@/lib/i18n';

interface Props {
  onClose: () => void;
  onOpenSettings: () => void;
}

/** Avatar popover: profile, theme, language, settings and clear-chat. */
export default function UserMenu({ onClose, onOpenSettings }: Props) {
  const t = useT();
  const dialog = useDialog();
  const { name, model, theme, lang, update } = useSettings();
  const clear = useChat((s) => s.clear);

  const handleClear = async () => {
    const ok = await dialog.confirm({
      title: t('menuClear'),
      message: t('clearConfirm'),
      confirmLabel: t('confirm'),
      cancelLabel: t('cancel'),
      tone: 'danger',
    });
    if (ok) {
      clear();
      onClose();
    }
  };

  return (
    <div
      className="menu-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="menu">
        <div className="menu-profile">
          <span className="avatar">{initials(name)}</span>
          <div className="info">
            <div className="name">{name.trim() || t('you')}</div>
            <div className="meta">{model || 'AI Assistant'}</div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-label">{t('menuTheme')}</div>
          <div className="theme-toggle">
            <button
              className={clsx('theme-opt', theme === 'light' && 'active')}
              onClick={() => update({ theme: 'light' })}
            >
              <SunIcon />
              {t('themeLight')}
            </button>
            <button
              className={clsx('theme-opt', theme === 'dark' && 'active')}
              onClick={() => update({ theme: 'dark' })}
            >
              <MoonIcon />
              {t('themeDark')}
            </button>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-label">{t('menuLanguage')}</div>
          <div className="lang-grid">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={clsx('lang-opt', lang === l.code && 'active')}
                onClick={() => update({ lang: l.code })}
              >
                <span className="flag">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <button
            className="menu-item"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
          >
            <SettingsIcon />
            <span className="menu-item-text">{t('menuSettings')}</span>
            <span className="chev">
              <ChevronIcon />
            </span>
          </button>
          <button className="menu-item danger" onClick={() => void handleClear()}>
            <TrashIcon />
            <span className="menu-item-text">{t('menuClear')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
