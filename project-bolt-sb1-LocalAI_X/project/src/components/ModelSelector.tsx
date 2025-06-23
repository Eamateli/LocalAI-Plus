import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'llama-3.2-1b-instruct', name: 'Llama 3.2 1B', size: '1B' },
  { id: 'mistral-7b-instruct', name: 'Mistral 7B', size: '7B' },
  { id: 'deepseek-coder-6.7b', name: 'DeepSeek Coder', size: '6.7B' },
  { id: 'phi-3-mini', name: 'Phi 3 Mini', size: '3.8B' },
];

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const current = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];
  
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
        Model
      </label>
      <div className="relative">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {AVAILABLE_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.size})
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          <Cpu className="w-4 h-4 text-gray-400" />
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Using {current.name} with {current.size} parameters
      </p>
    </div>
  );
}

export { ModelSelector };