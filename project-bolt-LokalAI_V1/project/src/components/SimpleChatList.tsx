import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit3,
  Bot,
  Clock,
  User,
  MoreHorizontal,
  Star,
  Archive,
  Download,
  Filter,
  SortAsc
} from 'lucide-react';

import { ChatSession } from '../types';

interface SimpleChatListProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onSessionDelete?: (sessionId: string) => void;
}

export default function SimpleChatList({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
}: SimpleChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'messages'>('date');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).filter(session => 
    !showStarredOnly || session.isStarred
  );

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'messages':
        return b.messages.length - a.messages.length;
      case 'date':
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });

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

  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = session.messages
      .filter(msg => msg.role === 'user')
      .pop();
    return lastUserMessage?.content.slice(0, 60) + '...' || 'No messages yet';
  };

  const toggleStarred = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Toggle starred status
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Simple Chat List</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Original basic chat functionality without library organization
            </p>
          </div>
          
          <button
            onClick={onNewSession}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="messages">Sort by Messages</option>
            </select>
            
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`p-2 rounded-lg transition-colors ${
                showStarredOnly
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={showStarredOnly ? 'Show all chats' : 'Show starred only'}
            >
              <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first chat to get started'
              }
            </p>
            {!searchQuery && (
              <button 
                onClick={onNewSession}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Start Your First Chat</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
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
                          className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-white"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {session.title}
                            </h4>
                            {session.isStarred && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                            {getSessionPreview(session)}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(session.updatedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{session.messages.length} messages</span>
                            </div>
                            {session.model && (
                              <div className="flex items-center space-x-1">
                                <Bot className="w-3 h-3" />
                                <span>{session.model}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => toggleStarred(session.id, e)}
                          className={`p-1.5 rounded transition-colors ${
                            session.isStarred
                              ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                              : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          title={session.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-3 h-3 ${session.isStarred ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(session);
                          }}
                          className="p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Edit title"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSessionDelete && confirm('Are you sure you want to delete this chat?')) {
                              onSessionDelete(session.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded transition-colors"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {currentSession?.id === session.id && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{sessions.length} total chats</span>
          <span>{sessions.filter(s => s.isStarred).length} starred</span>
          <span>{sessions.reduce((sum, s) => sum + s.messages.length, 0)} messages</span>
        </div>
      </div>
    </div>
  );
}