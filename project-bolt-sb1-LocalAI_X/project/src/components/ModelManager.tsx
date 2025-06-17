import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Download, 
  Trash2, 
  Play, 
  Pause, 
  Settings,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Model {
  name: string;
  size: string;
  status: 'running' | 'stopped' | 'downloading' | 'error';
  description: string;
  tags: string[];
  lastUsed?: string;
  downloadProgress?: number;
}

export function ModelManager() {
  const [models, setModels] = useState<Model[]>([]);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      // Mock data for demonstration
      setModels([
        {
          name: 'mistral:latest',
          size: '4.1 GB',
          status: 'running',
          description: 'Mistral 7B - Fast and efficient language model',
          tags: ['chat', 'general'],
          lastUsed: '2 minutes ago'
        },
        {
          name: 'codellama:7b',
          size: '3.8 GB',
          status: 'stopped',
          description: 'Code Llama 7B - Specialized for code generation',
          tags: ['code', 'programming'],
          lastUsed: '1 hour ago'
        },
        {
          name: 'nomic-embed-text',
          size: '274 MB',
          status: 'running',
          description: 'Nomic Embed Text - High-quality text embeddings',
          tags: ['embeddings', 'rag'],
          lastUsed: '5 minutes ago'
        }
      ]);

      setAvailableModels([
        {
          name: 'llama2:7b',
          size: '3.8 GB',
          status: 'stopped',
          description: 'Llama 2 7B - Meta\'s open-source language model',
          tags: ['chat', 'general']
        },
        {
          name: 'phi:latest',
          size: '1.6 GB',
          status: 'stopped',
          description: 'Microsoft Phi - Small but capable model',
          tags: ['chat', 'lightweight']
        },
        {
          name: 'neural-chat:7b',
          size: '4.1 GB',
          status: 'stopped',
          description: 'Neural Chat - Fine-tuned for conversations',
          tags: ['chat', 'conversation']
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load models');
      setLoading(false);
    }
  };

  const handleModelAction = async (modelName: string, action: 'start' | 'stop' | 'delete' | 'download') => {
    try {
      switch (action) {
        case 'start':
          toast.success(`Starting ${modelName}...`);
          setModels(prev => prev.map(m => 
            m.name === modelName ? { ...m, status: 'running' } : m
          ));
          break;
        case 'stop':
          toast.success(`Stopping ${modelName}...`);
          setModels(prev => prev.map(m => 
            m.name === modelName ? { ...m, status: 'stopped' } : m
          ));
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${modelName}?`)) {
            toast.success(`Deleted ${modelName}`);
            setModels(prev => prev.filter(m => m.name !== modelName));
          }
          break;
        case 'download':
          toast.success(`Downloading ${modelName}...`);
          // Move from available to models list with downloading status
          const modelToDownload = availableModels.find(m => m.name === modelName);
          if (modelToDownload) {
            setModels(prev => [...prev, { ...modelToDownload, status: 'downloading', downloadProgress: 0 }]);
            setAvailableModels(prev => prev.filter(m => m.name !== modelName));
            
            // Simulate download progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 20;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setModels(prev => prev.map(m => 
                  m.name === modelName ? { ...m, status: 'stopped', downloadProgress: undefined } : m
                ));
                toast.success(`${modelName} downloaded successfully!`);
              } else {
                setModels(prev => prev.map(m => 
                  m.name === modelName ? { ...m, downloadProgress: progress } : m
                ));
              }
            }, 500);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} model:`, error);
      toast.error(`Failed to ${action} model`);
    }
  };

  const getStatusIcon = (status: Model['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'stopped':
        return <Pause className="w-4 h-4 text-gray-400" />;
      case 'downloading':
        return <Download className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Model['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-500/20';
      case 'stopped':
        return 'text-gray-400 bg-gray-500/20';
      case 'downloading':
        return 'text-blue-400 bg-blue-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Model Manager</h1>
              <p className="text-gray-300">Manage your local language models and embeddings</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadModels}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddModel(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Model</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Installed Models */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Installed Models</h2>
          <div className="grid grid-cols-1 gap-4">
            {models.map((model, index) => (
              <div
                key={model.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                      <p className="text-gray-400 text-sm">{model.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-gray-300 text-sm">{model.size}</span>
                        {model.lastUsed && (
                          <span className="text-gray-400 text-sm">Last used: {model.lastUsed}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          {model.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(model.status)}`}>
                      {getStatusIcon(model.status)}
                      <span className="text-sm font-medium capitalize">{model.status}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {model.status === 'running' ? (
                        <button
                          onClick={() => handleModelAction(model.name, 'stop')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : model.status === 'stopped' ? (
                        <button
                          onClick={() => handleModelAction(model.name, 'start')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}
                      
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleModelAction(model.name, 'delete')}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {model.status === 'downloading' && model.downloadProgress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Downloading...</span>
                      <span className="text-sm text-white">{Math.round(model.downloadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${model.downloadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Available Models */}
        {showAddModel && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Available Models</h2>
              <button
                onClick={() => setShowAddModel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {availableModels.map((model) => (
                <div
                  key={model.name}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <p className="text-gray-400 text-sm">{model.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-gray-300 text-sm">{model.size}</span>
                          <div className="flex items-center space-x-1">
                            {model.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleModelAction(model.name, 'download')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}