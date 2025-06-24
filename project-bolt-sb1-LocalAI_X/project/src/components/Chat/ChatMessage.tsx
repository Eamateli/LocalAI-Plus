import React from 'react';
import { Hash, Wrench, User, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../api/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/10 text-white border border-white/20'
          }`}>
            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
          </div>
          
          {/* Tool calls visualization */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2 p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                <Wrench className="w-4 h-4" />
                <span className="font-semibold">Function Call:</span>
                <code>{message.toolCalls[0].function.name}()</code>
              </div>
            </div>
          )}
          
          {/* Token count */}
          {message.tokens !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400 px-2">
              <Hash className="w-3 h-3" />
              <span>{message.tokens.toLocaleString()} tokens</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}