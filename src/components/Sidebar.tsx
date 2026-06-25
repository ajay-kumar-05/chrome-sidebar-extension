import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import UserMenu from './UserMenu';
import SettingsModal from './SettingsModal';
import CommandPalette from './CommandPalette';
import type { QuickAction } from '@/lib/types';

interface Props {
  onSend: (text: string, images?: string[]) => void;
  onStop: () => void;
  onAction: (action: QuickAction, text?: string, targetLang?: string) => void;
}

/** Main sidebar view shown once the user has configured a connection. */
export default function Sidebar({ onSend, onStop, onAction }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="container">
      <Header onAvatarClick={() => setMenuOpen(true)} />
      <MessageList onAction={onAction} />
      <ChatInput onSend={onSend} onStop={onStop} />

      {menuOpen && (
        <UserMenu onClose={() => setMenuOpen(false)} onOpenSettings={() => setSettingsOpen(true)} />
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      <AnimatePresence>
        {paletteOpen && (
          <CommandPalette
            onClose={() => setPaletteOpen(false)}
            onAction={onAction}
            onOpenSettings={() => {
              setPaletteOpen(false);
              setSettingsOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
