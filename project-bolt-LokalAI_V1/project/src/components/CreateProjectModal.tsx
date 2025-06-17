import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Target,
  Plus,
  Trash2,
  Upload,
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

interface CreateProjectModalProps {
  onClose: () => void;
  onSave: (project: any) => void;
}

// Project templates
const projectTemplates = [
  {
    id: 'research',
    name: 'Research Project',
    description: 'Academic research with paper analysis and literature review',
    icon: '🔬',
    color: '#3B82F6',
    goals: [
      'Complete literature review',
      'Analyze key papers in the field',
      'Identify research gaps',
      'Prepare research summary'
    ],
    aiContext: 'You are a research assistant specializing in academic research. Help analyze papers, extract insights, track research progress, and maintain rigorous academic standards.'
  },
  {
    id: 'business',
    name: 'Business Analysis',
    description: 'Client work, consulting, and business deliverables',
    icon: '💼',
    color: '#10B981',
    goals: [
      'Define project requirements',
      'Develop implementation strategy',
      'Create deliverable timeline',
      'Ensure client satisfaction'
    ],
    aiContext: 'You are a professional business consultant. Focus on deliverable outcomes, maintain confidentiality, and provide strategic insights for business success.'
  },
  {
    id: 'development',
    name: 'Software Development',
    description: 'Software development, coding projects, and technical documentation',
    icon: '💻',
    color: '#EF4444',
    goals: [
      'Define technical requirements',
      'Design system architecture',
      'Implement core features',
      'Write comprehensive documentation'
    ],
    aiContext: 'You are a senior software engineer and technical mentor. Help with code architecture, debugging, best practices, and technical documentation.'
  },
  {
    id: 'creative',
    name: 'Creative Project',
    description: 'Writing, design, content creation, and artistic endeavors',
    icon: '🎨',
    color: '#F59E0B',
    goals: [
      'Develop creative concept',
      'Create initial prototypes',
      'Gather feedback and iterate',
      'Finalize creative output'
    ],
    aiContext: 'You are a creative collaborator and artistic mentor. Help brainstorm ideas, refine creative concepts, provide constructive feedback, and inspire innovative solutions.'
  },
  {
    id: 'learning',
    name: 'Learning & Development',
    description: 'Personal skill development and educational content',
    icon: '📚',
    color: '#8B5CF6',
    goals: [
      'Master core concepts',
      'Complete practical exercises',
      'Build portfolio projects',
      'Apply knowledge in real scenarios'
    ],
    aiContext: 'You are a learning facilitator and tutor. Help break down complex topics, provide clear explanations, track learning progress, and suggest practical exercises.'
  },
  {
    id: 'personal',
    name: 'Personal Assistant',
    description: 'Daily tasks, planning, and personal productivity',
    icon: '🗓️',
    color: '#06B6D4',
    goals: [
      'Organize daily schedule',
      'Set and track personal goals',
      'Improve productivity systems',
      'Maintain healthy habits'
    ],
    aiContext: 'You are a personal assistant focused on productivity and organization. Help with planning, task management, goal setting, and maintaining work-life balance.'
  }
];

// Icon options
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

export default function CreateProjectModal({ onClose, onSave }: CreateProjectModalProps) {
  const [step, setStep] = useState<'template' | 'customize' | 'goals'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎯',
    color: '#3B82F6',
    status: 'planning' as 'active' | 'planning' | 'completed',
    model: 'claude-3-sonnet',
    goals: [] as string[],
    aiContext: '',
    customInstructions: ''
  });
  const [newGoal, setNewGoal] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = projectTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      goals: template.goals,
      aiContext: template.aiContext
    }));
    setStep('customize');
  };

  const handleCustomTemplate = () => {
    setSelectedTemplate('custom');
    setFormData(prev => ({
      ...prev,
      name: 'Custom Project',
      description: 'A custom project tailored to your specific needs',
      icon: '🎯',
      color: '#3B82F6'
    }));
    setStep('customize');
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal.trim()]
    }));
    
    setNewGoal('');
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const project = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      status: formData.status,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: formData.model,
      contextTokens: 0,
      goals: formData.goals.map((goalText, index) => ({
        id: `goal-${index}`,
        text: goalText,
        completed: false,
        progress: 0
      })),
      knowledgeBase: [],
      conversations: [],
      aiContext: formData.aiContext,
      persistentMemory: '',
      customInstructions: formData.customInstructions
    };
    
    onSave(project);
  };

  const renderTemplateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Choose a Project Template
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Start with a pre-configured template or create a custom project from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectTemplates.map((template) => (
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
              Create Custom Project
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Build a project tailored to your specific needs
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Palette className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Customize Your Project
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Configure the basic settings for your project workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name..."
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
              placeholder="Describe the purpose of this project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
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
                placeholder="🎯"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="llama2:7b">Llama 2 7B</option>
              <option value="llama2:13b">Llama 2 13B</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Set Project Goals & AI Context
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Define goals and configure AI assistant behavior for this project
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Context Instructions
          </label>
          <textarea
            value={formData.aiContext}
            onChange={(e) => setFormData(prev => ({ ...prev, aiContext: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide instructions for how the AI should behave in this project..."
          />
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

            {formData.goals.length > 0 && (
              <div className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">
                      {goal}
                    </span>
                    <button
                      onClick={() => removeGoal(index)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={formData.customInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, customInstructions: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional instructions for the AI assistant..."
          />
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
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Project
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
            {step === 'goals' && renderGoalsStep()}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'template' && 'Choose a template to get started'}
            {step === 'customize' && 'Customize your project settings'}
            {step === 'goals' && 'Set goals and AI context'}
          </div>
          
          <div className="flex items-center space-x-3">
            {step !== 'template' && (
              <button
                onClick={() => {
                  if (step === 'customize') setStep('template');
                  if (step === 'goals') setStep('customize');
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
                onClick={() => setStep('goals')}
                disabled={!formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Next</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}