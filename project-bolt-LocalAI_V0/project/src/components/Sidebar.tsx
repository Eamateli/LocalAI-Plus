import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Settings,
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Edit3,
  Bot,
  Clock
} from 'lucide-react';

import { ChatSession } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentView: 'chat' | 'settings' | 'library';
  onViewChange: (view: 'chat' | 'settings' | 'library') => void;
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  currentView,
  onViewChange,
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const startEditing = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = (sessionId: string) => {
    // TODO: Update session title
    setEditingSession(null);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const menuItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      view: 'chat' as const,
    },
    {
      id: 'library',
      label: 'Library',
      icon: FolderOpen,
      view: 'library' as const,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      view: 'settings' as const,
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div
        animate={{ width: collapsed ? 80 : 320 }}
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                LocalAI+
              </motion.h2>
            )}
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === item.view
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Chat Sessions */}
        {currentView === 'chat' && !collapsed && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={onNewSession}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <AnimatePresence>
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2"
                  >
                    <div
                      className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSession?.id === session.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => onSessionSelect(session)}
                    >
                      <div className="flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingSession === session.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveTitle(session.id)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveTitle(session.id);
                              }
                            }}
                            className="w-full bg-transparent border-none outline-none text-sm font-medium"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(session.updatedAt)}</span>
                              <span>•</span>
                              <span>{session.messages.length} msgs</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(session);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Delete session
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredSessions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No chats found' : 'No chats yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs mt-1">Create your first chat to get started</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed New Chat */}
        {currentView === 'chat' && collapsed && (
          <div className="p-2">
            <button
              onClick={onNewSession}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}