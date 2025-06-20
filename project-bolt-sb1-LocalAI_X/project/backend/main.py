"""
LocalAI+ - Production-Ready Local LLM API Platform
OpenAI-compatible API wrapper for local LLMs with advanced features
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse, JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv
import structlog

# Import our modules
from api.chat import chat_router
from api.embeddings import embeddings_router
from api.tools import tools_router
from api.code_interpreter import code_router
from api.plugins import plugins_router
from core.config import settings
from core.database import init_db
from core.security import verify_token
from utils.logging import setup_logging
from services.ollama_client import OllamaService
from services.vector_store import VectorStoreService

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("🚀 Starting LocalAI+ Platform")
    
    # Initialize database
    await init_db()
    
    # Initialize services
    await OllamaService().health_check()
    await VectorStoreService().initialize()
    
    logger.info("✅ LocalAI+ Platform started successfully")
    yield
    
    logger.info("🛑 Shutting down LocalAI+ Platform")

# Create FastAPI app
app = FastAPI(
    title="LocalAI+ API",
    description="""
    🚀 **LocalAI+** - Production-Ready Local LLM API Platform
    
    OpenAI-compatible API wrapper for local LLMs with advanced capabilities:
    
    ## Features
    - 💬 **Chat Completions** - OpenAI-compatible chat API
    - 🛠️ **Function Calling** - Structured tool use with JSON schemas
    - 🔍 **Embeddings & RAG** - Vector search and retrieval augmented generation
    - 🐍 **Code Interpreter** - Secure Python code execution
    - 🔌 **Plugin System** - Modular tool architecture
    - 🔒 **Security** - API key authentication and sandboxing
    
    ## Getting Started
    1. Ensure Ollama is running with your preferred model
    2. Configure your API key in the Authorization header
    3. Start making requests to the endpoints below
    
    Happy coding! 🎉
    """,
    version="1.0.0",
    contact={
        "name": "LocalAI+ Team",
        "url": "https://github.com/Eamateli/LocalAI-Plus/tree/main/project-bolt-sb1-LocalAI_X/project",
    },
    license_info={
        "name": "MIT",
        "url": "https://github.com/Eamateli/LocalAI-Plus/tree/main?tab=MIT-1-ov-file",
    },
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Include routers
app.include_router(chat_router, prefix="/v1", tags=["Chat"])
app.include_router(embeddings_router, prefix="/v1", tags=["Embeddings"])
app.include_router(tools_router, prefix="/v1", tags=["Tools"])
app.include_router(code_router, prefix="/v1", tags=["Code Interpreter"])
app.include_router(plugins_router, prefix="/v1", tags=["Plugins"])

@app.get("/", tags=["Root"])
async def root():
    """Welcome to LocalAI+"""
    return {
        "message": "🚀 Welcome to LocalAI+ - Your Local LLM Powerhouse!",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Check Ollama connection
        ollama_healthy = await OllamaService().health_check()
        
        # Check vector store connection
        vector_healthy = await VectorStoreService().health_check()
        
        return {
            "status": "healthy",
            "services": {
                "ollama": "healthy" if ollama_healthy else "unhealthy",
                "vector_store": "healthy" if vector_healthy else "unhealthy"
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/models", tags=["Models"])
async def list_models(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """List available models (OpenAI-compatible)"""
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        models = await OllamaService().list_models()
        return {
            "object": "list",
            "data": [
                {
                    "id": model["name"],
                    "object": "model",
                    "created": 1677610602,
                    "owned_by": "localai-plus",
                    "permission": [],
                    "root": model["name"],
                    "parent": None
                }
                for model in models
            ]
        }
    except Exception as e:
        logger.error("Failed to list models", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve models")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )