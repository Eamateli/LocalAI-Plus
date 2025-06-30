import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, RefreshCw } from 'lucide-react';
import { ChatMessage as ChatMessageType, streamChatCompletion, estimateTokens, TokenUsage } from '../../api/chat';
import { ChatMessage } from './ChatMessage';
import { TokenCounter } from './TokenCounter';
import { PERSONALITIES } from './PersonalitySelector';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  model: string;
  personality: string;
  onTokenUsageUpdate: (usage: TokenUsage) => void;
  onSessionTokensUpdate: (tokens: number) => void;
}

export function ChatWindow({ 
  model, 
  personality, 
  onTokenUsageUpdate,
  onSessionTokensUpdate 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTokens, setSessionTokens] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add system message when personality changes
  useEffect(() => {
    const selectedPersonality = PERSONALITIES.find(p => p.id === personality);
    if (selectedPersonality && messages.length === 0) {
      setMessages([{
        role: 'system',
        content: selectedPersonality.systemPrompt,
        tokens: estimateTokens(selectedPersonality.systemPrompt)
      }]);
    }
  }, [personality]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = { 
      role: 'user', 
      content: input,
      tokens: estimateTokens(input) 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage: ChatMessageType = { 
      role: 'assistant', 
      content: '', 
      tokens: 0 
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      await streamChatCompletion(
        { 
          model, 
          messages: [...messages, userMessage],
          persona: personality 
        },
        (chunk) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content += chunk;
            lastMessage.tokens = estimateTokens(lastMessage.content);
            return newMessages;
          });
        },
        (usage) => {
          onTokenUsageUpdate(usage);
          const newTotal = sessionTokens + usage.total_tokens;
          setSessionTokens(newTotal);
          onSessionTokensUpdate(newTotal);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 'Error: Failed to get response';
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" ready for RAG processing`);
      // TODO: Implement actual file upload for RAG
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionTokens(0);
    onSessionTokensUpdate(0);
    toast.success('Started new chat');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 1 && messages[0].role === 'system' && (
          <div className="text-center text-gray-400 my-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/Image_navbar_logo-removebg.png" 
                alt="LocalAI+ Logo" 
                className="w-12 h-12 rounded-lg object-cover mr-3"
              />
              <h2 className="text-2xl font-bold text-white">LocalAI+ Chat</h2>
            </div>
            <p>Start a conversation with your local AI using {model}</p>
          </div>
        )}
        
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <ChatMessage key={index} message={message} index={index} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10">
        <div className="px-6 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>Message tokens: {estimateTokens(input)}</span>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            New Chat
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 pt-2">
          <div className="flex gap-2 mb-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.pdf,.md,.docx"
            />
            <button
              type="button"
              onClick={handleFileUpload}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Upload for RAG
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}