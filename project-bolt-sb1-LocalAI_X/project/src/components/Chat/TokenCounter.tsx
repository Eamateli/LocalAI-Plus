import React from 'react';
import { Hash, TrendingUp } from 'lucide-react';

interface TokenCounterProps {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  sessionTotal: number;
  contextLimit?: number;
}

export function TokenCounter({ 
  promptTokens, 
  completionTokens, 
  totalTokens,
  sessionTotal,
  contextLimit = 8192
}: TokenCounterProps) {
  const contextPercentage = (sessionTotal / contextLimit) * 100;
  const isWarning = contextPercentage > 75;
  const isCritical = contextPercentage > 90;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Token Usage
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-400">Prompt: {promptTokens}</span>
          <span className="text-gray-400">Response: {completionTokens}</span>
          <span className="text-white font-semibold">Total: {totalTokens}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Context Window</span>
          <span className={`font-semibold ${
            isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {sessionTotal.toLocaleString()} / {contextLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(contextPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}