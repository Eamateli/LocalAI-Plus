import React from 'react';
import { ChevronDown, Cpu, Zap, RefreshCw } from 'lucide-react';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload(); // Simple refresh for now
    }, 1000);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600/20 border border-emerald-500/30 p-2 rounded-lg">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Model Selection</h3>
            <p className="text-sm text-slate-400">Choose your local LLM</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refresh models"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="appearance-none bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-10 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
              disabled={models.length === 0}
            >
              {models.length === 0 ? (
                <option disabled>Loading models...</option>
              ) : (
                <>
                  <option value="" disabled>Select a model</option>
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {models.length === 0 && (
        <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
          <div className="flex items-center space-x-2 text-orange-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">No models found</span>
          </div>
          <p className="text-sm text-orange-200 mt-1">
            Make sure Ollama is running and you have models installed. Try: <code className="bg-orange-800/50 px-1 rounded">ollama pull llama2</code>
          </p>
        </div>
      )}
      
      {selectedModel && (
        <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <p className="text-xs text-blue-300">
            <span className="font-medium">Active model:</span> {selectedModel}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;