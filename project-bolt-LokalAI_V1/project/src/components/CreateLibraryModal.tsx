import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Sparkles,
  Brain,
  Target,
  FileText,
  Settings,
  Zap,
  Plus,
  Trash2,
  Upload,
  Globe,
  CheckCircle,
  Circle,
  Palette,
  Lightbulb,
  Rocket,
  BookOpen,
  Code,
  Users,
  Heart,
  Star,
  Coffee,
  Music,
  Camera,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Plane,
  ShoppingBag,
  Dumbbell,
  Utensils
} from 'lucide-react';

import { Library, ProjectGoal, UploadedFile, ModelConfig } from '../types';

interface CreateLibraryModalProps {
  onClose: () => void;
  onSave: (library: Omit<Library, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Predefined library templates
const libraryTemplates = [
  {
    id: 'research',
    name: 'Research Project',
    description: 'Academic research with paper analysis and literature review',
    icon: '🔬',
    color: '#3B82F6',
    systemPrompt: 'You are a research assistant specializing in academic research. Help analyze papers, extract insights, track research progress, and maintain rigorous academic standards.',
    goals: [
      'Complete literature review',
      'Analyze key papers in the field',
      'Identify research gaps',
      'Prepare research summary'
    ]
  },
  {
    id: 'business',
    name: 'Business Project',
    description: 'Client work, consulting, and business deliverables',
    icon: '💼',
    color: '#10B981',
    systemPrompt: 'You are a professional business consultant. Focus on deliverable outcomes, maintain confidentiality, and provide strategic insights for business success.',
    goals: [
      'Define project requirements',
      'Develop implementation strategy',
      'Create deliverable timeline',
      'Ensure client satisfaction'
    ]
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    description: 'Personal skill development and educational content',
    icon: '📚',
    color: '#8B5CF6',
    systemPrompt: 'You are a learning facilitator and tutor. Help break down complex topics, provide clear explanations, track learning progress, and suggest practical exercises.',
    goals: [
      'Master core concepts',
      'Complete practical exercises',
      'Build portfolio projects',
      'Apply knowledge in real scenarios'
    ]
  },
  {
    id: 'creative',
    name: 'Creative Project',
    description: 'Writing, design, content creation, and artistic endeavors',
    icon: '🎨',
    color: '#F59E0B',
    systemPrompt: 'You are a creative collaborator and artistic mentor. Help brainstorm ideas, refine creative concepts, provide constructive feedback, and inspire innovative solutions.',
    goals: [
      'Develop creative concept',
      'Create initial prototypes',
      'Gather feedback and iterate',
      'Finalize creative output'
    ]
  },
  {
    id: 'technical',
    name: 'Technical Development',
    description: 'Software development, coding projects, and technical documentation',
    icon: '💻',
    color: '#EF4444',
    systemPrompt: 'You are a senior software engineer and technical mentor. Help with code architecture, debugging, best practices, and technical documentation.',
    goals: [
      'Define technical requirements',
      'Design system architecture',
      'Implement core features',
      'Write comprehensive documentation'
    ]
  },
  {
    id: 'personal',
    name: 'Personal Assistant',
    description: 'Daily tasks, planning, and personal productivity',
    icon: '🗓️',
    color: '#06B6D4',
    systemPrompt: 'You are a personal assistant focused on productivity and organization. Help with planning, task management, goal setting, and maintaining work-life balance.',
    goals: [
      'Organize daily schedule',
      'Set and track personal goals',
      'Improve productivity systems',
      'Maintain healthy habits'
    ]
  }
];

// Icon options for custom libraries
const iconOptions = [
  '🔬', '💼', '📚', '🎨', '💻', '🗓️', '🎯', '🚀', '💡', '📊',
  '🏆', '🌟', '💎', '🔥', '⚡', '🌈', '🎪', '🎭', '🎵', '📸',
  '🎮', '🏠', '🚗', '✈️', '🛍️', '💪', '🍽️', '☕', '❤️', '🌍'
];

// Color options
const colorOptions = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
];

export default function CreateLibraryModal({ onClose, onSave }: CreateLibraryModalProps) {
  const [step, setStep] = useState<'template' | 'customize' | 'features'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#3B82F6',
    contextEnabled: true,
    version: '2.0' as const,
    sections: [] as any[],
    projectContext: {
      systemPrompt: '',
      modelPreferences: {
        defaultModel: 'llama2:7b',
        temperature: 0.7,
        maxTokens: 2048
      } as ModelConfig,
      goals: [] as ProjectGoal[],
      autoSummarize: true,
      knowledgeBase: [] as UploadedFile[],
      webSources: [] as string[]
    }
  });
  const [newGoal, setNewGoal] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = libraryTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      projectContext: {
        ...prev.projectContext,
        systemPrompt: template.systemPrompt,
        goals: template.goals.map((goalText, index) => ({
          id: `goal-${index}`,
          text: goalText,
          completed: false,
          progress: 0,
          createdAt: new Date()
        }))
      }
    }));
    setStep('customize');
  };

  const handleCustomTemplate = () => {
    setSelectedTemplate('custom');
    setFormData(prev => ({
      ...prev,
      name: 'Custom Library',
      description: 'A custom library tailored to your specific needs',
      icon: '📁',
      color: '#3B82F6'
    }));
    setStep('customize');
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
        goals: [...prev.projectContext.goals, goal]
      }
    }));
    
    setNewGoal('');
  };

  const removeGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      projectContext: {
        ...prev.projectContext,
        goals: prev.projectContext.goals.filter(goal => goal.id !== goalId)
      }
    }));
  };

  const handleSave = () => {
    const library: Omit<Library, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      contextEnabled: formData.contextEnabled,
      version: formData.version,
      sections: formData.sections,
      projectContext: formData.contextEnabled ? formData.projectContext : undefined,
      totalTokensUsed: 0
    };
    
    onSave(library);
  };

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Choose a Library Template
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Start with a pre-configured template or create a custom library from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {libraryTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className="p-6 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors group"
          >
            <div className="flex items-start space-x-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${template.color}20`, color: template.color }}
              >
                {template.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {template.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Brain className="w-3 h-3" />
                    <span>AI Context</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{template.goals.length} Goals</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <button
          onClick={handleCustomTemplate}
          className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
        >
          <div className="text-center">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Create Custom Library
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Build a library tailored to your specific needs
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Customize Your Library
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Configure the basic settings for your library
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Library Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter library name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this library..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex items-center space-x-3 mb-3">
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
            <div className="grid grid-cols-10 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    formData.icon === icon ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
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
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    formData.color === color 
                      ? 'border-gray-900 dark:border-white scale-110' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Enable Project Features
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Add AI context, goals, and knowledge base capabilities
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
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Configure Project Features
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Set up AI context, goals, and advanced capabilities
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI System Instructions
          </label>
          <textarea
            value={formData.projectContext.systemPrompt}
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
              value={formData.projectContext.modelPreferences.defaultModel}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                projectContext: {
                  ...prev.projectContext,
                  modelPreferences: {
                    ...prev.projectContext.modelPreferences,
                    defaultModel: e.target.value
                  }
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
              value={formData.projectContext.modelPreferences.temperature}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                projectContext: {
                  ...prev.projectContext,
                  modelPreferences: {
                    ...prev.projectContext.modelPreferences,
                    temperature: parseFloat(e.target.value)
                  }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Goals
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                placeholder="Add a project goal..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {formData.projectContext.goals.length > 0 && (
              <div className="space-y-2">
                {formData.projectContext.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">
                      {goal.text}
                    </span>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-summarize Conversations
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Automatically extract insights from completed chats
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.projectContext.autoSummarize}
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
    </div>
  );

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
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Library
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {step === 'template' ? '1' : step === 'customize' ? '2' : '3'} of 3
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

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: step === 'template' ? '33%' : step === 'customize' ? '66%' : '100%'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {step === 'template' && renderTemplateStep()}
            {step === 'customize' && renderCustomizeStep()}
            {step === 'features' && formData.contextEnabled && renderFeaturesStep()}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'template' && 'Choose a template to get started'}
            {step === 'customize' && 'Customize your library settings'}
            {step === 'features' && 'Configure advanced features'}
          </div>
          
          <div className="flex items-center space-x-3">
            {step !== 'template' && (
              <button
                onClick={() => {
                  if (step === 'customize') setStep('template');
                  if (step === 'features') setStep('customize');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {step === 'template' ? (
              <button
                onClick={() => setStep('customize')}
                disabled={!selectedTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Next</span>
              </button>
            ) : step === 'customize' ? (
              <button
                onClick={() => {
                  if (formData.contextEnabled) {
                    setStep('features');
                  } else {
                    handleSave();
                  }
                }}
                disabled={!formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {formData.contextEnabled ? <span>Next</span> : <><Save className="w-4 h-4" /><span>Create Library</span></>}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Create Library</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}