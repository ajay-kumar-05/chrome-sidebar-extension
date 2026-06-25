import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  DocIcon,
  SparkleIcon,
  GlobeIcon,
  TrashIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
} from './icons';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';
import type { QuickAction } from '@/lib/types';

interface Props {
  onClose: () => void;
  onAction: (action: QuickAction, text?: string, targetLang?: string) => void;
  onOpenSettings: () => void;
}

interface Command {
  id: string;
  label: string;
  icon: ReactNode;
  run: () => void;
}

/** ⌘K command palette: fuzzy-filter and run a quick action or app command. */
export default function CommandPalette({ onClose, onAction, onOpenSettings }: Props) {
  const t = useT();
  const clear = useChat((s) => s.clear);
  const theme = useSettings((s) => s.theme);
  const update = useSettings((s) => s.update);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const commands: Command[] = useMemo(() => {
    const close = (fn: () => void) => () => {
      fn();
      onClose();
    };
    return [
      {
        id: 'summarize',
        label: t('sugSummarizeT'),
        icon: <DocIcon />,
        run: close(() => onAction('summarize')),
      },
      {
        id: 'explain',
        label: t('sugExplainT'),
        icon: <SparkleIcon />,
        run: close(() => onAction('explain')),
      },
      {
        id: 'translate',
        label: t('sugTranslateT'),
        icon: <GlobeIcon />,
        run: close(() => onAction('translate')),
      },
      { id: 'clear', label: t('menuClear'), icon: <TrashIcon />, run: close(() => clear()) },
      {
        id: 'settings',
        label: t('menuSettings'),
        icon: <SettingsIcon />,
        run: close(() => onOpenSettings()),
      },
      {
        id: 'theme',
        label: t('cmdToggleTheme'),
        icon: theme === 'dark' ? <SunIcon /> : <MoonIcon />,
        run: close(() => update({ theme: theme === 'dark' ? 'light' : 'dark' })),
      },
    ];
  }, [t, theme, onAction, onOpenSettings, clear, update, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      className="cmdk-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="cmdk"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -14, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="cmdk-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder={t('cmdPlaceholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 ? (
            <div className="cmdk-empty">{t('cmdEmpty')}</div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                className={`cmdk-item${i === active ? ' active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={c.run}
              >
                <span className="cmdk-ico">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
