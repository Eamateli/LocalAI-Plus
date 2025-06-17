"""
Chat completions API - OpenAI compatible
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import json
import asyncio
import time
import uuid
import structlog

from core.security import security, verify_token
from services.ollama_client import OllamaService
from services.function_calling import FunctionCallingService
from utils.streaming import StreamingResponseGenerator

logger = structlog.get_logger()
chat_router = APIRouter()

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: system, user, or assistant")
    content: str = Field(..., description="Message content")
    name: Optional[str] = Field(None, description="Optional name for the message")

class FunctionDefinition(BaseModel):
    name: str = Field(..., description="Function name")
    description: str = Field(..., description="Function description")
    parameters: Dict[str, Any] = Field(..., description="Function parameters schema")

class ToolDefinition(BaseModel):
    type: str = Field("function", description="Tool type")
    function: FunctionDefinition = Field(..., description="Function definition")

class ChatCompletionRequest(BaseModel):
    model: str = Field(..., description="Model to use for completion")
    messages: List[ChatMessage] = Field(..., description="List of messages")
    temperature: Optional[float] = Field(0.7, ge=0, le=2, description="Sampling temperature")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    stream: Optional[bool] = Field(False, description="Whether to stream responses")
    tools: Optional[List[ToolDefinition]] = Field(None, description="Available tools")
    tool_choice: Optional[Union[str, Dict[str, Any]]] = Field("auto", description="Tool choice strategy")
    
class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]

@chat_router.post("/chat/completions")
async def create_chat_completion(
    request: ChatCompletionRequest,
    background_tasks: BackgroundTasks,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Create a chat completion (OpenAI-compatible)
    
    This endpoint provides OpenAI-compatible chat completions with support for:
    - Multi-turn conversations
    - Function calling with tools
    - Streaming responses
    - Temperature and token control
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        ollama_service = OllamaService()
        function_service = FunctionCallingService()
        
        # Prepare messages for the model
        formatted_messages = []
        for msg in request.messages:
            formatted_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Handle function calling
        available_tools = {}
        if request.tools:
            for tool in request.tools:
                available_tools[tool.function.name] = {
                    "description": tool.function.description,
                    "parameters": tool.function.parameters,
                    "function": tool.function
                }
            
            # Add system message about available tools
            tool_prompt = function_service.generate_tool_prompt(available_tools)
            formatted_messages.insert(0, {
                "role": "system",
                "content": tool_prompt
            })
        
        # Generate completion ID
        completion_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
        created_timestamp = int(time.time())
        
        if request.stream:
            # Streaming response
            async def generate_stream():
                try:
                    async for chunk in ollama_service.stream_chat(
                        model=request.model,
                        messages=formatted_messages,
                        temperature=request.temperature,
                        max_tokens=request.max_tokens
                    ):
                        # Format as OpenAI streaming response
                        stream_chunk = {
                            "id": completion_id,
                            "object": "chat.completion.chunk",
                            "created": created_timestamp,
                            "model": request.model,
                            "choices": [{
                                "index": 0,
                                "delta": {"content": chunk},
                                "finish_reason": None
                            }]
                        }
                        yield f"data: {json.dumps(stream_chunk)}\n\n"
                    
                    # Send final chunk
                    final_chunk = {
                        "id": completion_id,
                        "object": "chat.completion.chunk",
                        "created": created_timestamp,
                        "model": request.model,
                        "choices": [{
                            "index": 0,
                            "delta": {},
                            "finish_reason": "stop"
                        }]
                    }
                    yield f"data: {json.dumps(final_chunk)}\n\n"
                    yield "data: [DONE]\n\n"
                    
                except Exception as e:
                    logger.error("Streaming error", error=str(e))
                    error_chunk = {
                        "error": {
                            "message": str(e),
                            "type": "server_error"
                        }
                    }
                    yield f"data: {json.dumps(error_chunk)}\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache"}
            )
        
        else:
            # Non-streaming response
            response_content = await ollama_service.chat_completion(
                model=request.model,
                messages=formatted_messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            # Check for function calls
            function_calls = []
            if available_tools:
                function_calls = function_service.extract_function_calls(response_content)
            
            # Execute function calls if any
            if function_calls:
                for call in function_calls:
                    if call["name"] in available_tools:
                        try:
                            result = await function_service.execute_function(
                                call["name"],
                                call["arguments"],
                                available_tools[call["name"]]
                            )
                            # Add function result to conversation
                            formatted_messages.append({
                                "role": "assistant",
                                "content": f"I'll use the {call['name']} function with these parameters: {call['arguments']}"
                            })
                            formatted_messages.append({
                                "role": "function",
                                "name": call["name"],
                                "content": json.dumps(result)
                            })
                        except Exception as e:
                            logger.error("Function execution failed", function=call["name"], error=str(e))
                
                # Get final response after function calls
                response_content = await ollama_service.chat_completion(
                    model=request.model,
                    messages=formatted_messages,
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                )
            
            # Format OpenAI-compatible response
            return ChatCompletionResponse(
                id=completion_id,
                created=created_timestamp,
                model=request.model,
                choices=[{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_content
                    },
                    "finish_reason": "stop"
                }],
                usage={
                    "prompt_tokens": len(json.dumps(formatted_messages)),
                    "completion_tokens": len(response_content.split()),
                    "total_tokens": len(json.dumps(formatted_messages)) + len(response_content.split())
                }
            )
            
    except Exception as e:
        logger.error("Chat completion failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Chat completion failed: {str(e)}")

@chat_router.get("/chat/models")
async def list_chat_models():
    """List available chat models"""
    try:
        ollama_service = OllamaService()
        models = await ollama_service.list_models()
        return {"models": models}
    except Exception as e:
        logger.error("Failed to list models", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to list models")