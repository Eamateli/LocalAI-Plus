import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bot, Zap, Database, Loader2 } from 'lucide-react';
import { Model } from '../types';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isLoading: boolean;
}

export default function ModelSelector({
  models,
  selectedModel,
  onModelChange,
  isLoading,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getModelIcon = (format?: string) => {
    switch (format) {
      case 'gguf':
        return Bot;
      case 'vllm':
        return Zap;
      case 'embedding':
        return Database;
      default:
        return Bot;
    }
  };

  const getModelBadgeColor = (format?: string) => {
    switch (format) {
      case 'gguf':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'vllm':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'embedding':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);
  const ModelIcon = selectedModelData ? getModelIcon(selectedModelData.format) : Bot;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-48"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        ) : (
          <ModelIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
        
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {selectedModelData?.id || selectedModel}
          </div>
          {selectedModelData?.format && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedModelData.format.toUpperCase()} Model
            </div>
          )}
        </div>
        
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
            >
              {models.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No models available</p>
                  <p className="text-xs mt-1">Check your Ollama installation</p>
                </div>
              ) : (
                <div className="py-1">
                  {models.map((model) => {
                    const Icon = getModelIcon(model.format);
                    const isSelected = model.id === selectedModel;
                    
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onModelChange(model.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {model.id}
                            </span>
                            {model.format && (
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getModelBadgeColor(
                                  model.format
                                )}`}
                              >
                                {model.format.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Owned by {model.owned_by}</span>
                            {model.loaded && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400">Loaded</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}