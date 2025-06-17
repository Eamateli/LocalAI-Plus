import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, FunctionSquare as Function, CheckCircle, Copy, Check } from 'lucide-react';
import ModelSelector from './ModelSelector';
import { sendMessage, getModels } from '../api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  function_result?: any;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const loadModels = async () => {
    try {
      const availableModels = await getModels();
      setModels(availableModels);
      if (availableModels.length > 0 && !selectedModel) {
        setSelectedModel(availableModels[0]);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedModel) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input.trim(), selectedModel, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        function_call: response.function_call,
        function_result: response.function_result,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      {/* Model Selector */}
      <div className="mb-6">
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to LocalAI+
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Start a conversation with your local LLM. Try asking about the weather or requesting a calculation to see function calling in action.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setInput("What's the weather like in San Francisco?")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors duration-200"
              >
                Ask about weather
              </button>
              <button
                onClick={() => setInput("Calculate 15 * 23 + 47")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors duration-200"
              >
                Try calculation
              </button>
              <button
                onClick={() => setInput("Explain quantum computing in simple terms")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors duration-200"
              >
                Ask a question
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-400 text-sm">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={clearChat}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors duration-200"
              >
                Clear Chat
              </button>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 group ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 relative ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white ml-12 shadow-lg shadow-blue-600/25'
                        : 'bg-slate-800 text-slate-100 shadow-lg border border-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-slate-700 rounded"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    )}
                    
                    {message.function_call && (
                      <div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-2 text-slate-300 mb-2">
                          <Function className="w-4 h-4" />
                          <span className="font-medium">Function Call</span>
                        </div>
                        <p className="text-sm font-mono text-slate-200">
                          {message.function_call.name}({message.function_call.arguments})
                        </p>
                        {message.function_result && (
                          <div className="mt-2 p-2 bg-emerald-900/30 rounded border border-emerald-700/50">
                            <div className="flex items-center space-x-2 text-emerald-300 mb-1">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs font-medium">Result</span>
                            </div>
                            <p className="text-sm text-emerald-200">
                              {JSON.stringify(message.function_result, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 px-4">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="bg-slate-800 rounded-2xl px-4 py-3 shadow-lg border border-slate-700">
              <div className="flex items-center space-x-2 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedModel 
                  ? "Type your message... (Enter to send, Shift+Enter for new line)"
                  : "Please select a model first..."
              }
              className="w-full resize-none border-0 focus:ring-0 placeholder-slate-400 text-slate-100 bg-transparent p-0 max-h-32"
              rows={1}
              disabled={isLoading || !selectedModel}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !selectedModel}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white p-3 rounded-xl transition-colors duration-200 shadow-lg shadow-blue-600/25 disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {!selectedModel && models.length === 0 && (
          <p className="text-xs text-orange-400 mt-2">
            No models available. Make sure Ollama is running and has models installed.
          </p>
        )}
      </form>
    </div>
  );
};

export default Chat;