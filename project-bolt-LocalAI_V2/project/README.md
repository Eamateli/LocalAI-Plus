# LocalAI+ 🚀

**Production-grade OpenAI-compatible API for local LLMs**

LocalAI+ is a comprehensive solution for running large language models locally with enterprise features like function calling, RAG, secure code execution, and persistent memory. Built for developers who want the power of OpenAI's API without the cloud dependency.

## ✨ Features

### 🎯 Core Capabilities
- **OpenAI API Compatibility** - Drop-in replacement for OpenAI API
- **Multi-Model Support** - GGUF (Ollama), vLLM, HuggingFace transformers
- **Real-time Streaming** - WebSocket and SSE streaming responses
- **Function Calling** - JSON schema validation and execution
- **RAG System** - Hybrid semantic + keyword search with Qdrant
- **Code Execution** - Secure Docker-based Python sandbox
- **Persistent Memory** - Anthropic-style conversation context
- **Multi-Personality Components** - Role-based AI personas

### 🏗️ Enterprise Ready
- **Authentication** - API key management with rate limiting
- **Production Security** - CORS, input validation, Docker sandboxing
- **Monitoring** - Comprehensive logging and health checks  
- **Scalability** - Redis caching, connection pooling
- **Documentation** - Auto-generated OpenAPI/Swagger docs

### 🎨 Modern Web UI
- **Beautiful Interface** - React + Tailwind with dark/light themes
- **Chat Playground** - Real-time streaming chat interface
- **Model Management** - Easy switching between local models
- **Library System** - Organized conversation history
- **Settings Panel** - Configuration management
- **Mobile Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for development)
- Node.js 18+ (for frontend development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/localai-plus.git
cd localai-plus
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your preferences
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Pull your first model (Ollama)**
```bash
docker exec -it localai-plus-ollama-1 ollama pull llama2
```

5. **Access the UI**
```
Frontend: http://localhost:5173
API Docs: http://localhost:8000/docs
Health Check: http://localhost:8000/health
```

## 📚 API Usage

### Chat Completions
```python
import openai

# Point to your local instance
openai.api_base = "http://localhost:8000/v1"
openai.api_key = "sk-dev-key"

response = openai.ChatCompletion.create(
    model="llama2",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.get("content", ""), end="")
```

### Function Calling
```python
response = openai.ChatCompletion.create(
    model="llama2",
    messages=[{"role": "user", "content": "What's the weather in NYC?"}],
    functions=[{
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            }
        }
    }]
)
```

### Embeddings
```python
response = openai.Embedding.create(
    model="text-embedding-ada-002",
    input=["Hello world", "How are you?"]
)
```

## 🏭 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI       │    │   PostgreSQL    │
│   (Frontend)    │◄───│   (Backend)     │◄───│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Ollama      │  │     Qdrant      │  │     Redis       │
│  (GGUF Models)  │  │  (Vector DB)    │  │   (Cache)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🛠️ Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend Development
```bash
npm install
npm run dev
```

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
npm test
```

## 🔧 Configuration

Key environment variables:

```env
# Core Settings
DEBUG=true
SECRET_KEY=your-secret-key-here

# Model Providers
OLLAMA_HOST=http://localhost:11434
VLLM_HOST=http://localhost:8001

# Database
POSTGRES_HOST=localhost
REDIS_HOST=localhost
QDRANT_HOST=localhost

# Features
ENABLE_FUNCTION_CALLING=true
ENABLE_CODE_EXECUTION=true
MAX_MODELS_IN_MEMORY=3
```

## 🎭 Advanced Features

### Model Context Protocol (MCP)
```python
# Define custom tools and contexts
await mcp_service.register_tool("calculator", calculator_tool)
await mcp_service.set_context("math_expert", expert_context)
```

### RAG System
```python
# Upload documents
await rag_service.upload_document("document.pdf")

# Query with context
response = await rag_service.query("What is the main topic?")
```

### Secure Code Execution
```python
# Execute Python code safely
result = await code_service.execute("""
import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(f"Mean: {arr.mean()}")
""")
```

## 🔒 Security

- **API Key Authentication** - Secure access control
- **Rate Limiting** - Prevent abuse and resource exhaustion  
- **Input Validation** - Comprehensive request validation
- **Docker Sandboxing** - Isolated code execution environment
- **CORS Configuration** - Proper cross-origin resource sharing
- **SQL Injection Protection** - Parameterized queries only

## 📊 Monitoring

Health check endpoint provides system status:
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0", 
  "models_loaded": 2,
  "database": "connected",
  "redis": "connected"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM serving
- [vLLM](https://vllm.ai/) - High-performance inference  
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python API framework
- [React](https://reactjs.org/) - Frontend framework
- [Qdrant](https://qdrant.tech/) - Vector database

## 🚨 Roadmap

- [ ] Kubernetes deployment manifests
- [ ] Multi-tenant support
- [ ] Advanced RAG with graph databases
- [ ] Voice-to-text integration
- [ ] Custom model fine-tuning interface
- [ ] Distributed model serving
- [ ] Advanced analytics dashboard

---

**LocalAI+ - Because your data should stay local** 🏠🤖