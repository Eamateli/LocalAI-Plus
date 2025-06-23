import React from 'react';
import { Brain, Code, Search, Sparkles, ChevronDown } from 'lucide-react';

interface Personality {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemPrompt: string;
}

const PERSONALITIES: Personality[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Helpful, harmless, and honest AI assistant',
    icon: <Sparkles className="w-4 h-4" />,
    systemPrompt: 'You are a helpful, harmless, and honest AI assistant.'
  },
  {
    id: 'coder',
    name: 'CoderGPT',
    description: 'Expert programmer and code reviewer',
    icon: <Code className="w-4 h-4" />,
    systemPrompt: 'You are an expert programmer. Provide clean, efficient code with explanations.'
  },
  {
    id: 'researcher',
    name: 'ResearcherGPT',
    description: 'Academic researcher and analyst',
    icon: <Search className="w-4 h-4" />,
    systemPrompt: 'You are an academic researcher. Provide thorough analysis with citations.'
  },
  {
    id: 'creative',
    name: 'CreativeGPT',
    description: 'Creative writer and storyteller',
    icon: <Brain className="w-4 h-4" />,
    systemPrompt: 'You are a creative writer. Help with storytelling, brainstorming, and creative tasks.'
  }
];

interface PersonalitySelectorProps {
  selectedPersonality: string;
  onPersonalityChange: (personalityId: string) => void;
}

export function PersonalitySelector({ 
  selectedPersonality, 
  onPersonalityChange 
}: PersonalitySelectorProps) {
  const current = PERSONALITIES.find(p => p.id === selectedPersonality) || PERSONALITIES[0];
  
  return (
    <div className="relative">
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
        Personality
      </label>
      <div className="relative">
        <select
          value={selectedPersonality}
          onChange={(e) => onPersonalityChange(e.target.value)}
          className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-10 text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PERSONALITIES.map(personality => (
            <option key={personality.id} value={personality.id}>
              {personality.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          {current.icon}
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">{current.description}</p>
    </div>
  );
}

export { PERSONALITIES };