import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Copy, Check, PlayCircle, Settings, Terminal, Loader } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

export function APIPlayground() {
  const [activeEndpoint, setActiveEndpoint] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [response, setResponse] = useState('');
  const [requestBody, setRequestBody] = useState('');

  const endpoints = [
    { id: 'chat', name: 'Chat Completions', icon: '💬' },
    { id: 'embeddings', name: 'Embeddings', icon: '🔍' },
    { id: 'tools', name: 'Function Calling', icon: '🛠️' },
    { id: 'code', name: 'Code Interpreter', icon: '🐍' }
  ];

  const exampleRequests = {
    chat: {
      url: '/v1/chat/completions',
      method: 'POST',
      body: {
        model: 'mistral:latest',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant.' },
          { role: 'user', content: 'Explain quantum computing in simple terms.' }
        ],
        temperature: 0.7,
        max_tokens: 500
      }
    },
    embeddings: {
      url: '/v1/embeddings',
      method: 'POST',
      body: {
        input: ['Hello world', 'LocalAI+ is awesome'],
        model: 'nomic-embed-text'
      }
    },
    tools: {
      url: '/v1/chat/completions',
      method: 'POST',
      body: {
        model: 'mistral:latest',
        messages: [
          { role: 'user', content: 'Calculate the square root of 144 and tell me the weather in New York' }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'calculator',
              description: 'Perform mathematical calculations',
              parameters: {
                type: 'object',
                properties: {
                  expression: { type: 'string', description: 'Mathematical expression' }
                },
                required: ['expression']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'weather',
              description: 'Get weather information',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string', description: 'Location name' }
                },
                required: ['location']
              }
            }
          }
        ]
      }
    },
    code: {
      url: '/v1/code/execute',
      method: 'POST',
      body: {
        code: 'import math\nprint(f"The square root of 16 is {math.sqrt(16)}")\nprint("Python code execution works!")',
        language: 'python'
      }
    }
  };

  React.useEffect(() => {
    const request = exampleRequests[activeEndpoint];
    setRequestBody(JSON.stringify(request.body, null, 2));
  }, [activeEndpoint]);

  const handleCopy = () => {
    const request = exampleRequests[activeEndpoint];
    const curlCommand = `curl -X ${request.method} "http://localhost:8000${request.url}" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(request.body, null, 2)}'`;
    
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse('');
    
    try {
      let result;
      const body = JSON.parse(requestBody);
      
      switch (activeEndpoint) {
        case 'chat':
          result = await apiService.chatCompletion(body);
          break;
        case 'embeddings':
          result = await apiService.createEmbeddings(body);
          break;
        case 'tools':
          result = await apiService.chatCompletion(body);
          break;
        case 'code':
          result = await apiService.executeCode(body);
          break;
        default:
          throw new Error('Unknown endpoint');
      }
      
      setResponse(JSON.stringify(result, null, 2));
      toast.success('Request completed successfully!');
    } catch (error) {
      console.error('Request failed:', error);
      
      // Fallback to mock responses for demo
      const mockResponses = {
        chat: {
          id: 'chatcmpl-abc123',
          object: 'chat.completion',
          created: 1677610602,
          model: 'mistral:latest',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'Quantum computing is a revolutionary technology that uses quantum mechanics principles to process information. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously through a property called superposition...'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 28,
            completion_tokens: 125,
            total_tokens: 153
          }
        },
        embeddings: {
          object: 'list',
          data: [
            { object: 'embedding', index: 0, embedding: [0.1, -0.2, 0.3, '...'] },
            { object: 'embedding', index: 1, embedding: [0.4, -0.1, 0.5, '...'] }
          ],
          model: 'nomic-embed-text',
          usage: { prompt_tokens: 6, total_tokens: 6 }
        },
        tools: {
          id: 'chatcmpl-def456',
          object: 'chat.completion',
          created: 1677610602,
          model: 'mistral:latest',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'I\'ll help you with both calculations. First, let me calculate the square root of 144, then get the weather information for New York.\n\nThe square root of 144 is 12.\n\nAs for the weather in New York, it\'s currently 22°C with partly cloudy conditions, 65% humidity, and winds at 10 km/h.'
            },
            finish_reason: 'stop'
          }],
          usage: { prompt_tokens: 45, completion_tokens: 67, total_tokens: 112 }
        },
        code: {
          success: true,
          output: 'The square root of 16 is 4.0\nPython code execution works!',
          execution_time: 0.123
        }
      };
      
      setResponse(JSON.stringify(mockResponses[activeEndpoint], null, 2));
      toast.error('Using mock response (backend not available)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-20 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8 leading-normal px-2 pb-2">
            API Playground
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test LocalAI+ endpoints interactively. Try different models, parameters, and see real-time responses.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Endpoints
              </h3>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      activeEndpoint === endpoint.id
                        ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{endpoint.icon}</span>
                    <span className="font-medium">{endpoint.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-9"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Request Panel */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Request
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy as cURL"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono">
                        {exampleRequests[activeEndpoint].method}
                      </span>
                      <span className="text-gray-300 font-mono text-sm">
                        {exampleRequests[activeEndpoint].url}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Request Body
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full h-64 px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendRequest}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Response Panel */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                  <h3 className="font-semibold text-white flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    Response
                  </h3>
                </div>
                
                <div className="p-6">
                  {response ? (
                    <div className="max-h-96 overflow-y-auto">
                      <SyntaxHighlighter
                        language="json"
                        style={atomDark}
                        customStyle={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        {response}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <div className="bg-black/20 rounded-lg p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No response yet</p>
                        <p className="text-sm">Send a request to see the response here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}