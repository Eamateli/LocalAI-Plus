import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.core.security import verify_api_key
from app.api.v1 import chat, completions, embeddings, models, tools, rag, code
from app.services.model_registry import ModelRegistry
from app.services.redis_service import RedisService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global services
model_registry = None
redis_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global model_registry, redis_service
    
    logger.info("Starting LocalAI+ server...")
    
    # Initialize database
    await init_db()
    
    # Initialize Redis
    redis_service = RedisService()
    await redis_service.connect()
    
    # Initialize model registry
    model_registry = ModelRegistry()
    await model_registry.initialize()
    
    # Store in app state
    app.state.model_registry = model_registry
    app.state.redis_service = redis_service
    
    logger.info("LocalAI+ server started successfully!")
    
    yield
    
    # Cleanup
    logger.info("Shutting down LocalAI+ server...")
    if redis_service:
        await redis_service.disconnect()
    if model_registry:
        await model_registry.cleanup()
    logger.info("LocalAI+ server shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="LocalAI+",
    description="Production-grade OpenAI-compatible API for local LLMs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

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

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key authentication"""
    if not await verify_api_key(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": len(app.state.model_registry.models) if hasattr(app.state, 'model_registry') else 0
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "LocalAI+",
        "description": "Production-grade OpenAI-compatible API for local LLMs",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "chat": "/v1/chat/completions",
            "completions": "/v1/completions", 
            "embeddings": "/v1/embeddings",
            "models": "/v1/models",
            "tools": "/v1/tools/execute",
            "rag": "/v1/rag/search",
            "code": "/v1/code/execute"
        }
    }

# Include API routers
app.include_router(
    chat.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)
app.include_router(
    completions.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)
app.include_router(
    embeddings.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)
app.include_router(models.router, prefix="/v1")
app.include_router(
    tools.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)
app.include_router(
    rag.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)
app.include_router(
    code.router,
    prefix="/v1",
    dependencies=[Depends(get_current_user)] if settings.REQUIRE_AUTH else []
)

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "type": "http_error",
                "code": exc.status_code
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error",
                "type": "server_error",
                "code": 500
            }
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )