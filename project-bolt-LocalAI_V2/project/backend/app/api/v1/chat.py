"""
OpenAI-compatible chat completions endpoint
"""
import json
import time
import uuid
from typing import List, Optional, Dict, Any, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import logging

from app.core.security import get_api_key_auth
from app.services.model_registry import ModelRegistry

logger = logging.getLogger(__name__)
router = APIRouter()

# Global model registry instance
model_registry = ModelRegistry()

class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="The role of the message author")
    content: str = Field(..., description="The content of the message")
    name: Optional[str] = Field(None, description="The name of the message author")

class FunctionCall(BaseModel):
    """Function call model"""
    name: str = Field(..., description="The name of the function to call")
    arguments: str = Field(..., description="The arguments to pass to the function")

class ChatCompletionRequest(BaseModel):
    """Chat completion request model"""
    model: str = Field(..., description="ID of the model to use")
    messages: List[ChatMessage] = Field(..., description="Messages comprising the conversation")
    temperature: Optional[float] = Field(0.7, ge=0, le=2, description="Sampling temperature")
    max_tokens: Optional[int] = Field(None, ge=1, description="Maximum number of tokens to generate")
    stream: Optional[bool] = Field(False, description="Whether to stream back partial progress")
    stop: Optional[List[str]] = Field(None, description="Up to 4 sequences where the API will stop generating")
    presence_penalty: Optional[float] = Field(0, ge=-2, le=2, description="Presence penalty")
    frequency_penalty: Optional[float] = Field(0, ge=-2, le=2, description="Frequency penalty")
    top_p: Optional[float] = Field(1, gt=0, le=1, description="Nucleus sampling parameter")
    functions: Optional[List[Dict[str, Any]]] = Field(None, description="Available functions")
    function_call: Optional[str] = Field(None, description="Function call behavior")

class ChatCompletionChoice(BaseModel):
    """Chat completion choice model"""
    index: int
    message: Optional[ChatMessage] = None
    delta: Optional[Dict[str, Any]] = None
    finish_reason: Optional[str] = None

class ChatCompletionUsage(BaseModel):
    """Token usage statistics"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatCompletionResponse(BaseModel):
    """Chat completion response model"""
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[ChatCompletionChoice]
    usage: Optional[ChatCompletionUsage] = None

async def stream_chat_completion(
    request: ChatCompletionRequest,
    user_info: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """Stream chat completion responses"""
    try:
        async for chunk in model_registry.generate_completion(
            model_name=request.model,
            messages=[msg.dict() for msg in request.messages],
            stream=True,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p
        ):
            # Format as server-sent event
            yield f"data: {json.dumps(chunk)}\n\n"
        
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming chat completion: {e}")
        error_chunk = {
            "id": f"chatcmpl-{uuid.uuid4()}",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": request.model,
            "choices": [],
            "error": {"message": str(e), "type": "api_error"}
        }
        yield f"data: {json.dumps(error_chunk)}\n\n"

@router.post("/chat/completions")
async def create_chat_completion(
    request: ChatCompletionRequest,
    user_info: Dict[str, Any] = Depends(get_api_key_auth)
):
    """
    Create a chat completion, either non-streaming or streaming.
    Compatible with OpenAI's chat/completions API.
    """
    try:
        logger.info(f"Chat completion request for model: {request.model}")
        
        # Validate model exists
        available_models = await model_registry.get_available_models()
        model_ids = [model["id"] for model in available_models]
        
        if request.model not in model_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Model {request.model} not found. Available models: {model_ids}"
            )
        
        # Handle streaming response
        if request.stream:
            return StreamingResponse(
                stream_chat_completion(request, user_info),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                }
            )
        
        # Handle non-streaming response
        response_data = None
        async for chunk in model_registry.generate_completion(
            model_name=request.model,
            messages=[msg.dict() for msg in request.messages],
            stream=False,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            top_p=request.top_p
        ):
            response_data = chunk
            break  # Only take the first (and only) response for non-streaming
        
        if not response_data:
            raise HTTPException(status_code=500, detail="No response generated")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat completion: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/chat/models")
async def list_chat_models(
    user_info: Dict[str, Any] = Depends(get_api_key_auth)
):
    """List available chat models"""
    try:
        models = await model_registry.get_available_models()
        # Filter to only chat models (non-embedding models)
        chat_models = [model for model in models if not model.get("embedding_model", False)]
        
        return {
            "object": "list",
            "data": chat_models
        }
        
    except Exception as e:
        logger.error(f"Error listing chat models: {e}")
        raise HTTPException(status_code=500, detail="Failed to list models")