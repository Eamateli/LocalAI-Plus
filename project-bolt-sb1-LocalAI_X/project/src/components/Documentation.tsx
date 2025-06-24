import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Code, 
  Settings,
  Shield,
  Puzzle,
  BookOpen,
  Terminal,
  ExternalLink
} from 'lucide-react';

export function Documentation() {
  const [expandedSection, setExpandedSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: {
        title: 'Quick Start Guide',
        description: 'Get LocalAI+ running in minutes with Docker or direct installation.',
        steps: [
          {
            title: '1. Install Prerequisites',
            description: 'Make sure you have Docker and Ollama installed.',
            code: `# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull mistral:latest`
          },
          {
            title: '2. Start LocalAI+',
            description: 'Run LocalAI+ with Docker Compose.',
            code: `# Clone the repository
git clone https://github.com/localai-plus/localai-plus
cd localai-plus

# Start with Docker Compose
docker-compose up -d`
          },
          {
            title: '3. Test the API',
            description: 'Send your first request to the chat completions endpoint.',
            code: `curl -X POST "http://localhost:8000/v1/chat/completions" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "mistral:latest",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`
          }
        ]
      }
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: Code,
      content: {
        title: 'API Endpoints',
        description: 'Complete reference for all LocalAI+ endpoints.',
        endpoints: [
          {
            method: 'POST',
            path: '/v1/chat/completions',
            title: 'Chat Completions',
            description: 'Generate chat responses with support for function calling and streaming.'
          },
          {
            method: 'POST',
            path: '/v1/embeddings',
            title: 'Create Embeddings',
            description: 'Generate vector embeddings for text input.'
          },
          {
            method: 'POST',
            path: '/v1/code/execute',
            title: 'Code Execution',
            description: 'Execute Python code in a secure sandbox environment.'
          },
          {
            method: 'GET',
            path: '/v1/tools',
            title: 'List Tools',
            description: 'Get available function calling tools.'
          }
        ]
      }
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: Settings,
      content: {
        title: 'Configuration Options',
        description: 'Customize LocalAI+ for your specific needs.',
        configs: [
          {
            key: 'OLLAMA_BASE_URL',
            type: 'string',
            default: 'http://localhost:11434',
            description: 'URL of your Ollama instance'
          },
          {
            key: 'DEFAULT_MODEL',
            type: 'string',
            default: 'mistral:latest',
            description: 'Default model for chat completions'
          },
          {
            key: 'ENABLE_CODE_EXECUTION',
            type: 'boolean',
            default: 'true',
            description: 'Enable/disable code interpreter'
          },
          {
            key: 'CODE_TIMEOUT',
            type: 'integer',
            default: '30',
            description: 'Code execution timeout in seconds'
          }
        ]
      }
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      content: {
        title: 'Security Features',
        description: 'LocalAI+ includes comprehensive security measures for production use.',
        features: [
          {
            title: 'API Key Authentication',
            description: 'Secure your API with configurable API keys and JWT tokens.'
          },
          {
            title: 'Code Sandboxing',
            description: 'Python code execution is isolated with resource limits and timeout controls.'
          },
          {
            title: 'Input Sanitization',
            description: 'All inputs are validated and sanitized to prevent injection attacks.'
          },
          {
            title: 'Rate Limiting',
            description: 'Built-in rate limiting to prevent abuse and ensure fair usage.'
          }
        ]
      }
    },
    {
      id: 'plugins',
      title: 'Plugin Development',
      icon: Puzzle,
      content: {
        title: 'Creating Custom Plugins',
        description: 'Extend LocalAI+ with custom tools and functions.',
        example: `# Example plugin structure
class WeatherPlugin:
    """Weather information plugin"""
    
    PLUGIN_INFO = {
        "name": "weather",
        "version": "1.0.0",
        "description": "Get weather information for any location",
        "author": "LocalAI+ Team",
        "functions": [
            {
                "name": "get_weather",
                "description": "Get current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "Location name"
                        }
                    },
                    "required": ["location"]
                }
            }
        ]
    }
    
    async def get_weather(self, arguments):
        location = arguments.get("location")
        # Your weather API integration here
        return {
            "location": location,
            "temperature": "22°C",
            "condition": "Sunny",
            "success": True
        }`
      }
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
            Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete guides, API reference, and examples to help you build with LocalAI+.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Contents
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-all ${
                      expandedSection === section.id
                        ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <section.icon className="w-4 h-4" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Full API Docs</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-3"
          >
            {sections.map((section) => (
              <div
                key={section.id}
                className={`${expandedSection === section.id ? 'block' : 'hidden'}`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
                    <section.icon className="w-8 h-8 mr-3 text-blue-400" />
                    {section.content.title}
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">{section.content.description}</p>

                  {/* Getting Started Steps */}
                  {section.content.steps && (
                    <div className="space-y-8">
                      {section.content.steps.map((step, index) => (
                        <div key={index} className="border border-white/10 rounded-xl p-6">
                          <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                          <p className="text-gray-300 mb-4">{step.description}</p>
                          <div className="bg-black/40 rounded-lg p-4">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                              {step.code}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* API Endpoints */}
                  {section.content.endpoints && (
                    <div className="space-y-4">
                      {section.content.endpoints.map((endpoint, index) => (
                        <div key={index} className="border border-white/10 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-2 py-1 rounded text-xs font-mono ${
                              endpoint.method === 'GET' ? 'bg-green-500' : 'bg-blue-500'
                            } text-white`}>
                              {endpoint.method}
                            </span>
                            <span className="font-mono text-gray-300">{endpoint.path}</span>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">{endpoint.title}</h4>
                          <p className="text-gray-300">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Configuration Options */}
                  {section.content.configs && (
                    <div className="space-y-4">
                      {section.content.configs.map((config, index) => (
                        <div key={index} className="border border-white/10 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="font-mono text-blue-400">{config.key}</span>
                            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">
                              {config.type}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{config.description}</p>
                          <p className="text-sm text-gray-400">
                            Default: <span className="font-mono">{config.default}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security Features */}
                  {section.content.features && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.content.features.map((feature, index) => (
                        <div key={index} className="border border-white/10 rounded-xl p-6">
                          <h4 className="text-lg font-semibold text-white mb-3">{feature.title}</h4>
                          <p className="text-gray-300">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plugin Example */}
                  {section.content.example && (
                    <div className="bg-black/40 rounded-lg p-6">
                      <pre className="text-blue-300 text-sm overflow-x-auto whitespace-pre-wrap">
                        {section.content.example}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Documentation;