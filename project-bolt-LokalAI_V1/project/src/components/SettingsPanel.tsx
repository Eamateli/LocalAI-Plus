import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bot,
  Database,
  Code,
  Shield,
  Zap,
  Save,
  RefreshCw,
  Key,
  Server,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Target,
  List
} from 'lucide-react';

interface SettingsPanelProps {
  featuresEnabled: {
    library: boolean;
    libraryII: boolean;
    simpleChat: boolean;
  };
  onFeatureToggle: (feature: 'library' | 'libraryII' | 'simpleChat', enabled: boolean) => void;
}

export default function SettingsPanel({ 
  featuresEnabled,
  onFeatureToggle
}: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    api: {
      baseUrl: 'http://localhost:8000',
      apiKey: 'localai-plus-default-key',
      timeout: 30000,
    },
    models: {
      defaultModel: 'llama2:7b',
      defaultEmbeddingModel: 'all-MiniLM-L6-v2',
      maxContextLength: 4096,
      temperature: 0.7,
    },
    rag: {
      chunkSize: 1000,
      chunkOverlap: 200,
      topK: 5,
      threshold: 0.7,
    },
    code: {
      enabled: true,
      timeout: 30,
      memoryLimit: '128MB',
    },
    ui: {
      theme: 'system',
      language: 'en',
      autoSave: true,
    }
  });

  const [activeTab, setActiveTab] = useState('features');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs = [
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'api', label: 'API Settings', icon: Server },
    { id: 'models', label: 'Models', icon: Bot },
    { id: 'rag', label: 'RAG', icon: Database },
    { id: 'code', label: 'Code Execution', icon: Code },
    { id: 'ui', label: 'Interface', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'features':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Feature Management
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Control which features appear in your sidebar. Disabled features will be hidden from the navigation.
                  </p>
                </div>
              </div>
            </div>

            {/* Library Feature Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Library System
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Basic library organization with sections and project features
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuresEnabled.library}
                  onChange={(e) => onFeatureToggle('library', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Library II Feature Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Library II - Advanced Analytics
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI-powered organization with analytics, discovery, and library management
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuresEnabled.libraryII}
                  onChange={(e) => onFeatureToggle('libraryII', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Simple Chat List Feature Toggle */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Simple Chat List
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Original basic chat list functionality without library organization
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuresEnabled.simpleChat}
                  onChange={(e) => onFeatureToggle('simpleChat', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Feature Status Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-2">Current Feature Status</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${featuresEnabled.library ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>Library System: {featuresEnabled.library ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${featuresEnabled.libraryII ? 'bg-purple-500' : 'bg-gray-400'}`} />
                      <span>Library II Analytics: {featuresEnabled.libraryII ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${featuresEnabled.simpleChat ? 'bg-blue-500' : 'bg-gray-400'}`} />
                      <span>Simple Chat List: {featuresEnabled.simpleChat ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Changes take effect immediately. Disabled features will be hidden from the sidebar navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Base URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={settings.api.baseUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    api: { ...prev.api, baseUrl: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="http://localhost:8000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={settings.api.apiKey}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    api: { ...prev.api, apiKey: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your API key"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.api.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  api: { ...prev.api, timeout: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1000"
                max="300000"
                step="1000"
              />
            </div>
          </div>
        );

      case 'models':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Chat Model
              </label>
              <select
                value={settings.models.defaultModel}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  models: { ...prev.models, defaultModel: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="llama2:7b">Llama 2 7B</option>
                <option value="llama2:13b">Llama 2 13B</option>
                <option value="codellama:7b">Code Llama 7B</option>
                <option value="mistral:7b">Mistral 7B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Embedding Model
              </label>
              <select
                value={settings.models.defaultEmbeddingModel}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  models: { ...prev.models, defaultEmbeddingModel: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2</option>
                <option value="all-mpnet-base-v2">all-mpnet-base-v2</option>
                <option value="text-embedding-ada-002">text-embedding-ada-002</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Context Length
              </label>
              <input
                type="number"
                value={settings.models.maxContextLength}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  models: { ...prev.models, maxContextLength: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="512"
                max="32768"
                step="512"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature: {settings.models.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.models.temperature}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  models: { ...prev.models, temperature: parseFloat(e.target.value) }
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        );

      case 'rag':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chunk Size
              </label>
              <input
                type="number"
                value={settings.rag.chunkSize}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rag: { ...prev.rag, chunkSize: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="2000"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chunk Overlap
              </label>
              <input
                type="number"
                value={settings.rag.chunkOverlap}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rag: { ...prev.rag, chunkOverlap: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="500"
                step="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Top K Results
              </label>
              <input
                type="number"
                value={settings.rag.topK}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rag: { ...prev.rag, topK: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Similarity Threshold: {settings.rag.threshold}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.rag.threshold}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rag: { ...prev.rag, threshold: parseFloat(e.target.value) }
                }))}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Code Execution
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow running Python code in secure containers
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.code.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    code: { ...prev.code, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Execution Timeout (seconds)
              </label>
              <input
                type="number"
                value={settings.code.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  code: { ...prev.code, timeout: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="5"
                max="300"
                disabled={!settings.code.enabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Memory Limit
              </label>
              <select
                value={settings.code.memoryLimit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  code: { ...prev.code, memoryLimit: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!settings.code.enabled}
              >
                <option value="64MB">64MB</option>
                <option value="128MB">128MB</option>
                <option value="256MB">256MB</option>
                <option value="512MB">512MB</option>
              </select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Security Notice</p>
                  <p className="mt-1">
                    Code execution runs in isolated Docker containers with no network access and limited resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ui':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={settings.ui.theme}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  ui: { ...prev.ui, theme: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={settings.ui.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  ui: { ...prev.ui, language: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-save Chats
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically save chat sessions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ui.autoSave}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ui: { ...prev.ui, autoSave: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure LocalAI+ to your preferences
          </p>
        </div>
        
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure settings for {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}
              </p>
            </div>

            {renderTabContent()}

            {activeTab !== 'features' && (
              <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                
                <button
                  onClick={() => {
                    // Reset to defaults
                    setSettings({
                      api: {
                        baseUrl: 'http://localhost:8000',
                        apiKey: 'localai-plus-default-key',
                        timeout: 30000,
                      },
                      models: {
                        defaultModel: 'llama2:7b',
                        defaultEmbeddingModel: 'all-MiniLM-L6-v2',
                        maxContextLength: 4096,
                        temperature: 0.7,
                      },
                      rag: {
                        chunkSize: 1000,
                        chunkOverlap: 200,
                        topK: 5,
                        threshold: 0.7,
                      },
                      code: {
                        enabled: true,
                        timeout: 30,
                        memoryLimit: '128MB',
                      },
                      ui: {
                        theme: 'system',
                        language: 'en',
                        autoSave: true,
                      }
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}