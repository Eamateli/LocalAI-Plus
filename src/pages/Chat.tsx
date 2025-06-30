import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, Zap } from 'lucide-react';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { TokenCounter } from '../components/Chat/TokenCounter';
import { PersonalitySelector } from '../components/Chat/PersonalitySelector';
import { ModelSelector } from '../components/ModelSelector';
import { TokenUsage } from '../api/chat';

export function Chat() {
  const [selectedModel, setSelectedModel] = useState('llama-3.2-1b-instruct');
  const [selectedPersonality, setSelectedPersonality] = useState('general');
  const [lastTokenUsage, setLastTokenUsage] = useState<TokenUsage>({
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0
  });
  const [sessionTokens, setSessionTokens] = useState(0);

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-10rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full flex gap-6"
        >
          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <img 
                  src="/Image_navbar_logo-removebg.png" 
                  alt="LocalAI+ Logo" 
                  className="w-6 h-6 rounded-lg object-cover"
                />
                LocalAI+ Chat
              </h1>
              <p className="text-gray-400 text-sm">
                Chat with your local AI models with advanced features
              </p>
            </div>

            {/* Model Selector */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>

            {/* Personality Selector */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <PersonalitySelector
                selectedPersonality={selectedPersonality}
                onPersonalityChange={setSelectedPersonality}
              />
            </div>

            {/* Token Counter */}
            <TokenCounter
              promptTokens={lastTokenUsage.prompt_tokens}
              completionTokens={lastTokenUsage.completion_tokens}
              totalTokens={lastTokenUsage.total_tokens}
              sessionTotal={sessionTokens}
            />

            {/* Session Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Session Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Messages</span>
                  <span className="text-white font-semibold">
                    {Math.floor(sessionTokens / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg tokens/msg</span>
                  <span className="text-white font-semibold">
                    {sessionTokens > 0 ? Math.floor(sessionTokens / Math.max(1, Math.floor(sessionTokens / 100))) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. cost</span>
                  <span className="text-white font-semibold">
                    ${((sessionTokens / 1000) * 0.001).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <ChatWindow
              model={selectedModel}
              personality={selectedPersonality}
              onTokenUsageUpdate={setLastTokenUsage}
              onSessionTokensUpdate={setSessionTokens}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Chat;