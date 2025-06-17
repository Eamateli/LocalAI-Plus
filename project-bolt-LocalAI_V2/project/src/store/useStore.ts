import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  context_length: number;
  max_tokens: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  embedding_model: boolean;
}

interface Settings {
  apiKey: string;
  apiUrl: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
}

interface Store {
  // UI State
  darkMode: boolean;
  sidebarCollapsed: boolean;
  
  // Chat State
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  
  // Models
  models: Model[];
  selectedModel: string;
  
  // Settings
  settings: Settings;
  
  // Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  
  // Chat Actions
  createChat: (model?: string) => string;
  deleteChat: (chatId: string) => void;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  
  // Model Actions
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: string) => void;
  
  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      darkMode: false,
      sidebarCollapsed: false,
      chats: [],
      currentChatId: null,
      isLoading: false,
      models: [],
      selectedModel: 'llama2',
      settings: {
        apiKey: 'sk-dev-key',
        apiUrl: 'http://localhost:8000/v1',
        temperature: 0.7,
        maxTokens: 2048,
        streamingEnabled: true,
      },
      
      // Actions
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      createChat: (model) => {
        const chatId = `chat-${Date.now()}`;
        const newChat: Chat = {
          id: chatId,
          title: 'New Chat',
          messages: [],
          model: model || get().selectedModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: chatId,
        }));
        
        return chatId;
      },
      
      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },
      
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      
      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
        };
        
        set((state) => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? { 
                  ...chat, 
                  messages: [...chat.messages, newMessage],
                  title: chat.messages.length === 0 ? message.content.slice(0, 30) + '...' : chat.title,
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));
      },
      
      updateMessage: (chatId, messageId, content) => {
        set((state) => ({
          chats: state.chats.map(chat => 
            chat.id === chatId 
              ? {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));
      },
      
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      updateSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'localai-plus-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        chats: state.chats,
        selectedModel: state.selectedModel,
        settings: state.settings,
      }),
    }
  )
);