import asyncio
import json
import uuid
from typing import List, Optional, Dict, Any, AsyncGenerator
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: user, assistant, or system")
    content: str = Field(..., description="Message content")
    name: Optional[str] = Field(None, description="Optional name for the message")

class FunctionCall(BaseModel):
    name: str
    arguments: str

class ToolCall(BaseModel):
    id: str
    type: str = "function"
    function: FunctionCall

class ChatCompletionRequest(BaseModel):
    model: str = Field(..., description="Model to use for completion")
    messages: List[ChatMessage] = Field(..., description="List of messages")
    temperature: Optional[float] = Field(0.7, ge=0, le=2)
    top_p: Optional[float] = Field(1.0, ge=0, le=1)
    max_tokens: Optional[int] = Field(None, gt=0)
    stream: Optional[bool] = Field(False)
    stop: Optional[List[str]] = Field(None)
    presence_penalty: Optional[float] = Field(0, ge=-2, le=2)
    frequency_penalty: Optional[float] = Field(0, ge=-2, le=2)
    user: Optional[str] = Field(None)
    tools: Optional[List[Dict[str, Any]]] = Field(None)
    tool_choice: Optional[str] = Field(None)

class ChatCompletionChoice(BaseModel):
    index: int
    message: ChatMessage
    finish_reason: Optional[str] = None

class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[ChatCompletionChoice]
    usage: Optional[Dict[str, int]] = None

class ChatCompletionChunk(BaseModel):
    id: str
    object: str = "chat.completion.chunk"
    created: int
    model: str
    choices: List[Dict[str, Any]]

async def stream_chat_response(
    model_registry,
    request: ChatCompletionRequest
) -> AsyncGenerator[str, None]:
    """Stream chat completion response"""
    
    completion_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
    created = int(asyncio.get_event_loop().time())
    
    try:
        # Convert messages to Ollama format
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        # Stream from model
        response_stream = await model_registry.generate_chat(
            model_name=request.model,
            messages=messages,
            stream=True,
            temperature=request.temperature,
            top_p=request.top_p,
            stop=request.stop
        )
        
        # Stream chunks
        async for chunk in response_stream:
            if 'message' in chunk and 'content' in chunk['message']:
                content = chunk['message']['content']
                
                chunk_data = ChatCompletionChunk(
                    id=completion_id,
                    created=created,
                    model=request.model,
                    choices=[{
                        "index": 0,
                        "delta": {"content": content},
                        "finish_reason": None
                    }]
                )
                
                yield f"data: {chunk_data.model_dump_json()}\n\n"
        
        # Send final chunk
        final_chunk = ChatCompletionChunk(
            id=completion_id,
            created=created,
            model=request.model,
            choices=[{
                "index": 0,
                "delta": {},
                "finish_reason": "stop"
            }]
        )
        
        yield f"data: {final_chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Error in stream_chat_response: {e}")
        error_chunk = {
            "error": {
                "message": str(e),
                "type": "server_error",
                "code": 500
            }
        }
        yield f"data: {json.dumps(error_chunk)}\n\n"

@router.post("/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest, fastapi_request: Request):
    """Create a chat completion"""
    
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
                stream_chat_response(model_registry, request),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Content-Type": "text/event-stream"
                }
            )
        
        # Non-streaming response
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        response = await model_registry.generate_chat(
            model_name=request.model,
            messages=messages,
            stream=False,
            temperature=request.temperature,
            top_p=request.top_p,
            stop=request.stop
        )
        
        # Format response
        completion_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
        created = int(asyncio.get_event_loop().time())
        
        assistant_message = ChatMessage(
            role="assistant",
            content=response['message']['content']
        )
        
        choice = ChatCompletionChoice(
            index=0,
            message=assistant_message,
            finish_reason="stop"
        )
        
        return ChatCompletionResponse(
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
        logger.error(f"Error in create_chat_completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))