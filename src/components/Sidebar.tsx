import { useState } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import UserMenu from './UserMenu';
import SettingsModal from './SettingsModal';
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

  return (
    <div className="container">
      <Header onAvatarClick={() => setMenuOpen(true)} />
      <MessageList onAction={onAction} />
      <ChatInput onSend={onSend} onStop={onStop} />

      {menuOpen && (
        <UserMenu onClose={() => setMenuOpen(false)} onOpenSettings={() => setSettingsOpen(true)} />
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
