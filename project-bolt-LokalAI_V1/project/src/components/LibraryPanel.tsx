import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Bot,
  User,
  Trash2,
  Edit3,
  Download,
  Upload,
  Plus,
  Grid,
  List,
  Settings,
  Brain,
  Target,
  FileText,
  Zap,
  CheckCircle,
  Circle,
  TrendingUp,
  Clock,
  Users,
  Star,
  Sparkles
} from 'lucide-react';

import { ChatSession, Library, LibrarySection, ProjectGoal } from '../types';
import LibrarySettingsModal from './LibrarySettingsModal';
import CreateLibraryModal from './CreateLibraryModal';

interface LibraryPanelProps {
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
}

export default function LibraryPanel({
  sessions,
  onSessionSelect,
  onSessionDelete,
}: LibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'messages' | 'activity'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [showLibrarySettings, setShowLibrarySettings] = useState(false);
  const [showCreateLibrary, setShowCreateLibrary] = useState(false);
  const [expandedLibraries, setExpandedLibraries] = useState<string[]>([]);

  // Mock libraries data with enhanced project features
  const [libraries, setLibraries] = useState<Library[]>([
    {
      id: 'lib-1',
      name: 'Research Projects',
      description: 'AI research and paper analysis workspace',
      color: '#3B82F6',
      icon: '🔬',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      contextEnabled: true,
      version: '2.0',
      totalTokensUsed: 45000,
      lastContextUpdate: new Date(),
      projectContext: {
        systemPrompt: 'You are a research assistant specializing in AI and machine learning. Help analyze papers, extract insights, and track research progress.',
        modelPreferences: {
          defaultModel: 'llama2:13b',
          temperature: 0.3,
          maxTokens: 4096
        },
        goals: [
          {
            id: 'goal-1',
            text: 'Complete literature review on transformer architectures',
            completed: false,
            progress: 60,
            createdAt: new Date('2024-01-15'),
          },
          {
            id: 'goal-2',
            text: 'Analyze 10 recent papers on multimodal AI',
            completed: true,
            progress: 100,
            createdAt: new Date('2024-01-10'),
            completedAt: new Date('2024-01-20'),
          },
          {
            id: 'goal-3',
            text: 'Prepare research summary presentation',
            completed: false,
            progress: 25,
            createdAt: new Date('2024-01-20'),
          }
        ],
        autoSummarize: true,
        knowledgeBase: [
          {
            id: 'kb-1',
            name: 'attention_is_all_you_need.pdf',
            type: 'application/pdf',
            size: 2048000,
            content: 'Transformer architecture paper content...',
            uploadedAt: new Date('2024-01-05'),
            processed: true
          }
        ]
      },
      sections: [
        {
          id: 'sec-1',
          name: 'AI Papers',
          libraryId: 'lib-1',
          chatCount: 8,
          lastActivity: new Date(),
          contextSummary: 'Analyzed transformer architectures, attention mechanisms, and recent advances in language models.',
          sectionGoals: ['Review transformer papers', 'Extract key insights']
        },
        {
          id: 'sec-2',
          name: 'Experiments',
          libraryId: 'lib-1',
          chatCount: 12,
          lastActivity: new Date(Date.now() - 86400000),
          contextSummary: 'Conducted experiments on fine-tuning, evaluated model performance, and tested new architectures.',
          sectionGoals: ['Run baseline experiments', 'Compare model variants']
        },
        {
          id: 'sec-3',
          name: 'Reviews',
          libraryId: 'lib-1',
          chatCount: 4,
          lastActivity: new Date(Date.now() - 259200000),
          contextSummary: 'Peer review activities and paper critiques.',
          sectionGoals: ['Complete peer reviews']
        }
      ]
    },
    {
      id: 'lib-2',
      name: 'Client Work',
      description: 'Client projects and deliverables',
      color: '#10B981',
      icon: '💼',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      contextEnabled: true,
      version: '2.0',
      totalTokensUsed: 28000,
      lastContextUpdate: new Date(),
      projectContext: {
        systemPrompt: 'You are a professional consultant helping with client projects. Maintain confidentiality and focus on deliverable outcomes.',
        modelPreferences: {
          defaultModel: 'llama2:7b',
          temperature: 0.5,
          maxTokens: 2048
        },
        goals: [
          {
            id: 'goal-4',
            text: 'Complete Project Alpha requirements analysis',
            completed: true,
            progress: 100,
            createdAt: new Date('2024-01-16'),
            completedAt: new Date('2024-01-25'),
          },
          {
            id: 'goal-5',
            text: 'Deliver Project Beta MVP',
            completed: false,
            progress: 75,
            createdAt: new Date('2024-01-20'),
          }
        ],
        autoSummarize: true
      },
      sections: [
        {
          id: 'sec-4',
          name: 'Project Alpha',
          libraryId: 'lib-2',
          chatCount: 6,
          lastActivity: new Date(),
          contextSummary: 'Requirements gathering, stakeholder interviews, and technical specifications.',
          sectionGoals: ['Finalize requirements', 'Get stakeholder approval']
        },
        {
          id: 'sec-5',
          name: 'Project Beta',
          libraryId: 'lib-2',
          chatCount: 8,
          lastActivity: new Date(Date.now() - 43200000),
          contextSummary: 'MVP development, testing, and client feedback integration.',
          sectionGoals: ['Complete MVP', 'Conduct user testing']
        }
      ]
    },
    {
      id: 'lib-3',
      name: 'Personal Learning',
      description: 'Learning notes and skill development',
      color: '#8B5CF6',
      icon: '📚',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      contextEnabled: false,
      version: '1.0',
      sections: [
        {
          id: 'sec-6',
          name: 'Programming',
          libraryId: 'lib-3',
          chatCount: 15,
          lastActivity: new Date(),
        },
        {
          id: 'sec-7',
          name: 'Languages',
          libraryId: 'lib-3',
          chatCount: 7,
          lastActivity: new Date(Date.now() - 172800000),
        }
      ]
    }
  ]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = session.messages
      .filter(msg => msg.role === 'user')
      .pop();
    return lastUserMessage?.content.slice(0, 100) + '...' || 'No messages yet';
  };

  const toggleLibraryExpansion = (libraryId: string) => {
    setExpandedLibraries(prev =>
      prev.includes(libraryId)
        ? prev.filter(id => id !== libraryId)
        : [...prev, libraryId]
    );
  };

  const getCompletedGoalsCount = (goals?: ProjectGoal[]) => {
    if (!goals) return { completed: 0, total: 0 };
    return {
      completed: goals.filter(g => g.completed).length,
      total: goals.length
    };
  };

  const getAverageProgress = (goals?: ProjectGoal[]) => {
    if (!goals || goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / goals.length);
  };

  const handleLibrarySettings = (library: Library) => {
    setSelectedLibrary(library);
    setShowLibrarySettings(true);
  };

  const handleCreateLibrary = (newLibrary: Omit<Library, 'id' | 'createdAt' | 'updatedAt'>) => {
    const library: Library = {
      ...newLibrary,
      id: `lib-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setLibraries(prev => [library, ...prev]);
    setShowCreateLibrary(false);
  };

  const handleUpgradeLibrary = (libraryId: string) => {
    setLibraries(prev => prev.map(lib => 
      lib.id === libraryId 
        ? { 
            ...lib, 
            contextEnabled: true, 
            version: '2.0',
            projectContext: {
              systemPrompt: '',
              modelPreferences: {
                defaultModel: 'llama2:7b',
                temperature: 0.7,
                maxTokens: 2048
              },
              goals: [],
              autoSummarize: true,
              knowledgeBase: [],
              webSources: []
            }
          }
        : lib
    ));
  };

  const handleDeleteLibrary = (libraryId: string) => {
    if (confirm('Are you sure you want to delete this library? This action cannot be undone.')) {
      setLibraries(prev => prev.filter(lib => lib.id !== libraryId));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Library & Projects
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize chats with persistent context and goals
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateLibrary(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Library</span>
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? (
                <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search libraries and chats..."
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
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="messages">Sort by Messages</option>
            <option value="activity">Sort by Activity</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {libraries.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No libraries yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first library to organize your chats with powerful project features
            </p>
            <button 
              onClick={() => setShowCreateLibrary(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Create Your First Library</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {libraries.map((library) => {
                const isExpanded = expandedLibraries.includes(library.id);
                const goalStats = getCompletedGoalsCount(library.projectContext?.goals);
                const avgProgress = getAverageProgress(library.projectContext?.goals);
                
                return (
                  <motion.div
                    key={library.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Library Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${library.color}20`, color: library.color }}
                          >
                            {library.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {library.name}
                              </h3>
                              
                              {/* Enhanced indicators */}
                              {library.contextEnabled && (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                    <Brain className="w-3 h-3" />
                                    <span>Context</span>
                                  </div>
                                  
                                  {library.projectContext?.goals && (
                                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                                      <Target className="w-3 h-3" />
                                      <span>{goalStats.completed}/{goalStats.total}</span>
                                    </div>
                                  )}
                                  
                                  {library.projectContext?.knowledgeBase && library.projectContext.knowledgeBase.length > 0 && (
                                    <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                                      <FileText className="w-3 h-3" />
                                      <span>{library.projectContext.knowledgeBase.length}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {!library.contextEnabled && library.version === '1.0' && (
                                <button
                                  onClick={() => handleUpgradeLibrary(library.id)}
                                  className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Add project features</span>
                                </button>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {library.description}
                            </p>
                            
                            {/* Enhanced stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{library.sections.reduce((sum, section) => sum + section.chatCount, 0)} chats</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Updated {formatDate(library.updatedAt)}</span>
                              </div>
                              
                              {library.contextEnabled && library.totalTokensUsed && (
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>{(library.totalTokensUsed / 1000).toFixed(1)}k tokens</span>
                                </div>
                              )}
                              
                              {library.projectContext?.goals && avgProgress > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${avgProgress}%`,
                                        backgroundColor: library.color
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs">{avgProgress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {library.contextEnabled && (
                            <button
                              onClick={() => handleLibrarySettings(library)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Library settings"
                            >
                              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteLibrary(library.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                            title="Delete library"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleLibraryExpansion(library.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </motion.div>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 space-y-6">
                            {/* Goals Section */}
                            {library.projectContext?.goals && library.projectContext.goals.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                                  <Target className="w-4 h-4" />
                                  <span>Project Goals</span>
                                </h4>
                                <div className="space-y-2">
                                  {library.projectContext.goals.map((goal) => (
                                    <div key={goal.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                      {goal.completed ? (
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-gray-400" />
                                      )}
                                      <div className="flex-1">
                                        <p className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                          {goal.text}
                                        </p>
                                        {goal.progress !== undefined && !goal.completed && (
                                          <div className="flex items-center space-x-2 mt-1">
                                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                              <div
                                                className="h-1.5 rounded-full transition-all duration-300"
                                                style={{
                                                  width: `${goal.progress}%`,
                                                  backgroundColor: library.color
                                                }}
                                              />
                                            </div>
                                            <span className="text-xs text-gray-500">{goal.progress}%</span>
                                          </div>
                                        )}
                                      </div>
                                      {goal.completedAt && (
                                        <span className="text-xs text-gray-500">
                                          {formatDate(goal.completedAt)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Sections */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                                <FolderOpen className="w-4 h-4" />
                                <span>Sections</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {library.sections.map((section) => (
                                  <div
                                    key={section.id}
                                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {section.name}
                                      </h5>
                                      <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                                        {section.chatCount}
                                      </span>
                                    </div>
                                    
                                    {section.contextSummary && (
                                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                        {section.contextSummary}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{formatDate(section.lastActivity)}</span>
                                      {section.sectionGoals && section.sectionGoals.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Target className="w-3 h-3" />
                                          <span>{section.sectionGoals.length}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                
                                <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                                  <Plus className="w-4 h-4" />
                                  <span className="text-sm">Add Section</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Library Modal */}
      {showCreateLibrary && (
        <CreateLibraryModal
          onClose={() => setShowCreateLibrary(false)}
          onSave={handleCreateLibrary}
        />
      )}

      {/* Library Settings Modal */}
      {showLibrarySettings && selectedLibrary && (
        <LibrarySettingsModal
          library={selectedLibrary}
          onClose={() => {
            setShowLibrarySettings(false);
            setSelectedLibrary(null);
          }}
          onSave={(updatedLibrary) => {
            setLibraries(prev => prev.map(lib => 
              lib.id === updatedLibrary.id ? updatedLibrary : lib
            ));
            setShowLibrarySettings(false);
            setSelectedLibrary(null);
          }}
        />
      )}
    </div>
  );
}