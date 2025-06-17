"""
LocalAI+ - Production-grade OpenAI-compatible API for local LLMs
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.security import SecurityManager
from app.api.v1 import router as api_v1_router
from app.services.model_registry import ModelRegistry
from app.services.database import DatabaseManager
from app.services.redis_client import RedisManager

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global services
model_registry = ModelRegistry()
db_manager = DatabaseManager()
redis_manager = RedisManager()
security_manager = SecurityManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting LocalAI+ server...")
    
    # Initialize services
    await db_manager.initialize()
    await redis_manager.initialize()
    await model_registry.initialize()
    
    logger.info("LocalAI+ server started successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down LocalAI+ server...")
    await model_registry.cleanup()
    await redis_manager.cleanup()
    await db_manager.cleanup()

# Create FastAPI app
app = FastAPI(
    title="LocalAI+",
    description="Production-grade OpenAI-compatible API for local LLMs",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API routes
app.include_router(api_v1_router, prefix="/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": len(model_registry.models),
        "database": "connected" if await db_manager.is_healthy() else "disconnected",
        "redis": "connected" if await redis_manager.is_healthy() else "disconnected"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc) if settings.DEBUG else None}
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "LocalAI+",
        "version": "1.0.0",
        "description": "Production-grade OpenAI-compatible API for local LLMs",
        "endpoints": {
            "chat": "/v1/chat/completions",
            "completions": "/v1/completions",
            "embeddings": "/v1/embeddings",
            "models": "/v1/models",
            "tools": "/v1/tools/execute",
            "rag": "/v1/rag/search",
            "code": "/v1/code/execute"
        },
        "docs": "/docs" if settings.DEBUG else None
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )