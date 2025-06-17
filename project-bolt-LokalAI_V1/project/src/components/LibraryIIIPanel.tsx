import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Search, Filter, MoreHorizontal, Edit3, Trash2, Copy, Move, MessageSquare, Clock, ChevronDown, ChevronRight, Folder, FileText, Star, Tag, Archive, Download, Upload, Settings, Zap, Brain, Target, Users, TrendingUp, BarChart3, Grid, List, SortAsc, Eye, BookOpen, Layers, Link2, Sparkles, ArrowRight, CheckCircle, Circle, Calendar, Hash, CircleDot as DragHandleDots2 } from 'lucide-react';

import { ChatSession } from '../types';
import CreateLibraryModal from './CreateLibraryModal';

interface LibraryIIIPanelProps {
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
}

// Enhanced Library III data structures
interface LibraryIII {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  sections: LibrarySectionIII[];
  totalChats: number;
  tags: string[];
  isStarred: boolean;
  lastActivity: Date;
  usage: {
    totalMessages: number;
    averageSessionLength: number;
    mostActiveSection: string;
  };
}

interface LibrarySectionIII {
  id: string;
  name: string;
  libraryId: string;
  chatIds: string[];
  createdAt: Date;
  color?: string;
  description?: string;
  isCollapsed: boolean;
  tags: string[];
  lastActivity: Date;
  usage: {
    totalMessages: number;
    averageSessionLength: number;
  };
}

// Mock data for Library III with comprehensive examples
const mockLibrariesIII: LibraryIII[] = [
  {
    id: 'lib3-1',
    name: 'AI Research Hub',
    description: 'Comprehensive AI research and development workspace',
    color: '#3B82F6',
    icon: '🧠',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    totalChats: 47,
    tags: ['research', 'ai', 'machine-learning'],
    isStarred: true,
    lastActivity: new Date(),
    usage: {
      totalMessages: 1247,
      averageSessionLength: 26,
      mostActiveSection: 'Model Analysis'
    },
    sections: [
      {
        id: 'sec3-1',
        name: 'Model Analysis',
        libraryId: 'lib3-1',
        chatIds: ['chat-1', 'chat-2', 'chat-3', 'chat-4', 'chat-5'],
        createdAt: new Date('2024-01-02'),
        color: '#3B82F6',
        description: 'Deep analysis of AI models and architectures',
        isCollapsed: false,
        tags: ['models', 'analysis', 'performance'],
        lastActivity: new Date(),
        usage: {
          totalMessages: 523,
          averageSessionLength: 31
        }
      },
      {
        id: 'sec3-2',
        name: 'Benchmarking',
        libraryId: 'lib3-1',
        chatIds: ['chat-6', 'chat-7'],
        createdAt: new Date('2024-01-05'),
        color: '#10B981',
        description: 'Performance benchmarks and comparisons',
        isCollapsed: false,
        tags: ['benchmarks', 'performance', 'testing'],
        lastActivity: new Date(Date.now() - 86400000),
        usage: {
          totalMessages: 234,
          averageSessionLength: 18
        }
      },
      {
        id: 'sec3-3',
        name: 'Future Trends',
        libraryId: 'lib3-1',
        chatIds: ['chat-8', 'chat-9', 'chat-10'],
        createdAt: new Date('2024-01-10'),
        color: '#8B5CF6',
        description: 'Emerging trends and future predictions',
        isCollapsed: true,
        tags: ['trends', 'future', 'predictions'],
        lastActivity: new Date(Date.now() - 172800000),
        usage: {
          totalMessages: 156,
          averageSessionLength: 22
        }
      }
    ]
  },
  {
    id: 'lib3-2',
    name: 'Business Intelligence',
    description: 'Strategic business analysis and market research',
    color: '#10B981',
    icon: '📊',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(Date.now() - 43200000),
    totalChats: 28,
    tags: ['business', 'strategy', 'analysis'],
    isStarred: false,
    lastActivity: new Date(Date.now() - 43200000),
    usage: {
      totalMessages: 892,
      averageSessionLength: 32,
      mostActiveSection: 'Market Analysis'
    },
    sections: [
      {
        id: 'sec3-4',
        name: 'Market Analysis',
        libraryId: 'lib3-2',
        chatIds: ['chat-11', 'chat-12', 'chat-13'],
        createdAt: new Date('2024-01-16'),
        color: '#10B981',
        description: 'Market research and competitive analysis',
        isCollapsed: false,
        tags: ['market', 'competition', 'research'],
        lastActivity: new Date(Date.now() - 43200000),
        usage: {
          totalMessages: 445,
          averageSessionLength: 35
        }
      },
      {
        id: 'sec3-5',
        name: 'Strategy Planning',
        libraryId: 'lib3-2',
        chatIds: ['chat-14', 'chat-15'],
        createdAt: new Date('2024-01-20'),
        color: '#F59E0B',
        description: 'Strategic planning and roadmap development',
        isCollapsed: false,
        tags: ['strategy', 'planning', 'roadmap'],
        lastActivity: new Date(Date.now() - 86400000),
        usage: {
          totalMessages: 267,
          averageSessionLength: 28
        }
      }
    ]
  },
  {
    id: 'lib3-3',
    name: 'Technical Deep Dives',
    description: 'Advanced technical discussions and implementation details',
    color: '#EF4444',
    icon: '🛠️',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(Date.now() - 172800000),
    totalChats: 19,
    tags: ['technical', 'implementation', 'architecture'],
    isStarred: false,
    lastActivity: new Date(Date.now() - 172800000),
    usage: {
      totalMessages: 634,
      averageSessionLength: 33,
      mostActiveSection: 'System Architecture'
    },
    sections: [
      {
        id: 'sec3-6',
        name: 'System Architecture',
        libraryId: 'lib3-3',
        chatIds: ['chat-16', 'chat-17', 'chat-18'],
        createdAt: new Date('2024-02-02'),
        color: '#EF4444',
        description: 'System design and architectural patterns',
        isCollapsed: false,
        tags: ['architecture', 'design', 'patterns'],
        lastActivity: new Date(Date.now() - 172800000),
        usage: {
          totalMessages: 378,
          averageSessionLength: 42
        }
      },
      {
        id: 'sec3-7',
        name: 'Implementation Details',
        libraryId: 'lib3-3',
        chatIds: ['chat-19'],
        createdAt: new Date('2024-02-05'),
        color: '#8B5CF6',
        description: 'Detailed implementation discussions',
        isCollapsed: false,
        tags: ['implementation', 'code', 'details'],
        lastActivity: new Date(Date.now() - 259200000),
        usage: {
          totalMessages: 156,
          averageSessionLength: 24
        }
      }
    ]
  }
];

export default function LibraryIIIPanel({
  sessions,
  onSessionSelect,
  onSessionDelete,
}: LibraryIIIPanelProps) {
  const [libraries, setLibraries] = useState<LibraryIII[]>(mockLibrariesIII);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'chats' | 'created'>('activity');
  const [filterBy, setFilterBy] = useState<'all' | 'starred' | 'recent'>('all');
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  const [draggedChat, setDraggedChat] = useState<string | null>(null);
  const [expandedLibraries, setExpandedLibraries] = useState<string[]>(['lib3-1', 'lib3-2']);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const toggleLibraryExpansion = (libraryId: string) => {
    setExpandedLibraries(prev =>
      prev.includes(libraryId)
        ? prev.filter(id => id !== libraryId)
        : [...prev, libraryId]
    );
  };

  const toggleSectionCollapse = (libraryId: string, sectionId: string) => {
    setLibraries(prev => prev.map(lib =>
      lib.id === libraryId
        ? {
            ...lib,
            sections: lib.sections.map(section =>
              section.id === sectionId
                ? { ...section, isCollapsed: !section.isCollapsed }
                : section
            )
          }
        : lib
    ));
  };

  const handleCreateLibrary = (newLibrary: any) => {
    const library: LibraryIII = {
      id: `lib3-${Date.now()}`,
      name: newLibrary.name,
      description: newLibrary.description,
      color: newLibrary.color,
      icon: newLibrary.icon,
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: [],
      totalChats: 0,
      tags: [],
      isStarred: false,
      lastActivity: new Date(),
      usage: {
        totalMessages: 0,
        averageSessionLength: 0,
        mostActiveSection: ''
      }
    };
    
    setLibraries(prev => [library, ...prev]);
    setShowCreateLibrary(false);
  };

  const createNewSection = (libraryId: string, sectionName: string) => {
    const newSection: LibrarySectionIII = {
      id: `sec3-${Date.now()}`,
      name: sectionName,
      libraryId,
      chatIds: [],
      createdAt: new Date(),
      isCollapsed: false,
      tags: [],
      lastActivity: new Date(),
      usage: {
        totalMessages: 0,
        averageSessionLength: 0
      }
    };

    setLibraries(prev => prev.map(lib =>
      lib.id === libraryId
        ? { ...lib, sections: [...lib.sections, newSection] }
        : lib
    ));
  };

  const addChatToSection = (chatId: string, sectionId: string) => {
    setLibraries(prev => prev.map(lib => ({
      ...lib,
      sections: lib.sections.map(section =>
        section.id === sectionId
          ? { ...section, chatIds: [...section.chatIds, chatId] }
          : section
      )
    })));
  };

  const removeChatFromSection = (chatId: string, sectionId: string) => {
    setLibraries(prev => prev.map(lib => ({
      ...lib,
      sections: lib.sections.map(section =>
        section.id === sectionId
          ? { ...section, chatIds: section.chatIds.filter(id => id !== chatId) }
          : section
      )
    })));
  };

  const filteredLibraries = libraries.filter(library => {
    const matchesSearch = library.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         library.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         library.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'starred' && library.isStarred) ||
                         (filterBy === 'recent' && (Date.now() - library.lastActivity.getTime()) < 86400000);
    
    return matchesSearch && matchesFilter;
  });

  const sortedLibraries = [...filteredLibraries].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'activity':
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      case 'chats':
        return b.totalChats - a.totalChats;
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return 0;
    }
  });

  const renderLibraryCard = (library: LibraryIII) => {
    const isExpanded = expandedLibraries.includes(library.id);
    
    return (
      <motion.div
        key={library.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
      >
        {/* Library Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl relative"
                style={{ backgroundColor: `${library.color}20`, color: library.color }}
              >
                {library.icon}
                {library.isStarred && (
                  <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {library.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {library.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {library.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {library.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Folder className="w-4 h-4" />
                    <span>{library.sections.length} sections</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{library.totalChats} chats</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(library.lastActivity)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{library.usage.totalMessages} messages</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setLibraries(prev => prev.map(lib =>
                    lib.id === library.id ? { ...lib, isStarred: !lib.isStarred } : lib
                  ));
                }}
                className={`p-2 rounded-lg transition-colors ${
                  library.isStarred
                    ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Star className={`w-4 h-4 ${library.isStarred ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              
              <button
                onClick={() => toggleLibraryExpansion(library.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Library Stats */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {library.usage.averageSessionLength}
              </p>
              <p className="text-xs text-gray-500">Avg Session Length</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {library.usage.totalMessages}
              </p>
              <p className="text-xs text-gray-500">Total Messages</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {library.sections.length}
              </p>
              <p className="text-xs text-gray-500">Active Sections</p>
            </div>
          </div>
        </div>

        {/* Expanded Sections */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Sections */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4" />
                      <span>Sections ({library.sections.length})</span>
                    </h4>
                    <button
                      onClick={() => {
                        const sectionName = prompt('Enter section name:');
                        if (sectionName) {
                          createNewSection(library.id, sectionName);
                        }
                      }}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {library.sections.map((section) => (
                      <div
                        key={section.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleSectionCollapse(library.id, section.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              {section.isCollapsed ? (
                                <ChevronRight className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                            
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: section.color || library.color }}
                            />
                            
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                {section.name}
                              </h5>
                              {section.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{section.chatIds.length} chats</span>
                            <span>{formatDate(section.lastActivity)}</span>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Section Content */}
                        {!section.isCollapsed && (
                          <div className="p-3 space-y-2">
                            {section.chatIds.length > 0 ? (
                              section.chatIds.map((chatId, index) => (
                                <div
                                  key={chatId}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group"
                                  draggable
                                  onDragStart={() => setDraggedChat(chatId)}
                                  onDragEnd={() => setDraggedChat(null)}
                                >
                                  <DragHandleDots2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <MessageSquare className="w-4 h-4 text-gray-400" />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">
                                      Chat: {section.name} Discussion {index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Last activity: {formatDate(new Date(Date.now() - Math.random() * 86400000))}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                      title="Edit chat"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button 
                                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                                      title="Remove from section"
                                      onClick={() => removeChatFromSection(chatId, section.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No chats in this section</p>
                                <p className="text-xs">Drag chats here to organize them</p>
                              </div>
                            )}
                            
                            {/* Drop Zone */}
                            <div 
                              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedChat) {
                                  addChatToSection(draggedChat, section.id);
                                  setDraggedChat(null);
                                }
                              }}
                              onClick={() => {
                                // Simulate adding a chat from the main chat list
                                const mockChatId = `chat-${Date.now()}`;
                                addChatToSection(mockChatId, section.id);
                              }}
                            >
                              <Plus className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                              <p className="text-xs text-gray-500">Drop chats here or click to add</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Brain className="w-3 h-3" />
                      <span>AI Organize</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Library Management System</span>
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create custom libraries, organize into sections, and drag & drop chats for perfect organization
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateLibrary(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Library</span>
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search libraries, sections, and chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="activity">Sort by Activity</option>
          <option value="name">Sort by Name</option>
          <option value="chats">Sort by Chat Count</option>
          <option value="created">Sort by Created</option>
        </select>
        
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as any)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Libraries</option>
          <option value="starred">Starred Only</option>
          <option value="recent">Recent Activity</option>
        </select>
      </div>

      {/* Content */}
      {sortedLibraries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {searchQuery ? 'No libraries found' : 'No libraries yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search terms or filters'
              : 'Create your first library to organize your conversations'
            }
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setShowCreateLibrary(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Your First Library</span>
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'space-y-6' : 'space-y-4'}>
          <AnimatePresence>
            {sortedLibraries.map(renderLibraryCard)}
          </AnimatePresence>
        </div>
      )}

      {/* Available Chats Sidebar */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 max-h-96 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span>Available Chats</span>
        </h4>
        <div className="space-y-2">
          {sessions.slice(0, 8).map((session, index) => (
            <div
              key={session.id}
              className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              draggable
              onDragStart={() => setDraggedChat(session.id)}
              onDragEnd={() => setDraggedChat(null)}
            >
              <div className="flex items-center space-x-2">
                <DragHandleDots2 className="w-3 h-3 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.messages.length} messages
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Drag chats to organize them into sections
        </p>
      </div>

      {/* Create Library Modal */}
      {showCreateLibrary && (
        <CreateLibraryModal
          onClose={() => setShowCreateLibrary(false)}
          onSave={handleCreateLibrary}
        />
      )}
    </div>
  );
}