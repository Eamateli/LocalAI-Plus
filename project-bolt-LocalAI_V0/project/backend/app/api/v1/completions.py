import asyncio
import uuid
from typing import List, Optional, Union, AsyncGenerator
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CompletionRequest(BaseModel):
    model: str = Field(..., description="Model to use for completion")
    prompt: Union[str, List[str]] = Field(..., description="Prompt(s) to complete")
    max_tokens: Optional[int] = Field(16, gt=0)
    temperature: Optional[float] = Field(0.7, ge=0, le=2)
    top_p: Optional[float] = Field(1.0, ge=0, le=1)
    n: Optional[int] = Field(1, ge=1, le=10)
    stream: Optional[bool] = Field(False)
    stop: Optional[Union[str, List[str]]] = Field(None)
    presence_penalty: Optional[float] = Field(0, ge=-2, le=2)
    frequency_penalty: Optional[float] = Field(0, ge=-2, le=2)
    user: Optional[str] = Field(None)

class CompletionChoice(BaseModel):
    text: str
    index: int
    finish_reason: Optional[str] = None

class CompletionResponse(BaseModel):
    id: str
    object: str = "text_completion"
    created: int
    model: str
    choices: List[CompletionChoice]
    usage: Optional[dict] = None

class CompletionChunk(BaseModel):
    id: str
    object: str = "text_completion"
    created: int
    model: str
    choices: List[dict]

async def stream_completion_response(
    model_registry,
    request: CompletionRequest
) -> AsyncGenerator[str, None]:
    """Stream completion response"""
    
    completion_id = f"cmpl-{uuid.uuid4().hex[:8]}"
    created = int(asyncio.get_event_loop().time())
    
    try:
        # Handle single prompt
        prompt = request.prompt if isinstance(request.prompt, str) else request.prompt[0]
        
        # Convert to chat format for Ollama
        messages = [{"role": "user", "content": prompt}]
        
        # Stream from model
        response_stream = await model_registry.generate_chat(
            model_name=request.model,
            messages=messages,
            stream=True,
            temperature=request.temperature,
            top_p=request.top_p,
            stop=request.stop if isinstance(request.stop, list) else [request.stop] if request.stop else None
        )
        
        # Stream chunks
        async for chunk in response_stream:
            if 'message' in chunk and 'content' in chunk['message']:
                content = chunk['message']['content']
                
                chunk_data = CompletionChunk(
                    id=completion_id,
                    created=created,
                    model=request.model,
                    choices=[{
                        "text": content,
                        "index": 0,
                        "finish_reason": None
                    }]
                )
                
                yield f"data: {chunk_data.model_dump_json()}\n\n"
        
        # Send final chunk
        final_chunk = CompletionChunk(
            id=completion_id,
            created=created,
            model=request.model,
            choices=[{
                "text": "",
                "index": 0,
                "finish_reason": "stop"
            }]
        )
        
        yield f"data: {final_chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Error in stream_completion_response: {e}")
        error_chunk = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "code": 500
            }
        }
        yield f"data: {json.dumps(error_chunk)}\n\n"

@router.post("/completions")
async def create_completion(request: CompletionRequest, fastapi_request: Request):
    """Create a text completion"""
    
    model_registry = fastapi_request.app.state.model_registry
    
    try:
        # Validate model exists
        model = await model_registry.get_model(request.model)
        if not model:
            raise HTTPException(
                status_code=400,
                detail=f"Model '{request.model}' not found"
            )
        
        # Handle streaming
        if request.stream:
            return StreamingResponse(
                stream_completion_response(model_registry, request),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream"
                }
            )
        
        # Non-streaming response
        prompt = request.prompt if isinstance(request.prompt, str) else request.prompt[0]
        messages = [{"role": "user", "content": prompt}]
        
        response = await model_registry.generate_chat(
            model_name=request.model,
            messages=messages,
            stream=False,
            temperature=request.temperature,
            top_p=request.top_p,
            stop=request.stop if isinstance(request.stop, list) else [request.stop] if request.stop else None
        )
        
        # Format response
        completion_id = f"cmpl-{uuid.uuid4().hex[:8]}"
        created = int(asyncio.get_event_loop().time())
        
        choice = CompletionChoice(
            text=response['message']['content'],
            index=0,
            finish_reason="stop"
        )
        
        return CompletionResponse(
            id=completion_id,
            created=created,
            model=request.model,
            choices=[choice],
            usage={
                "prompt_tokens": response.get('prompt_eval_count', 0),
                "completion_tokens": response.get('eval_count', 0),
                "total_tokens": response.get('prompt_eval_count', 0) + response.get('eval_count', 0)
            }
        )
        
    except Exception as e:
        logger.error(f"Error in create_completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))