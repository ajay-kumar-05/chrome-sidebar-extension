import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, PageContext } from '@/lib/types';

const MAX_MESSAGES = 50;

let idCounter = 0;
const newId = () => `${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedText: string;
  currentPage: Pick<PageContext, 'title' | 'url'> | null;
  addMessage: (message: Pick<Message, 'role' | 'content'> & Partial<Pick<Message, 'images'>>) => void;
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

      addMessage: ({ role, content, images }) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: newId(), role, content, images, timestamp: Date.now() },
          ].slice(-MAX_MESSAGES),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setSelectedText: (selectedText) => set({ selectedText }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      clear: () => set({ messages: [] }),
    }),
    {
      name: 'ai-sidebar-chat',
      // Only the conversation is worth persisting; transient flags are not.
      partialize: (state) => ({ messages: state.messages.slice(-MAX_MESSAGES) }),
    },
  ),
);
