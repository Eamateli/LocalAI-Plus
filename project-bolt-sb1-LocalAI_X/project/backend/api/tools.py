"""
Tools and function calling API
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import structlog

from core.security import security, verify_token
from services.function_calling import FunctionCallingService

logger = structlog.get_logger()
tools_router = APIRouter()

class ToolDefinition(BaseModel):
    name: str = Field(..., description="Tool name")
    description: str = Field(..., description="Tool description")
    parameters: Dict[str, Any] = Field(..., description="Tool parameters schema")

class ToolExecutionRequest(BaseModel):
    tool_name: str = Field(..., description="Name of tool to execute")
    arguments: Dict[str, Any] = Field(..., description="Tool arguments")

@tools_router.get("/tools")
async def list_tools(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    List all available tools
    
    Returns a list of all registered tools with their descriptions and parameters.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Built-in tools
    builtin_tools = [
        {
            "name": "calculator",
            "description": "Perform mathematical calculations",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Mathematical expression to evaluate (e.g., '2+2', '10*5', 'sqrt(16)')"
                    }
                },
                "required": ["expression"]
            }
        },
        {
            "name": "weather",
            "description": "Get weather information for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Location to get weather for (e.g., 'New York', 'London')"
                    }
                },
                "required": ["location"]
            }
        },
        {
            "name": "search",
            "description": "Search for information on the web",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        },
        {
            "name": "code_interpreter",
            "description": "Execute Python code in a secure sandbox",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to execute"
                    },
                    "language": {
                        "type": "string",
                        "description": "Programming language (currently only 'python')",
                        "default": "python"
                    }
                },
                "required": ["code"]
            }
        }
    ]
    
    return {
        "tools": builtin_tools,
        "count": len(builtin_tools)
    }

@tools_router.post("/tools/execute")
async def execute_tool(
    request: ToolExecutionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Execute a specific tool
    
    Execute a tool with the provided arguments and return the result.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        function_service = FunctionCallingService()
        
        # Create tool definition (simplified for direct execution)
        tool_definition = {"name": request.tool_name}
        
        result = await function_service.execute_function(
            function_name=request.tool_name,
            arguments=request.arguments,
            tool_definition=tool_definition
        )
        
        return {
            "tool": request.tool_name,
            "arguments": request.arguments,
            "result": result
        }
        
    except Exception as e:
        logger.error("Tool execution failed", tool=request.tool_name, error=str(e))
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")

@tools_router.get("/tools/{tool_name}")
async def get_tool_info(
    tool_name: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get detailed information about a specific tool
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Tool definitions
    tool_definitions = {
        "calculator": {
            "name": "calculator",
            "description": "Perform mathematical calculations with support for basic arithmetic, functions, and constants",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Mathematical expression to evaluate",
                        "examples": ["2+2", "sqrt(16)", "sin(pi/2)", "10*5-3"]
                    }
                },
                "required": ["expression"]
            },
            "examples": [
                {"expression": "2+2", "result": 4},
                {"expression": "sqrt(16)", "result": 4.0},
                {"expression": "10*5", "result": 50}
            ]
        },
        "weather": {
            "name": "weather",
            "description": "Get current weather information for any location worldwide",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "Location name (city, country, etc.)",
                        "examples": ["New York", "London", "Tokyo", "San Francisco"]
                    }
                },
                "required": ["location"]
            },
            "examples": [
                {"location": "New York", "result": "22°C, Partly cloudy"},
                {"location": "London", "result": "15°C, Rainy"}
            ]
        },
        "search": {
            "name": "search",
            "description": "Search for information across the web and return relevant results",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query or question",
                        "examples": ["latest news about AI", "how to make coffee", "Python tutorials"]
                    }
                },
                "required": ["query"]
            },
            "examples": [
                {"query": "AI news", "result": "Latest articles about artificial intelligence"},
                {"query": "Python tutorials", "result": "Programming resources and guides"}
            ]
        },
        "code_interpreter": {
            "name": "code_interpreter",
            "description": "Execute Python code in a secure sandbox environment with safety controls",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to execute",
                        "examples": [
                            "print('Hello, World!')",
                            "import math; print(math.sqrt(16))",
                            "x = [1,2,3,4]; print(sum(x))"
                        ]
                    },
                    "language": {
                        "type": "string",
                        "description": "Programming language",
                        "default": "python",
                        "enum": ["python"]
                    }
                },
                "required": ["code"]
            },
            "safety_features": [
                "Resource limits (CPU, memory)",
                "Execution timeout",
                "File system isolation",
                "Network access restriction"
            ]
        }
    }
    
    if tool_name not in tool_definitions:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")
    
    return tool_definitions[tool_name]