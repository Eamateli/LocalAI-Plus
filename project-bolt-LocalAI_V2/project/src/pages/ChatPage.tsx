import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Copy, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const ChatPage: React.FC = () => {
  const {
    chats,
    currentChatId,
    selectedModel,
    models,
    isLoading,
    createChat,
    addMessage,
    updateMessage,
    setLoading,
    settings
  } = useStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (!currentChatId && chats.length === 0) {
      createChat();
    }
  }, [currentChatId, chats.length, createChat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentChatId) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    addMessage(currentChatId, {
      role: 'user',
      content: userMessage,
    });

    try {
      // Add assistant message placeholder
      const assistantMessageId = `msg-${Date.now()}`;
      addMessage(currentChatId, {
        role: 'assistant',
        content: '',
      });

      const messages = currentChat?.messages || [];
      const response = await chatService.sendMessage([
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ], {
        model: selectedModel,
        stream: settings.streamingEnabled,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
      });

      if (settings.streamingEnabled) {
        let content = '';
        for await (const chunk of response) {
          if (chunk.choices?.[0]?.delta?.content) {
            content += chunk.choices[0].delta.content;
            updateMessage(currentChatId, assistantMessageId, content);
          }
        }
      } else {
        const result = response as any;
        if (result.choices?.[0]?.message?.content) {
          updateMessage(currentChatId, assistantMessageId, result.choices[0].message.content);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      updateMessage(currentChatId, `msg-${Date.now()}`, 'Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatMessage = (content: string) => {
    return (
      <ReactMarkdown
        className="prose prose-sm dark:prose-invert max-w-none"
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            return inline ? (
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
                <button
                  onClick={() => copyToClipboard(String(children))}
                  className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Welcome to LocalAI+
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start a new conversation to begin chatting with your local AI models.
          </p>
          <button
            onClick={() => createChat()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentChat.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Model: {selectedModel} • {currentChat.messages.length} messages
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start the conversation by typing a message below.
            </p>
          </div>
        ) : (
          currentChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatMessage(message.content)}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 hover:bg-black/10 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;