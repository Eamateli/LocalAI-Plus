import React, { useEffect, useState } from 'react';
import { Brain, Server, Cpu, HardDrive, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';

const ModelsPage: React.FC = () => {
  const { models, selectedModel, setModels, setSelectedModel } = useStore();
  const [loading, setLoading] = useState(false);
  const [modelStats, setModelStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await chatService.getModels();
      setModels(response.data || []);
      toast.success('Models loaded successfully');
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    toast.success(`Selected model: ${modelId}`);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'ollama':
        return <Server className="w-5 h-5" />;
      case 'vllm':
        return <Cpu className="w-5 h-5" />;
      case 'huggingface':
        return <Brain className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Model Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and configure your local AI models
            </p>
          </div>
          <button
            onClick={loadModels}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Models</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Models</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.filter(m => !m.embedding_model).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Embedding Models</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.filter(m => m.embedding_model).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {selectedModel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Models
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading models...</span>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No models found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Make sure your model providers (Ollama, vLLM) are running and have models loaded.
            </p>
            <button
              onClick={loadModels}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getProviderIcon(model.provider)}
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {model.provider}
                    </span>
                  </div>
                  {selectedModel === model.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {model.name || model.id}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Context Length:</span>
                    <span>{model.context_length?.toLocaleString() || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Tokens:</span>
                    <span>{model.max_tokens?.toLocaleString() || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streaming:</span>
                    <span className={model.supports_streaming ? 'text-green-600' : 'text-red-600'}>
                      {model.supports_streaming ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Functions:</span>
                    <span className={model.supports_functions ? 'text-green-600' : 'text-red-600'}>
                      {model.supports_functions ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {model.embedding_model && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="text-purple-600">Embedding</span>
                    </div>
                  )}
                </div>
                
                {model.metadata?.size && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatSize(model.metadata.size)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelsPage;