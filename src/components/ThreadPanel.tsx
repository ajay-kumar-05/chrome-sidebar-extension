import { PlusIcon, TrashIcon } from './icons';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';

interface Props {
  onClose: () => void;
}

/** Conversation switcher: list, select, delete and start new chats. */
export default function ThreadPanel({ onClose }: Props) {
  const t = useT();
  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const switchConversation = useChat((s) => s.switchConversation);
  const deleteConversation = useChat((s) => s.deleteConversation);
  const newConversation = useChat((s) => s.newConversation);

  // Most recently updated first.
  const ordered = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div
      className="menu-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="menu thread-menu">
        <div className="thread-head">
          <span className="menu-label">{t('threads')}</span>
          <button
            className="thread-new"
            onClick={() => {
              newConversation();
              onClose();
            }}
          >
            <PlusIcon />
            {t('newChat')}
          </button>
        </div>

        <div className="thread-list">
          {ordered.map((c) => (
            <div
              key={c.id}
              className={`thread-item${c.id === activeId ? ' active' : ''}`}
              onClick={() => {
                switchConversation(c.id);
                onClose();
              }}
            >
              <span className="thread-title">{c.title || t('untitled')}</span>
              <button
                className="thread-del"
                title={t('deleteChatConfirm')}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(t('deleteChatConfirm'))) deleteConversation(c.id);
                }}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
