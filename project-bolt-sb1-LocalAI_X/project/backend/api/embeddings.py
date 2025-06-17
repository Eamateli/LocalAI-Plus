"""
Embeddings API - OpenAI compatible
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Union
import time
import structlog

from core.security import security, verify_token
from services.ollama_client import OllamaService
from services.vector_store import VectorStoreService

logger = structlog.get_logger()
embeddings_router = APIRouter()

class EmbeddingRequest(BaseModel):
    input: Union[str, List[str]] = Field(..., description="Text to embed")
    model: str = Field("nomic-embed-text", description="Embedding model to use")
    encoding_format: Optional[str] = Field("float", description="Encoding format")

class EmbeddingResponse(BaseModel):
    object: str = "list"
    data: List[dict]
    model: str
    usage: dict

@embeddings_router.post("/embeddings")
async def create_embeddings(
    request: EmbeddingRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Create embeddings (OpenAI-compatible)
    
    Generate vector embeddings for text input using local embedding models.
    Supports both single strings and arrays of strings.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        ollama_service = OllamaService()
        
        # Handle both string and list inputs
        texts = request.input if isinstance(request.input, list) else [request.input]
        
        embeddings_data = []
        total_tokens = 0
        
        for i, text in enumerate(texts):
            # Generate embedding
            embedding = await ollama_service.generate_embedding(text, request.model)
            
            embeddings_data.append({
                "object": "embedding",
                "index": i,
                "embedding": embedding
            })
            
            total_tokens += len(text.split())
        
        return EmbeddingResponse(
            data=embeddings_data,
            model=request.model,
            usage={
                "prompt_tokens": total_tokens,
                "total_tokens": total_tokens
            }
        )
        
    except Exception as e:
        logger.error("Embedding generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@embeddings_router.post("/search")
async def semantic_search(
    query: str,
    collection: Optional[str] = None,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Semantic search using vector embeddings
    
    Search for similar documents using vector similarity search.
    This enables RAG (Retrieval Augmented Generation) capabilities.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        vector_service = VectorStoreService()
        
        # Generate query embedding
        ollama_service = OllamaService()
        query_embedding = await ollama_service.generate_embedding(query)
        
        # Search for similar vectors
        results = await vector_service.search(
            query_embedding=query_embedding,
            collection_name=collection,
            limit=limit
        )
        
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error("Semantic search failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@embeddings_router.post("/store")
async def store_embeddings(
    texts: List[str],
    metadata: Optional[List[dict]] = None,
    collection: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Store text embeddings in vector database
    
    Store documents with their embeddings for later retrieval.
    Essential for building RAG systems.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        ollama_service = OllamaService()
        vector_service = VectorStoreService()
        
        stored_ids = []
        
        for i, text in enumerate(texts):
            # Generate embedding
            embedding = await ollama_service.generate_embedding(text)
            
            # Store in vector database
            doc_metadata = metadata[i] if metadata and i < len(metadata) else {}
            doc_metadata["text"] = text
            
            doc_id = await vector_service.store(
                embedding=embedding,
                metadata=doc_metadata,
                collection_name=collection
            )
            
            stored_ids.append(doc_id)
        
        return {
            "stored_ids": stored_ids,
            "count": len(stored_ids),
            "collection": collection or "default"
        }
        
    except Exception as e:
        logger.error("Embedding storage failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Storage failed: {str(e)}")