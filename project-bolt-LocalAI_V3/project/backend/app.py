from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import asyncio
from typing import List, Optional, Dict, Any
import logging
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LocalAI+",
    description="OpenAI-compatible API wrapper for local LLMs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class FunctionDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]

class ChatCompletionRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    functions: Optional[List[FunctionDefinition]] = None
    stream: bool = False
    temperature: float = 0.7
    max_tokens: Optional[int] = None

class EmbeddingRequest(BaseModel):
    model: str
    input: str

# Demo functions for function calling
DEMO_FUNCTIONS = {
    "get_weather": {
        "description": "Get current weather for a location",
        "handler": lambda location: {
            "location": location,
            "temperature": "72°F",
            "condition": "Sunny",
            "humidity": "45%"
        }
    },
    "calculate": {
        "description": "Perform mathematical calculations",
        "handler": lambda expression: {
            "expression": expression,
            "result": eval(expression) if is_safe_expression(expression) else "Error: Invalid expression"
        }
    }
}

def is_safe_expression(expr: str) -> bool:
    """Check if mathematical expression is safe to evaluate"""
    allowed_chars = set('0123456789+-*/.() ')
    return all(c in allowed_chars for c in expr)

async def check_ollama_health() -> bool:
    """Check if Ollama is running and accessible"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5.0)
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama health check failed: {e}")
        return False

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "LocalAI+ is running"}

@app.get("/health")
async def health_check():
    """Detailed health check including Ollama status"""
    ollama_healthy = await check_ollama_health()
    
    return {
        "status": "healthy" if ollama_healthy else "degraded",
        "ollama_status": "connected" if ollama_healthy else "disconnected",
        "message": "All systems operational" if ollama_healthy else "Ollama not accessible"
    }

@app.get("/v1/models")
async def list_models():
    """List available models from Ollama"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Ollama not accessible")
            
            ollama_models = response.json()
            models = []
            
            for model in ollama_models.get("models", []):
                models.append({
                    "id": model["name"],
                    "object": "model",
                    "created": 1677610602,
                    "owned_by": "ollama"
                })
            
            return {
                "object": "list",
                "data": models
            }
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Ollama: {e}")
        raise HTTPException(status_code=503, detail="Ollama server not accessible")

def parse_function_call(content: str) -> Optional[Dict[str, Any]]:
    """Parse function call from model response"""
    # Simple parsing for demo purposes
    # In production, you'd want more robust parsing
    if "get_weather(" in content:
        try:
            start = content.find("get_weather(") + 12
            end = content.find(")", start)
            location = content[start:end].strip('"\'')
            return {
                "name": "get_weather",
                "arguments": json.dumps({"location": location})
            }
        except:
            pass
    
    if "calculate(" in content:
        try:
            start = content.find("calculate(") + 10
            end = content.find(")", start)
            expression = content[start:end].strip('"\'')
            return {
                "name": "calculate",
                "arguments": json.dumps({"expression": expression})
            }
        except:
            pass
    
    return None

async def execute_function(function_call: Dict[str, Any]) -> Any:
    """Execute a function call"""
    function_name = function_call["name"]
    if function_name not in DEMO_FUNCTIONS:
        return {"error": f"Unknown function: {function_name}"}
    
    try:
        args = json.loads(function_call["arguments"])
        handler = DEMO_FUNCTIONS[function_name]["handler"]
        
        if function_name == "get_weather":
            return handler(args["location"])
        elif function_name == "calculate":
            return handler(args["expression"])
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    """OpenAI-compatible chat completions endpoint"""
    try:
        # Convert to Ollama format
        ollama_messages = []
        for msg in request.messages:
            ollama_messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add function calling context if functions are provided
        if request.functions:
            system_message = "You can call functions when appropriate. Available functions:\n"
            for func in request.functions:
                system_message += f"- {func.name}: {func.description}\n"
            system_message += "\nTo call a function, include the function call in your response like: function_name(argument)"
            
            ollama_messages.insert(0, {
                "role": "system",
                "content": system_message
            })
        
        payload = {
            "model": request.model,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": request.temperature
            }
        }
        
        if request.max_tokens:
            payload["options"]["num_predict"] = request.max_tokens
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Ollama request failed")
            
            result = response.json()
            content = result["message"]["content"]
            
            # Check for function calls
            function_call = None
            function_result = None
            
            if request.functions:
                function_call = parse_function_call(content)
                if function_call:
                    function_result = await execute_function(function_call)
            
            # Return OpenAI-compatible response
            return {
                "id": f"chatcmpl-{hash(content) % 1000000}",
                "object": "chat.completion",
                "created": 1677652288,
                "model": request.model,
                "choices": [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": content,
                        "function_call": function_call,
                        "function_result": function_result
                    },
                    "finish_reason": "stop"
                }],
                "usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0
                }
            }
            
    except httpx.RequestError as e:
        logger.error(f"Ollama request failed: {e}")
        raise HTTPException(status_code=503, detail="Ollama server not accessible")
    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/embeddings")
async def create_embeddings(request: EmbeddingRequest):
    """OpenAI-compatible embeddings endpoint"""
    try:
        payload = {
            "model": request.model,
            "prompt": request.input
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/embeddings",
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Ollama embeddings request failed")
            
            result = response.json()
            embedding = result.get("embedding", [])
            
            return {
                "object": "list",
                "data": [{
                    "object": "embedding",
                    "embedding": embedding,
                    "index": 0
                }],
                "model": request.model,
                "usage": {
                    "prompt_tokens": 0,
                    "total_tokens": 0
                }
            }
            
    except httpx.RequestError as e:
        logger.error(f"Embedding request failed: {e}")
        raise HTTPException(status_code=503, detail="Ollama server not accessible")
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)