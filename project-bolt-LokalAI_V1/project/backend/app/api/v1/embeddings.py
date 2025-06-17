from typing import List, Optional, Union
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class EmbeddingRequest(BaseModel):
    model: str = Field(..., description="Model to use for embeddings")
    input: Union[str, List[str]] = Field(..., description="Text to embed")
    user: Optional[str] = Field(None, description="User identifier")

class EmbeddingData(BaseModel):
    object: str = "embedding"
    index: int
    embedding: List[float]

class EmbeddingResponse(BaseModel):
    object: str = "list"
    data: List[EmbeddingData]
    model: str
    usage: dict

@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest, fastapi_request: Request):
    """Create embeddings for input text"""
    
    try:
        model_registry = fastapi_request.app.state.model_registry
        
        # Normalize input to list
        if isinstance(request.input, str):
            texts = [request.input]
        else:
            texts = request.input
        
        # Generate embeddings
        embeddings = await model_registry.generate_embedding(
            model_name=request.model,
            texts=texts
        )
        
        # Format response
        data = []
        for i, embedding in enumerate(embeddings):
            data.append(EmbeddingData(
                index=i,
                embedding=embedding
            ))
        
        return EmbeddingResponse(
            data=data,
            model=request.model,
            usage={
                "prompt_tokens": sum(len(text.split()) for text in texts),
                "total_tokens": sum(len(text.split()) for text in texts)
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))