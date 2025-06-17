import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Settings, FolderOpen, Code, Database, Zap, BookOpen, Target } from 'lucide-react';

import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import ModelSelector from './components/ModelSelector';
import SettingsPanel from './components/SettingsPanel';
import LibraryPanel from './components/LibraryPanel';
import LibraryIIPanel from './components/LibraryIIPanel';
import ProjectsPanel from './components/ProjectsPanel';
import SimpleChatList from './components/SimpleChatList';
import { useLocalAI } from './hooks/useLocalAI';
import { useLibraryContext } from './hooks/useLibraryContext';
import { ChatSession, Message, Library } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'simple-chat' | 'settings' | 'library' | 'library-ii' | 'projects'>('chat');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama2:7b');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLibrary, setCurrentLibrary] = useState<Library | null>(null);
  
  // Feature toggles from settings
  const [featuresEnabled, setFeaturesEnabled] = useState({
    library: true,
    libraryII: true,
    projects: true,
    simpleChat: false,
  });
  
  const { models, isLoading, sendMessage, streamResponse } = useLocalAI();
  const { 
    buildLibraryContext, 
    injectLibraryContext, 
    updateContextFromSession,
    getLibraryContext 
  } = useLibraryContext();

  // Create new chat session with optional library context
  const createNewSession = async (libraryId?: string, sectionId?: string) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      model: selectedModel,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId: null,
      settings: {},
      libraryId,
      sectionId
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setCurrentView('chat');

    // If this is a library chat, build context
    if (libraryId && currentLibrary?.contextEnabled) {
      await buildLibraryContext(currentLibrary, sessions);
    }
  };

  // Enhanced message sending with library context
  const handleSendMessage = async (messages: Message[], model: string) => {
    let enhancedMessages = messages;

    // Inject library context if available
    if (currentSession?.libraryId && currentLibrary?.contextEnabled) {
      const context = getLibraryContext(currentLibrary.id);
      if (context) {
        enhancedMessages = injectLibraryContext(messages, currentLibrary, context);
      }
    }

    return await sendMessage(enhancedMessages, model);
  };

  // Enhanced streaming with library context
  const handleStreamResponse = async function* (messages: Message[], model: string) {
    let enhancedMessages = messages;

    // Inject library context if available
    if (currentSession?.libraryId && currentLibrary?.contextEnabled) {
      const context = getLibraryContext(currentLibrary.id);
      if (context) {
        enhancedMessages = injectLibraryContext(messages, currentLibrary, context);
      }
    }

    yield* streamResponse(enhancedMessages, model);
  };

  // Update session messages with context awareness
  const updateSessionMessages = async (sessionId: string, messages: Message[]) => {
    const updatedSession = sessions.find(s => s.id === sessionId);
    
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages, updatedAt: new Date() }
        : session
    ));
    
    if (currentSession?.id === sessionId) {
      const newSession = { ...currentSession, messages, updatedAt: new Date() };
      setCurrentSession(newSession);

      // Update library context if this session is in a context-enabled library
      if (newSession.libraryId && currentLibrary?.contextEnabled) {
        await updateContextFromSession(newSession, currentLibrary);
      }
    }
  };

  // Handle feature toggles from settings
  const handleFeatureToggle = (feature: 'library' | 'libraryII' | 'projects' | 'simpleChat', enabled: boolean) => {
    setFeaturesEnabled(prev => ({ ...prev, [feature]: enabled }));
    
    // If disabling a feature and currently viewing it, switch to chat
    if (!enabled) {
      if ((feature === 'library' && currentView === 'library') ||
          (feature === 'libraryII' && currentView === 'library-ii') ||
          (feature === 'projects' && currentView === 'projects') ||
          (feature === 'simpleChat' && currentView === 'simple-chat')) {
        setCurrentView('chat');
      }
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
        onNewSession={() => createNewSession()}
        featuresEnabled={featuresEnabled}
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

              {/* Library Context Indicator */}
              {currentSession?.libraryId && currentLibrary?.contextEnabled && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <Brain className="w-4 h-4" />
                  <span>Using {currentLibrary.name} context</span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {(currentView === 'chat' || currentView === 'simple-chat') && (
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
                  onSendMessage={handleSendMessage}
                  onUpdateMessages={updateSessionMessages}
                  streamResponse={handleStreamResponse}
                />
              </motion.div>
            )}

            {currentView === 'simple-chat' && featuresEnabled.simpleChat && (
              <motion.div
                key="simple-chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex"
              >
                <div className="w-80 border-r border-gray-200 dark:border-gray-700">
                  <SimpleChatList
                    sessions={sessions}
                    currentSession={currentSession}
                    onSessionSelect={setCurrentSession}
                    onNewSession={() => createNewSession()}
                    onSessionDelete={(sessionId) => {
                      setSessions(prev => prev.filter(s => s.id !== sessionId));
                      if (currentSession?.id === sessionId) {
                        setCurrentSession(null);
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <ChatInterface
                    session={currentSession}
                    selectedModel={selectedModel}
                    onSendMessage={handleSendMessage}
                    onUpdateMessages={updateSessionMessages}
                    streamResponse={handleStreamResponse}
                  />
                </div>
              </motion.div>
            )}

            {currentView === 'library' && featuresEnabled.library && (
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

            {currentView === 'library-ii' && featuresEnabled.libraryII && (
              <motion.div
                key="library-ii"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <LibraryIIPanel
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

            {currentView === 'projects' && featuresEnabled.projects && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <ProjectsPanel
                  sessions={sessions}
                  onSessionSelect={setCurrentSession}
                  onSessionDelete={(sessionId) => {
                    setSessions(prev => prev.filter(s => s.id !== sessionId));
                    if (currentSession?.id === sessionId) {
                      setCurrentSession(null);
                    }
                  }}
                  onNewSession={createNewSession}
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
                <SettingsPanel
                  featuresEnabled={featuresEnabled}
                  onFeatureToggle={handleFeatureToggle}
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