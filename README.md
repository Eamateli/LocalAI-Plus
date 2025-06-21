# LocalAI+ 🚀
### (project-bolt-sb1-LocalAI_X)

**Production-Ready OpenAI-Compatible API for Local LLMs**

LocalAI+ is a comprehensive platform that wraps local LLMs with missing capabilities found in cloud APIs. It provides an OpenAI-compatible interface with advanced features like function calling, embeddings, code interpretation, and a plugin system. 
<img width="950" alt="Screenshot 2025-06-21 230553" src="https://github.com/user-attachments/assets/404e2dd3-84bf-4c29-9a1c-96a92baac0bd" />
<p align="center">
  <img src="https://github.com/user-attachments/assets/40bd17ad-a054-4c88-bfab-ccf8e5968304" width="50%" style="border-radius: 12px;" />
  <img src="https://github.com/user-attachments/assets/569348dd-c46a-4a6c-b480-16e9cf6b0f65" width="45%" style="border-radius: 12px;" />
</p>


## ✨ Features

- 🔄 **OpenAI-Compatible API** - Drop-in replacement for OpenAI's API
- 🛠️ **Function Calling** - Structured tool use with JSON schemas
- 🔍 **Embeddings & RAG** - Vector search with Qdrant integration
- 🐍 **Code Interpreter** - Secure Python execution sandbox
- 🔌 **Plugin System** - Extensible architecture for custom tools
- 🔒 **Enterprise Security** - API keys, rate limiting, input sanitization
- 📊 **Comprehensive Logging** - Structured logging with metrics
- 🎯 **Developer Experience** - Interactive playground, full documentation
- 🖥️ **Web Interface** - Modern React frontend with dashboard and management tools

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- [Ollama](https://ollama.ai/) installed and running
- A local model (e.g., `ollama pull mistral:latest`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/localai-plus/localai-plus
   cd localai-plus
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Test the API**
   ```bash
   curl -X POST "http://localhost:8000/v1/chat/completions" \
     -H "Authorization: Bearer test-key-12345" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "mistral:latest",
       "messages": [
         {"role": "user", "content": "Hello!"}
       ]
     }'
   ```

4. **Access the Web Interface**
   - Frontend Application: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Interactive API Playground: http://localhost:3000/playground

## 🎯 Web Interface Features

### 🏠 **Dashboard**
- Real-time system metrics (CPU, memory, disk usage)
- API request statistics and activity monitoring
- Service health status and uptime tracking
- Recent activity feed with detailed logs

### 🤖 **Model Manager**
- View and manage installed models
- Start/stop models with one click
- Download new models from Ollama registry
- Monitor model status and resource usage
- Model performance metrics

### 🔌 **Plugin Manager**
- Install and manage plugins
- Enable/disable plugins dynamically
- Browse available plugins from registry
- Create custom plugins with built-in editor
- Plugin function testing and debugging

### 🎮 **API Playground**
- Interactive testing of all API endpoints
- Real-time request/response visualization
- Syntax highlighting for JSON
- Copy requests as cURL commands
- Support for all LocalAI+ features (chat, embeddings, tools, code execution)

### 📚 **Documentation**
- Complete API reference with examples
- Step-by-step setup guides
- Plugin development tutorials
- Configuration options reference

## 📖 API Reference

### Chat Completions

```bash
POST /v1/chat/completions
```

OpenAI-compatible chat completions with support for:
- Multi-turn conversations
- Function calling with tools
- Streaming responses
- Temperature and token control

### Embeddings

```bash
POST /v1/embeddings
```

Generate vector embeddings for text input:

```json
{
  "input": ["Hello world", "LocalAI+ is awesome"],
  "model": "nomic-embed-text"
}
```

### Function Calling

Enable your models to use tools:

```json
{
  "model": "mistral:latest",
  "messages": [{"role": "user", "content": "What's 2+2 and the weather in NYC?"}],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "calculator",
        "description": "Perform calculations",
        "parameters": {
          "type": "object",
          "properties": {
            "expression": {"type": "string"}
          }
        }
      }
    }
  ]
}
```

### Code Interpreter

```bash
POST /v1/code/execute
```

Execute Python code securely:

```json
{
  "code": "print('Hello from Python!')\nresult = 2 + 2\nprint(f'2 + 2 = {result}')",
  "language": "python"
}
```

## 🔧 Configuration

Configure LocalAI+ using environment variables:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=mistral:latest

# Security
API_KEYS=your-api-key-1,your-api-key-2
SECRET_KEY=your-secret-key

# Vector Store
QDRANT_HOST=localhost
QDRANT_PORT=6333

# Code Interpreter
ENABLE_CODE_EXECUTION=true
CODE_TIMEOUT=30
CODE_MEMORY_LIMIT=128

# Database
DATABASE_URL=sqlite:///./localai.db
```

## 🔌 Plugin Development

Create custom tools by developing plugins:

```python
# plugins/weather_plugin.py
PLUGIN_INFO = {
    "name": "weather",
    "version": "1.0.0",
    "description": "Get weather information",
    "functions": [
        {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                },
                "required": ["location"]
            }
        }
    ]
}

async def get_weather(arguments):
    location = arguments.get("location")
    # Your weather API integration here
    return {"location": location, "temperature": "22°C"}
```

## 🔒 Security Features

- **API Key Authentication** - Secure your endpoints
- **Code Sandboxing** - Isolated Python execution
- **Input Sanitization** - Prevent injection attacks
- **Resource Limits** - CPU, memory, and timeout controls
- **Rate Limiting** - Prevent abuse
- **Comprehensive Logging** - Track all operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   LocalAI+      │    │     Ollama      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (LLM Host)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Qdrant      │
                       │ (Vector Store)  │
                       └─────────────────┘
```

## 🧪 Development

### Backend Development

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Frontend Development

```bash
npm install
npm run dev
```

### Running Tests

```bash
cd backend
pytest
```

## 📊 Monitoring

LocalAI+ includes comprehensive monitoring:

- **Health Checks** - `/health` endpoint
- **Metrics** - Prometheus-compatible metrics
- **Structured Logging** - JSON logs with correlation IDs
- **Usage Tracking** - API usage statistics
- **Real-time Dashboard** - Web-based monitoring interface

## 🛠️ Built-in Tools

LocalAI+ comes with several built-in tools:

- **Calculator** - Mathematical expressions and calculations
- **Weather** - Weather information (mock implementation)
- **Web Search** - Search functionality (mock implementation)
- **Code Interpreter** - Secure Python code execution

## 🌐 Frontend Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications
- **Syntax Highlighter** - Code highlighting
- **Lucide React** - Beautiful icons

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

LocalAI+ is open source software licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Qdrant](https://qdrant.tech/) - Vector database
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://reactjs.org/) - Frontend framework
- [OpenAI](https://openai.com/) - API design inspiration

## 🆘 Support

- 📖 [Documentation](http://localhost:8000/docs)
- 🐛 [Issues](https://github.com/localai-plus/localai-plus/issues)
- 💬 [Discussions](https://github.com/localai-plus/localai-plus/discussions)
- 🔗 [Discord Community](https://discord.gg/localai-plus)

---

**Made with ❤️ for the AI community**
