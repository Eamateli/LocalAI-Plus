import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Upload,
  FileText,
  Trash2,
  Plus,
  Target,
  Brain,
  Settings,
  Zap,
  Globe,
  CheckCircle,
  Circle,
  Edit3,
  Download
} from 'lucide-react';

import { Library, ProjectGoal, UploadedFile, ModelConfig } from '../types';

interface LibrarySettingsModalProps {
  library: Library;
  onClose: () => void;
  onSave: (library: Library) => void;
}

export default function LibrarySettingsModal({
  library,
  onClose,
  onSave,
}: LibrarySettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'context' | 'goals' | 'knowledge'>('general');
  const [formData, setFormData] = useState<Library>({ ...library });
  const [newGoal, setNewGoal] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'context', label: 'Context & AI', icon: Brain },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
  ];

  const handleSave = () => {
    onSave(formData);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const goal: ProjectGoal = {
      id: `goal-${Date.now()}`,
      text: newGoal.trim(),
      completed: false,
      progress: 0,
      createdAt: new Date(),
    };

    setFormData(prev => ({
      ...prev,
      projectContext: {
        ...prev.projectContext,
        goals: [...(prev.projectContext?.goals || []), goal]
      }
    }));
    
    setNewGoal('');
  };

  const toggleGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      projectContext: {
        ...prev.projectContext,
        goals: prev.projectContext?.goals?.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                completed: !goal.completed,
                completedAt: !goal.completed ? new Date() : undefined,
                progress: !goal.completed ? 100 : goal.progress
              }
            : goal
        )
      }
    }));
  };

  const deleteGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      projectContext: {
        ...prev.projectContext,
        goals: prev.projectContext?.goals?.filter(goal => goal.id !== goalId)
      }
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    
    // Simulate file upload
    for (const file of Array.from(files)) {
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        content: await file.text(),
        uploadedAt: new Date(),
        processed: false
      };

      setFormData(prev => ({
        ...prev,
        projectContext: {
          ...prev.projectContext,
          knowledgeBase: [...(prev.projectContext?.knowledgeBase || []), uploadedFile]
        }
      }));
    }
    
    setIsUploading(false);
  };

  const deleteFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      projectContext: {
        ...prev.projectContext,
        knowledgeBase: prev.projectContext?.knowledgeBase?.filter(file => file.id !== fileId)
      }
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Library Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the purpose of this library..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                >
                  {formData.icon}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🔬"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Enable Project Features
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Add persistent context, goals, and knowledge base
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.contextEnabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contextEnabled: e.target.checked,
                    version: e.target.checked ? '2.0' : '1.0'
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        );

      case 'context':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Instructions
              </label>
              <textarea
                value={formData.projectContext?.systemPrompt || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  projectContext: {
                    ...prev.projectContext,
                    systemPrompt: e.target.value
                  }
                }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide custom instructions for the AI when working in this library..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Model
                </label>
                <select
                  value={formData.projectContext?.modelPreferences?.defaultModel || 'llama2:7b'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    projectContext: {
                      ...prev.projectContext,
                      modelPreferences: {
                        ...prev.projectContext?.modelPreferences,
                        defaultModel: e.target.value
                      } as ModelConfig
                    }
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
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.projectContext?.modelPreferences?.temperature || 0.7}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    projectContext: {
                      ...prev.projectContext,
                      modelPreferences: {
                        ...prev.projectContext?.modelPreferences,
                        temperature: parseFloat(e.target.value)
                      } as ModelConfig
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="512"
                max="8192"
                step="512"
                value={formData.projectContext?.modelPreferences?.maxTokens || 2048}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  projectContext: {
                    ...prev.projectContext,
                    modelPreferences: {
                      ...prev.projectContext?.modelPreferences,
                      maxTokens: parseInt(e.target.value)
                    } as ModelConfig
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-summarize Conversations
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically extract insights from completed chats
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.projectContext?.autoSummarize || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    projectContext: {
                      ...prev.projectContext,
                      autoSummarize: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add New Goal
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  placeholder="Enter a project goal..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addGoal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Goals ({formData.projectContext?.goals?.length || 0})
              </h3>
              
              {formData.projectContext?.goals && formData.projectContext.goals.length > 0 ? (
                <div className="space-y-3">
                  {formData.projectContext.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className="flex-shrink-0"
                      >
                        {goal.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <p className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {goal.text}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>Created {goal.createdAt.toLocaleDateString()}</span>
                          {goal.completedAt && (
                            <span>Completed {goal.completedAt.toLocaleDateString()}</span>
                          )}
                          {goal.progress !== undefined && !goal.completed && (
                            <span>{goal.progress}% complete</span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No goals yet</p>
                  <p className="text-xs mt-1">Add goals to track your project progress</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, TXT, MD files up to 10MB
                  </p>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Knowledge Base ({formData.projectContext?.knowledgeBase?.length || 0} files)
              </h3>
              
              {formData.projectContext?.knowledgeBase && formData.projectContext.knowledgeBase.length > 0 ? (
                <div className="space-y-2">
                  {formData.projectContext.knowledgeBase.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>Uploaded {file.uploadedAt.toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            file.processed 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {file.processed ? 'Processed' : 'Processing'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {/* TODO: Download file */}}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents uploaded</p>
                  <p className="text-xs mt-1">Upload documents to enhance AI context</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Web Sources
              </label>
              <textarea
                value={formData.projectContext?.webSources?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  projectContext: {
                    ...prev.projectContext,
                    webSources: e.target.value.split('\n').filter(url => url.trim())
                  }
                }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add reference URLs (one per line)..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${library.color}20`, color: library.color }}
            >
              {library.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Library Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure {library.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-600">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
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
            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formData.contextEnabled ? 'Project features enabled' : 'Basic library mode'}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}