import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, PageContext } from '@/lib/types';
import { MAX_MESSAGES, STORAGE_KEYS } from '@/lib/constants';

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedText: string;
  currentPage: Pick<PageContext, 'title' | 'url'> | null;
  /** Append a message and return its generated id (used to stream into it). */
  addMessage: (
    message: Pick<Message, 'role' | 'content'> & Partial<Pick<Message, 'images'>>,
  ) => string;
  /** Replace the content of an existing message (used for streaming deltas). */
  updateMessage: (id: string, content: string) => void;
  /** Remove a message by id (e.g. an empty assistant placeholder after abort). */
  removeMessage: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedText: (text: string) => void;
  setCurrentPage: (page: Pick<PageContext, 'title' | 'url'> | null) => void;
  clear: () => void;
}

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      selectedText: '',
      currentPage: null,

      addMessage: ({ role, content, images }) => {
        const id = newId();
        set((state) => ({
          messages: [
            ...state.messages,
            { id, role, content, images, timestamp: Date.now() },
          ].slice(-MAX_MESSAGES),
        }));
        return id;
      },

      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, content } : m)),
        })),

      removeMessage: (id) =>
        set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

      setLoading: (isLoading) => set({ isLoading }),
      setSelectedText: (selectedText) => set({ selectedText }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      clear: () => set({ messages: [] }),
    }),
    {
      name: STORAGE_KEYS.chat,
      // Only the conversation is worth persisting; transient flags are not.
      // Image attachments (base64 data URLs) are stripped so a few screenshots
      // can't blow the ~5 MB localStorage quota and break persistence.
      partialize: (state) => ({
        messages: state.messages
          .slice(-MAX_MESSAGES)
          .map(({ id, role, content, timestamp }) => ({ id, role, content, timestamp })),
      }),
    },
  ),
);
