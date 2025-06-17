import React, { useState } from 'react';
import { FileText, Code, Book, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const sections = [
    { id: 'overview', name: 'Overview', icon: Book },
    { id: 'quickstart', name: 'Quick Start', icon: FileText },
    { id: 'api', name: 'API Reference', icon: Code },
    { id: 'examples', name: 'Examples', icon: ExternalLink },
  ];

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock: React.FC<{ code: string; language: string; id: string }> = ({ code, language, id }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
        >
          {copiedCode === id ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-xs">{copiedCode === id ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Learn how to use LocalAI+ for your local AI applications
          </p>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-4xl">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  LocalAI+ Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  LocalAI+ is a production-grade OpenAI-compatible API wrapper for local LLMs. 
                  It provides enterprise features like function calling, RAG, secure code execution, 
                  and persistent memory while maintaining full compatibility with OpenAI's API.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🚀 Core Features
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• OpenAI API Compatibility</li>
                    <li>• Multi-Model Support (GGUF, vLLM, HF)</li>
                    <li>• Real-time Streaming</li>
                    <li>• Function Calling</li>
                    <li>• RAG System</li>
                    <li>• Secure Code Execution</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    🏗️ Enterprise Ready
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• API Key Authentication</li>
                    <li>• Rate Limiting</li>
                    <li>• Production Security</li>
                    <li>• Comprehensive Logging</li>
                    <li>• Health Monitoring</li>
                    <li>• Docker Deployment</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Start Guide
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get LocalAI+ up and running in minutes with Docker Compose.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    1. Clone and Setup
                  </h3>
                  <CodeBlock
                    id="clone"
                    language="bash"
                    code={`git clone https://github.com/yourusername/localai-plus.git
cd localai-plus
cp .env.example .env`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    2. Start Services
                  </h3>
                  <CodeBlock
                    id="start"
                    language="bash"
                    code={`docker-compose up -d`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    3. Pull Your First Model
                  </h3>
                  <CodeBlock
                    id="model"
                    language="bash"
                    code={`docker exec -it localai-plus-ollama-1 ollama pull llama2`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    4. Access the Interface
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                      <li>• Frontend: <a href="http://localhost:5173" className="underline">http://localhost:5173</a></li>
                      <li>• API Docs: <a href="http://localhost:8000/docs" className="underline">http://localhost:8000/docs</a></li>
                      <li>• Health Check: <a href="http://localhost:8000/health" className="underline">http://localhost:8000/health</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  API Reference
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  LocalAI+ provides full OpenAI API compatibility. Use your existing OpenAI code 
                  by simply changing the base URL and API key.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Chat Completions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Create chat completions with streaming support.
                  </p>
                  <CodeBlock
                    id="chat"
                    language="curl"
                    code={`curl -X POST http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-dev-key" \\
  -d '{
    "model": "llama2",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": true,
    "temperature": 0.7,
    "max_tokens": 2048
  }'`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    List Models
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Get available models from all providers.
                  </p>
                  <CodeBlock
                    id="models"
                    language="curl"
                    code={`curl -X GET http://localhost:8000/v1/models \\
  -H "Authorization: Bearer sk-dev-key"`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Embeddings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Generate embeddings for text inputs.
                  </p>
                  <CodeBlock
                    id="embeddings"
                    language="curl"
                    code={`curl -X POST http://localhost:8000/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-dev-key" \\
  -d '{
    "model": "text-embedding-ada-002",
    "input": ["Hello world", "How are you?"]
  }'`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Code Examples
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Examples of using LocalAI+ with popular programming languages and frameworks.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Python with OpenAI Library
                  </h3>
                  <CodeBlock
                    id="python"
                    language="python"
                    code={`import openai

# Configure for LocalAI+
openai.api_base = "http://localhost:8000/v1"
openai.api_key = "sk-dev-key"

# Chat completion
response = openai.ChatCompletion.create(
    model="llama2",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.get("content", ""), end="")`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    JavaScript/Node.js
                  </h3>
                  <CodeBlock
                    id="javascript"
                    language="javascript"
                    code={`const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'sk-dev-key',
});

async function chat() {
  const stream = await openai.chat.completions.create({
    model: 'llama2',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

chat();`}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Function Calling
                  </h3>
                  <CodeBlock
                    id="functions"
                    language="python"
                    code={`response = openai.ChatCompletion.create(
    model="llama2",
    messages=[{"role": "user", "content": "What's the weather in NYC?"}],
    functions=[{
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            },
            "required": ["location"]
        }
    }]
)

if response.choices[0].message.function_call:
    function_name = response.choices[0].message.function_call.name
    arguments = response.choices[0].message.function_call.arguments
    print(f"Function: {function_name}, Args: {arguments}")`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;