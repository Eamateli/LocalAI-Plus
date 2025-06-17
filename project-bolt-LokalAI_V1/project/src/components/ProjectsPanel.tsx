import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  FileText,
  Brain,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Share2,
  Download,
  Upload,
  Folder,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Star,
  Bookmark,
  Settings,
  Zap,
  Globe,
  Code,
  Palette,
  Lightbulb,
  Rocket,
  BookOpen,
  Briefcase,
  GraduationCap,
  Home
} from 'lucide-react';

import { ChatSession } from '../types';
import CreateProjectModal from './CreateProjectModal';

interface ProjectsPanelProps {
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewSession: (libraryId?: string, sectionId?: string) => void;
}

// Mock projects data (Claude-style workspaces)
const initialMockProjects = [
  {
    id: 'proj-1',
    name: 'Data Analysis Workspace',
    description: 'Q4 customer behavior analysis and dashboard creation',
    icon: '📊',
    color: '#3B82F6',
    status: 'active',
    progress: 80,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    model: 'claude-3-sonnet',
    contextTokens: 15234,
    goals: [
      { id: 'g1', text: 'Clean and validate sales data', completed: true, progress: 100 },
      { id: 'g2', text: 'Identify customer segments', completed: true, progress: 100 },
      { id: 'g3', text: 'Create visualization dashboard', completed: false, progress: 60 },
      { id: 'g4', text: 'Generate final report', completed: false, progress: 0 }
    ],
    knowledgeBase: [
      { id: 'kb1', name: 'sales_data_q4.csv', size: '2.3 MB', type: 'csv' },
      { id: 'kb2', name: 'customer_requirements.md', size: '45 KB', type: 'markdown' },
      { id: 'kb3', name: 'analytics-dashboard.com/docs', size: 'External', type: 'url' }
    ],
    conversations: [
      { id: 'c1', title: 'Dashboard Layout Discussion', messages: 23, lastActivity: new Date() },
      { id: 'c2', title: 'Customer Segmentation Analysis', messages: 15, lastActivity: new Date(Date.now() - 86400000) },
      { id: 'c3', title: 'Data Cleaning Process', messages: 31, lastActivity: new Date(Date.now() - 172800000) }
    ],
    aiContext: "I'm helping you analyze Q4 sales data to build a customer segmentation dashboard. So far we've identified 3 main customer groups and cleaned the dataset. Next we need to create visualizations and prepare the final report."
  },
  {
    id: 'proj-2',
    name: 'AI Safety Research',
    description: 'Literature review and methodology design for AI alignment',
    icon: '🔬',
    color: '#10B981',
    status: 'active',
    progress: 45,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(Date.now() - 43200000),
    model: 'claude-3-opus',
    contextTokens: 28456,
    goals: [
      { id: 'g5', text: 'Complete literature review', completed: false, progress: 70 },
      { id: 'g6', text: 'Design research methodology', completed: false, progress: 30 },
      { id: 'g7', text: 'Identify key research questions', completed: true, progress: 100 },
      { id: 'g8', text: 'Prepare research proposal', completed: false, progress: 0 }
    ],
    knowledgeBase: [
      { id: 'kb4', name: 'ai_safety_papers.zip', size: '156 MB', type: 'archive' },
      { id: 'kb5', name: 'research_notes.md', size: '234 KB', type: 'markdown' },
      { id: 'kb6', name: 'alignment_forum_posts.pdf', size: '12 MB', type: 'pdf' }
    ],
    conversations: [
      { id: 'c4', title: 'Ethics Framework Discussion', messages: 42, lastActivity: new Date(Date.now() - 43200000) },
      { id: 'c5', title: 'Methodology Planning', messages: 28, lastActivity: new Date(Date.now() - 86400000) }
    ],
    aiContext: "I'm assisting with AI safety research, focusing on alignment problems and ethical frameworks. We've reviewed key literature and identified research gaps. Currently working on methodology design."
  },
  {
    id: 'proj-3',
    name: 'Website Redesign',
    description: 'Modern e-commerce platform redesign for client',
    icon: '💼',
    color: '#8B5CF6',
    status: 'planning',
    progress: 25,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(Date.now() - 172800000),
    model: 'claude-3-sonnet',
    contextTokens: 8923,
    goals: [
      { id: 'g9', text: 'Requirements gathering', completed: true, progress: 100 },
      { id: 'g10', text: 'Create wireframes', completed: false, progress: 40 },
      { id: 'g11', text: 'Design prototype', completed: false, progress: 0 },
      { id: 'g12', text: 'Client approval', completed: false, progress: 0 }
    ],
    knowledgeBase: [
      { id: 'kb7', name: 'wireframes.fig', size: '8.4 MB', type: 'figma' },
      { id: 'kb8', name: 'brand_guide.pdf', size: '3.2 MB', type: 'pdf' },
      { id: 'kb9', name: 'competitor_analysis.xlsx', size: '1.8 MB', type: 'excel' }
    ],
    conversations: [
      { id: 'c6', title: 'Client Requirements Meeting', messages: 18, lastActivity: new Date(Date.now() - 172800000) },
      { id: 'c7', title: 'Technical Architecture Planning', messages: 12, lastActivity: new Date(Date.now() - 259200000) }
    ],
    aiContext: "I'm helping design a modern e-commerce platform. We've gathered requirements and started wireframing. Focus is on user experience and conversion optimization."
  }
];

export default function ProjectsPanel({
  sessions,
  onSessionSelect,
  onSessionDelete,
  onNewSession,
}: ProjectsPanelProps) {
  const [projects, setProjects] = useState(initialMockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCompletedGoals = (goals: any[]) => {
    const completed = goals.filter(g => g.completed).length;
    return { completed, total: goals.length };
  };

  const handleCreateProject = (newProject: any) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateProject(false);
  };

  const renderProjectCard = (project: any) => (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => setSelectedProject(project.id)}
    >
      {/* Project Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${project.color}20`, color: project.color }}
            >
              {project.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {project.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span>Created {formatDate(project.createdAt)}</span>
                <span>{project.contextTokens.toLocaleString()} tokens</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm text-gray-500">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${project.progress}%`,
              backgroundColor: project.color
            }}
          />
        </div>
      </div>

      {/* Goals */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>Goals</span>
          </span>
          <span className="text-xs text-gray-500">
            {getCompletedGoals(project.goals).completed}/{getCompletedGoals(project.goals).total}
          </span>
        </div>
        <div className="space-y-2">
          {project.goals.slice(0, 3).map((goal: any) => (
            <div key={goal.id} className="flex items-center space-x-2">
              {goal.completed ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Circle className="w-3 h-3 text-gray-400" />
              )}
              <span className={`text-xs ${goal.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {goal.text}
              </span>
            </div>
          ))}
          {project.goals.length > 3 && (
            <span className="text-xs text-gray-500">+{project.goals.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <MessageSquare className="w-3 h-3" />
          <span>{project.conversations.length} chats</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{project.knowledgeBase.length} files</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );

  const renderProjectDetail = () => {
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Project Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedProject(null)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Projects
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${project.color}20`, color: project.color }}
            >
              {project.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {project.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {project.description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <span>Created {formatDate(project.createdAt)}</span>
                <span>Model: {project.model}</span>
                <span>Context: {project.contextTokens.toLocaleString()} tokens</span>
                <div className="flex items-center space-x-1">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color
                      }}
                    />
                  </div>
                  <span>{project.progress}% complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6 space-y-6">
          {/* Goals Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Project Goals</span>
              <span className="text-sm text-gray-500">
                ({getCompletedGoals(project.goals).completed}/{getCompletedGoals(project.goals).total})
              </span>
            </h3>
            <div className="space-y-3">
              {project.goals.map((goal: any) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                      {goal.text}
                    </p>
                    {goal.progress !== undefined && !goal.completed && (
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${goal.progress}%`,
                              backgroundColor: project.color
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{goal.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Base */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Knowledge Base</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Plus className="w-4 h-4" />
              </button>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.knowledgeBase.map((file: any) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Recent Conversations</span>
              <button
                onClick={() => onNewSession(project.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </h3>
            <div className="space-y-3">
              {project.conversations.map((conv: any) => (
                <div key={conv.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {conv.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatDate(conv.lastActivity)}</span>
                      <span>•</span>
                      <span>{conv.messages} messages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Context */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>AI Assistant Context</span>
            </h3>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {project.aiContext}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Target className="w-6 h-6" />
              <span>Projects - Claude-Style Workspaces</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Persistent context workspaces with goals, knowledge base, and AI memory
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {!selectedProject && (
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedProject ? (
          renderProjectDetail()
        ) : (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Create your first project workspace to get started'
                  }
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setShowCreateProject(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
                  >
                    <Target className="w-5 h-5" />
                    <span>Create Your First Project</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProjects.map(renderProjectCard)}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSave={handleCreateProject}
        />
      )}
    </div>
  );
}