"""
API v1 routes
"""
from fastapi import APIRouter
from .chat import router as chat_router
from .completions import router as completions_router
from .embeddings import router as embeddings_router
from .models import router as models_router
from .tools import router as tools_router
from .rag import router as rag_router
from .code import router as code_router

router = APIRouter()

# Include all sub-routers
router.include_router(chat_router, tags=["chat"])
router.include_router(completions_router, tags=["completions"])
router.include_router(embeddings_router, tags=["embeddings"])
router.include_router(models_router, tags=["models"])
router.include_router(tools_router, tags=["tools"])
router.include_router(rag_router, tags=["rag"])
router.include_router(code_router, tags=["code"])