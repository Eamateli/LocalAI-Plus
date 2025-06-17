import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Settings, FolderOpen, Code, Database, Zap } from 'lucide-react';

import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import SettingsPanel from './components/SettingsPanel';
import LibraryPanel from './components/LibraryPanel';
import { useLocalAI } from './hooks/useLocalAI';
import { ChatSession, Message } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'settings' | 'library'>('chat');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama2:7b');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { models, isLoading, sendMessage, streamResponse } = useLocalAI();

  // Create new chat session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      model: selectedModel,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId: null,
      settings: {}
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setCurrentView('chat');
  };

  // Update session messages
  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages, updatedAt: new Date() }
        : session
    ));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, messages, updatedAt: new Date() } : null);
    }
  };

  // Initialize with a default session
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView}
        onViewChange={setCurrentView}
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={setCurrentSession}
        onNewSession={createNewSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <Brain className="w-8 h-8 text-blue-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    LocalAI+
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Production-grade local LLM API
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center space-x-4">
              {currentView === 'chat' && (
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  isLoading={isLoading}
                />
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4" />
                <span>API Ready</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <ChatInterface
                  session={currentSession}
                  selectedModel={selectedModel}
                  onSendMessage={sendMessage}
                  onUpdateMessages={updateSessionMessages}
                  streamResponse={streamResponse}
                />
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <SettingsPanel />
              </motion.div>
            )}

            {currentView === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <LibraryPanel
                  sessions={sessions}
                  onSessionSelect={setCurrentSession}
                  onSessionDelete={(sessionId) => {
                    setSessions(prev => prev.filter(s => s.id !== sessionId));
                    if (currentSession?.id === sessionId) {
                      setCurrentSession(null);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;