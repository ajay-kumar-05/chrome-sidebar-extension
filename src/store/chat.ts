import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, PageContext } from '@/lib/types';
import { MAX_MESSAGES, STORAGE_KEYS } from '@/lib/constants';

export interface Conversation {
  id: string;
  /** Auto-derived from the first user message; '' until then. */
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** Stable empty array so selectors don't churn referential identity. */
const EMPTY: Message[] = [];

function makeConversation(): Conversation {
  const now = Date.now();
  return { id: newId(), title: '', messages: [], createdAt: now, updatedAt: now };
}

/** First line of the first user message, trimmed to a short title. */
function deriveTitle(content: string): string {
  const text = content.replace(/\s+/g, ' ').trim();
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

export interface ChatState {
  conversations: Conversation[];
  activeId: string;
  isLoading: boolean;
  selectedText: string;
  currentPage: Pick<PageContext, 'title' | 'url'> | null;
  /** When true, messages are answered using retrieved page context (RAG). */
  pageGrounding: boolean;

  /** Append a message to the active conversation; returns its generated id. */
  addMessage: (
    message: Pick<Message, 'role' | 'content'> & Partial<Pick<Message, 'images'>>,
  ) => string;
  /** Replace the content of a message in the active conversation. */
  updateMessage: (id: string, content: string) => void;
  /** Remove a message from the active conversation. */
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedText: (text: string) => void;
  setCurrentPage: (page: Pick<PageContext, 'title' | 'url'> | null) => void;
  setPageGrounding: (on: boolean) => void;
  /** Empty the active conversation (keeps the thread). */
  clear: () => void;
  /** Start a fresh conversation and switch to it. */
  newConversation: () => void;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
}

/** Messages of the active conversation (use as a selector). */
export function activeMessages(s: ChatState): Message[] {
  return s.conversations.find((c) => c.id === s.activeId)?.messages ?? EMPTY;
}

/** Produce a new conversations array with the active one transformed by `fn`. */
function mapActive(state: ChatState, fn: (c: Conversation) => Conversation): Conversation[] {
  return state.conversations.map((c) => (c.id === state.activeId ? fn(c) : c));
}

const firstConversation = makeConversation();

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [firstConversation],
      activeId: firstConversation.id,
      isLoading: false,
      selectedText: '',
      currentPage: null,
      pageGrounding: false,

      addMessage: ({ role, content, images }) => {
        const id = newId();
        set((state) => ({
          conversations: mapActive(state, (c) => ({
            ...c,
            messages: [
              ...c.messages,
              { id, role, content, images, timestamp: Date.now() },
            ].slice(-MAX_MESSAGES),
            title: c.title || (role === 'user' && content ? deriveTitle(content) : c.title),
            updatedAt: Date.now(),
          })),
        }));
        return id;
      },

      updateMessage: (id, content) =>
        set((state) => ({
          conversations: mapActive(state, (c) => ({
            ...c,
            messages: c.messages.map((m) => (m.id === id ? { ...m, content } : m)),
          })),
        })),

      removeMessage: (id) =>
        set((state) => ({
          conversations: mapActive(state, (c) => ({
            ...c,
            messages: c.messages.filter((m) => m.id !== id),
          })),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setSelectedText: (selectedText) => set({ selectedText }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setPageGrounding: (pageGrounding) => set({ pageGrounding }),

      clear: () =>
        set((state) => ({
          conversations: mapActive(state, (c) => ({ ...c, messages: [], title: '' })),
        })),

      newConversation: () =>
        set((state) => {
          const convo = makeConversation();
          return { conversations: [convo, ...state.conversations], activeId: convo.id };
        }),

      switchConversation: (id) => set({ activeId: id }),

      deleteConversation: (id) =>
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          if (remaining.length === 0) {
            const convo = makeConversation();
            return { conversations: [convo], activeId: convo.id };
          }
          const activeId = state.activeId === id ? remaining[0].id : state.activeId;
          return { conversations: remaining, activeId };
        }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
        })),
    }),
    {
      name: STORAGE_KEYS.chat,
      version: 1,
      // Migrate the old single-thread shape ({ messages: [...] }) into a conversation.
      migrate: (persisted, version) => {
        const state = persisted as Partial<ChatState> & { messages?: Message[] };
        if (version < 1 && Array.isArray(state?.messages)) {
          const convo = makeConversation();
          convo.messages = state.messages;
          return { conversations: [convo], activeId: convo.id } as ChatState;
        }
        return state as ChatState;
      },
      // Persist conversations only; image attachments (base64) are stripped so a
      // few screenshots can't blow the ~5 MB localStorage quota.
      partialize: (state) => ({
        activeId: state.activeId,
        conversations: state.conversations.map((c) => ({
          ...c,
          messages: c.messages
            .slice(-MAX_MESSAGES)
            .map(({ id, role, content, timestamp }) => ({ id, role, content, timestamp })),
        })),
      }),
    },
  ),
);
