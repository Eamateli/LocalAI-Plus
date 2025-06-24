import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../api/chat';

interface AppState {
  apiKey: string;
  selectedModel: string;
  chatHistory: ChatMessage[];
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  addMessage: (message: ChatMessage) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set: (fn: (state: AppState) => Partial<AppState> | AppState) => void) => ({
      apiKey: '',
      selectedModel: 'llama-3.2-1b-instruct',
      chatHistory: [],
      setApiKey: (key: string) => set((state: AppState) => ({ ...state, apiKey: key })),
      setModel: (model: string) => set((state: AppState) => ({ ...state, selectedModel: model })),
      addMessage: (message: ChatMessage) => set((state: AppState) => ({
        chatHistory: [...state.chatHistory, message]
      }))
    }),
    {
      name: 'localai-storage',
      partialize: (state: AppState) => ({ apiKey: state.apiKey, selectedModel: state.selectedModel })
    }
  )
);