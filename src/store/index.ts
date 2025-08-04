import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  pageUrl?: string;
  selectedText?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentPageUrl: string;
  selectedText: string;
  apiKey: string;
  model: string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPageUrl: (url: string) => void;
  setSelectedText: (text: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  clearMessages: () => void;
  removeMessage: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      currentPageUrl: '',
      selectedText: '',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setCurrentPageUrl: (url) => set({ currentPageUrl: url }),
      
      setSelectedText: (text) => set({ selectedText: text }),
      
      setApiKey: (key) => set({ apiKey: key }),
      
      setModel: (model) => set({ model }),
      
      clearMessages: () => set({ messages: [] }),
      
      removeMessage: (id) => set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id),
      })),
    }),
    {
      name: 'ai-sidebar-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        model: state.model,
        messages: state.messages.slice(-50), // Keep only last 50 messages
      }),
    }
  )
);

// UI State Store
export interface UIState {
  isSettingsOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  sidebarWidth: number;
  isCollapsed: boolean;
  setSettingsOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSidebarWidth: (width: number) => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      theme: 'auto',
      sidebarWidth: 400,
      isCollapsed: false,
      
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setTheme: (theme) => set({ theme }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'ai-sidebar-ui',
    }
  )
);
