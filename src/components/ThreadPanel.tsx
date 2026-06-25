import { PlusIcon, TrashIcon } from './icons';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';
import { useDialog } from './Dialog';

interface Props {
  onClose: () => void;
}

/** Conversation switcher: list, select, delete and start new chats. */
export default function ThreadPanel({ onClose }: Props) {
  const t = useT();
  const dialog = useDialog();
  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const switchConversation = useChat((s) => s.switchConversation);
  const deleteConversation = useChat((s) => s.deleteConversation);
  const newConversation = useChat((s) => s.newConversation);

  // Most recently updated first.
  const ordered = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  // A chat only counts as a "record" once it has messages, so an empty
  // active/new chat never shows up on its own as something to delete.
  const hasRecords = conversations.some((c) => c.messages.length > 0);

  const onDelete = async (id: string) => {
    const ok = await dialog.confirm({
      title: t('deleteChatTitle'),
      message: t('deleteChatConfirm'),
      confirmLabel: t('delete'),
      cancelLabel: t('cancel'),
      tone: 'danger',
    });
    if (ok) deleteConversation(id);
  };

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
          {!hasRecords ? (
            <div className="thread-empty">{t('noRecords')}</div>
          ) : (
            ordered.map((c) => {
              const isActiveEmpty = c.id === activeId && c.messages.length === 0;
              return (
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
                    title={t('deleteChatTitle')}
                    disabled={isActiveEmpty}
                    onClick={(e) => {
                      e.stopPropagation();
                      void onDelete(c.id);
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
