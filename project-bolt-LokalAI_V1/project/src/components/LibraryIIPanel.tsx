import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Brain,
  TrendingUp,
  Network,
  Search,
  Filter,
  Zap,
  Target,
  Link,
  Eye,
  MessageSquare,
  Clock,
  Tag,
  Map,
  Lightbulb,
  GitBranch,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Settings,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Bookmark,
  Share2,
  Copy,
  FolderOpen,
  BookOpen
} from 'lucide-react';

import { ChatSession } from '../types';
import LibraryIIIPanel from './LibraryIIIPanel';

interface LibraryIIPanelProps {
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onSessionDelete: (sessionId: string) => void;
}

// Mock data for Library II advanced features
const mockAnalytics = {
  totalConversations: 247,
  knowledgeDomains: 12,
  trendingTopics: ['AI Ethics', 'Local Models', 'RAG Systems', 'Prompt Engineering'],
  growthRate: 15,
  averageSessionLength: 23,
  topCategories: [
    { name: 'AI Research', count: 89, growth: 12 },
    { name: 'Technical Implementation', count: 67, growth: 8 },
    { name: 'Business Strategy', count: 45, growth: 15 },
    { name: 'Learning & Development', count: 46, growth: 22 }
  ]
};

const mockRecommendations = [
  {
    id: 'rec-1',
    type: 'organize',
    title: 'Move 3 chats to AI Research > Model Analysis',
    description: 'Found conversations about transformer architectures that belong in your research section',
    confidence: 0.92,
    action: 'Move chats'
  },
  {
    id: 'rec-2',
    type: 'link',
    title: 'Link related conversations about RAG systems',
    description: 'Detected 5 conversations discussing similar RAG implementation topics',
    confidence: 0.87,
    action: 'Create links'
  },
  {
    id: 'rec-3',
    type: 'create',
    title: 'Create new section: "Prompt Engineering"',
    description: 'You have 8 conversations about prompt optimization that could be grouped',
    confidence: 0.94,
    action: 'Create section'
  },
  {
    id: 'rec-4',
    type: 'merge',
    title: 'Merge duplicate discussions on fine-tuning',
    description: 'Found similar conversations that could be consolidated',
    confidence: 0.78,
    action: 'Merge content'
  }
];

const mockKnowledgeMap = {
  nodes: [
    { id: 'ai-research', label: 'AI Research', size: 89, color: '#3B82F6' },
    { id: 'technical-impl', label: 'Technical Implementation', size: 67, color: '#10B981' },
    { id: 'business-strategy', label: 'Business Strategy', size: 45, color: '#F59E0B' },
    { id: 'learning-dev', label: 'Learning & Development', size: 46, color: '#8B5CF6' }
  ],
  connections: [
    { from: 'ai-research', to: 'technical-impl', strength: 0.8 },
    { from: 'technical-impl', to: 'business-strategy', strength: 0.6 },
    { from: 'ai-research', to: 'learning-dev', strength: 0.7 },
    { from: 'business-strategy', to: 'learning-dev', strength: 0.5 }
  ]
};

export default function LibraryIIPanel({
  sessions,
  onSessionSelect,
  onSessionDelete,
}: LibraryIIPanelProps) {
  const [activeView, setActiveView] = useState<'analytics' | 'discovery' | 'knowledge-map' | 'recommendations' | 'library-iii'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(true);

  const viewTabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'discovery', label: 'Discovery', icon: Search },
    { id: 'knowledge-map', label: 'Knowledge Map', icon: Network },
    { id: 'recommendations', label: 'AI Suggestions', icon: Lightbulb },
    { id: 'library-iii', label: 'Library Management', icon: BookOpen }
  ];

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalConversations}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+{mockAnalytics.growthRate}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Knowledge Domains</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.knowledgeDomains}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Active domains</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Session Length</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.averageSessionLength}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">messages per chat</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Insights</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">auto-generated</span>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Trending Topics</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockAnalytics.trendingTopics.map((topic, index) => (
            <span
              key={topic}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
            >
              #{topic}
            </span>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Layers className="w-5 h-5" />
          <span>Knowledge Categories</span>
        </h3>
        <div className="space-y-4">
          {mockAnalytics.topCategories.map((category) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count} chats</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(category.count / mockAnalytics.totalConversations) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{category.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDiscoveryView = () => (
    <div className="space-y-6">
      {/* Advanced Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Advanced Discovery</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by meaning, concepts, or relationships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={semanticSearchEnabled}
                  onChange={(e) => setSemanticSearchEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Semantic Search</span>
              </label>
              <span className="text-xs text-gray-500">Search by meaning, not just keywords</span>
            </div>
            <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Concept Clustering</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Group similar ideas and concepts across conversations
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Explore clusters →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <GitBranch className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Topic Evolution</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Track how ideas and topics develop over time
          </p>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            View timeline →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Link className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Relationship Mapping</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Find connections between different conversations
          </p>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Map connections →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-orange-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Knowledge Gaps</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Identify missing information and research opportunities
          </p>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Find gaps →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Tag className="w-6 h-6 text-red-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Tagging</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            AI-generated tags based on conversation content
          </p>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            View tags →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Smart Suggestions</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            AI-powered recommendations for organization
          </p>
          <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
            Get suggestions →
          </button>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeMapView = () => (
    <div className="space-y-6">
      {/* Knowledge Map Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Knowledge Network</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mock Knowledge Map */}
        <div className="relative h-96 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <div className="text-center">
            <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Interactive Knowledge Map
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Visual representation of topic connections and relationships
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {mockKnowledgeMap.nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  style={{ borderLeftColor: node.color, borderLeftWidth: '4px' }}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {node.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {node.size} conversations
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Strongest Connections</span>
          </h4>
          <div className="space-y-3">
            {mockKnowledgeMap.connections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {mockKnowledgeMap.nodes.find(n => n.id === connection.from)?.label} ↔ {mockKnowledgeMap.nodes.find(n => n.id === connection.to)?.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${connection.strength * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(connection.strength * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Map className="w-5 h-5" />
            <span>Learning Paths</span>
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  AI Fundamentals → Advanced Topics
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Suggested reading order for AI concepts
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <Bookmark className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Theory → Implementation
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Bridge concepts to practical applications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendationsView = () => (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>AI-Powered Suggestions</span>
          </h3>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {mockRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {rec.type === 'organize' && <Layers className="w-4 h-4 text-blue-600" />}
                    {rec.type === 'link' && <Link className="w-4 h-4 text-green-600" />}
                    {rec.type === 'create' && <Plus className="w-4 h-4 text-purple-600" />}
                    {rec.type === 'merge' && <GitBranch className="w-4 h-4 text-orange-600" />}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {rec.title}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    {rec.action}
                  </button>
                  <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Auto-Organize</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Let AI automatically organize your conversations into logical groups
          </p>
          <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
            Start Auto-Organization
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Export Insights</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate a comprehensive report of your knowledge patterns
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Copy className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Duplicate Detection</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Find and merge similar conversations to reduce redundancy
          </p>
          <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Find Duplicates
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6" />
              <span>Library II - Advanced Analytics & Management</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered organization with smart insights, discovery, and library management
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeView === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeView === 'analytics' && renderAnalyticsView()}
          {activeView === 'discovery' && renderDiscoveryView()}
          {activeView === 'knowledge-map' && renderKnowledgeMapView()}
          {activeView === 'recommendations' && renderRecommendationsView()}
          {activeView === 'library-iii' && (
            <LibraryIIIPanel
              sessions={sessions}
              onSessionSelect={onSessionSelect}
              onSessionDelete={onSessionDelete}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}