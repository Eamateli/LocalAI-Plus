import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Copy, RefreshCw, Code, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { ChatSession, Message } from '../types';
import { useLocalAI } from '../hooks/useLocalAI';

interface ChatInterfaceProps {
  session: ChatSession | null;
  selectedModel: string;
  onSendMessage: (messages: Message[], model: string) => Promise<Response | string>;
  onUpdateMessages: (sessionId: string, messages: Message[]) => void;
  streamResponse: (messages: Message[], model: string) => AsyncGenerator<string, void, unknown>;
}

export default function ChatInterface({
  session,
  selectedModel,
  onSendMessage,
  onUpdateMessages,
  streamResponse,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !session || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...session.messages, userMessage];
    onUpdateMessages(session.id, updatedMessages);
    setInput('');

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: selectedModel,
    };

    const messagesWithAssistant = [...updatedMessages, assistantMessage];
    onUpdateMessages(session.id, messagesWithAssistant);

    try {
      setIsStreaming(true);
      let accumulatedContent = '';

      for await (const chunk of streamResponse(updatedMessages, selectedModel)) {
        accumulatedContent += chunk;
        const updatedAssistantMessage = {
          ...assistantMessage,
          content: accumulatedContent,
        };
        
        const finalMessages = [
          ...updatedMessages,
          updatedAssistantMessage,
        ];
        
        onUpdateMessages(session.id, finalMessages);
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      const errorMessage = {
        ...assistantMessage,
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      };
      
      onUpdateMessages(session.id, [...updatedMessages, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (!session || messageIndex < 1) return;

    const messagesUpToRegenerate = session.messages.slice(0, messageIndex);
    onUpdateMessages(session.id, messagesUpToRegenerate);

    const assistantMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: selectedModel,
    };

    const messagesWithAssistant = [...messagesUpToRegenerate, assistantMessage];
    onUpdateMessages(session.id, messagesWithAssistant);

    try {
      setIsStreaming(true);
      let accumulatedContent = '';

      for await (const chunk of streamResponse(messagesUpToRegenerate, selectedModel)) {
        accumulatedContent += chunk;
        const updatedAssistantMessage = {
          ...assistantMessage,
          content: accumulatedContent,
        };
        
        const finalMessages = [
          ...messagesUpToRegenerate,
          updatedAssistantMessage,
        ];
        
        onUpdateMessages(session.id, finalMessages);
      }
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Chat Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chat from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {session.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } space-x-3`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="prose prose-sm max-w-none dark:prose-invert"
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div className="flex items-center mt-2 space-x-2 text-xs text-gray-500">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.model && (
                      <>
                        <span>•</span>
                        <span>{message.model}</span>
                      </>
                    )}
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Copy message"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => regenerateResponse(index)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Regenerate response"
                        disabled={isStreaming}
                      >
                        <RefreshCw className={`w-3 h-3 ${isStreaming ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={Math.min(Math.max(input.split('\n').length, 1), 6)}
                disabled={isStreaming}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 rounded-2xl bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Model: {selectedModel}</span>
              <span>•</span>
              <span>Press Tab for autocomplete</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>Markdown supported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}