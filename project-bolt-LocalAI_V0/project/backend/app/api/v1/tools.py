import json
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ToolExecuteRequest(BaseModel):
    name: str = Field(..., description="Function name to execute")
    arguments: Dict[str, Any] = Field(..., description="Function arguments")
    context: Optional[Dict[str, Any]] = Field(None, description="Execution context")

class ToolExecuteResponse(BaseModel):
    id: str
    result: Any
    success: bool
    error: Optional[str] = None
    execution_time: float

# Built-in tool functions
BUILTIN_TOOLS = {
    "get_current_time": {
        "description": "Get the current time",
        "parameters": {
            "type": "object",
            "properties": {
                "timezone": {
                    "type": "string", 
                    "description": "Timezone (e.g., 'UTC', 'America/New_York')"
                }
            }
        }
    },
    "calculate": {
        "description": "Perform mathematical calculations",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Mathematical expression to evaluate"
                }
            },
            "required": ["expression"]
        }
    },
    "web_search": {
        "description": "Search the web for information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                },
                "num_results": {
                    "type": "integer",
                    "description": "Number of results to return",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    }
}

async def execute_builtin_tool(name: str, arguments: Dict[str, Any]) -> Any:
    """Execute built-in tool function"""
    
    if name == "get_current_time":
        from datetime import datetime
        import pytz
        
        timezone = arguments.get("timezone", "UTC")
        try:
            tz = pytz.timezone(timezone)
            current_time = datetime.now(tz)
            return {
                "time": current_time.isoformat(),
                "timezone": timezone,
                "unix_timestamp": current_time.timestamp()
            }
        except Exception as e:
            raise ValueError(f"Invalid timezone: {timezone}")
    
    elif name == "calculate":
        expression = arguments.get("expression", "")
        try:
            # Safe evaluation of mathematical expressions
            import ast
            import operator
            
            # Allowed operators
            ops = {
                ast.Add: operator.add,
                ast.Sub: operator.sub,
                ast.Mult: operator.mul,
                ast.Div: operator.truediv,
                ast.Pow: operator.pow,
                ast.USub: operator.neg,
            }
            
            def eval_expr(node):
                if isinstance(node, ast.Num):
                    return node.n
                elif isinstance(node, ast.BinOp):
                    return ops[type(node.op)](eval_expr(node.left), eval_expr(node.right))
                elif isinstance(node, ast.UnaryOp):
                    return ops[type(node.op)](eval_expr(node.operand))
                else:
                    raise TypeError(node)
            
            result = eval_expr(ast.parse(expression, mode='eval').body)
            return {"result": result, "expression": expression}
            
        except Exception as e:
            raise ValueError(f"Invalid mathematical expression: {expression}")
    
    elif name == "web_search":
        # Mock web search - in production, integrate with real search API
        query = arguments.get("query", "")
        num_results = arguments.get("num_results", 5)
        
        return {
            "query": query,
            "results": [
                {
                    "title": f"Search result {i+1} for '{query}'",
                    "url": f"https://example.com/result-{i+1}",
                    "snippet": f"This is a mock search result snippet for query '{query}'"
                }
                for i in range(min(num_results, 5))
            ],
            "total_results": num_results
        }
    
    else:
        raise ValueError(f"Unknown tool function: {name}")

@router.post("/tools/execute", response_model=ToolExecuteResponse)
async def execute_tool(request: ToolExecuteRequest, fastapi_request: Request):
    """Execute a tool function"""
    
    import time
    start_time = time.time()
    execution_id = str(uuid.uuid4())
    
    try:
        # Check if it's a built-in tool
        if request.name in BUILTIN_TOOLS:
            result = await execute_builtin_tool(request.name, request.arguments)
        else:
            # Handle custom tools (could be loaded from database or plugins)
            raise HTTPException(
                status_code=404,
                detail=f"Tool function '{request.name}' not found"
            )
        
        execution_time = time.time() - start_time
        
        # Cache result in Redis if available
        redis_service = fastapi_request.app.state.redis_service
        if redis_service:
            await redis_service.store_function_result(execution_id, result)
        
        return ToolExecuteResponse(
            id=execution_id,
            result=result,
            success=True,
            execution_time=execution_time
        )
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Error executing tool {request.name}: {e}")
        
        return ToolExecuteResponse(
            id=execution_id,
            result=None,
            success=False,
            error=str(e),
            execution_time=execution_time
        )

@router.get("/tools")
async def list_tools():
    """List available tool functions"""
    
    tools = []
    for name, config in BUILTIN_TOOLS.items():
        tools.append({
            "name": name,
            "type": "function",
            "description": config["description"],
            "parameters": config["parameters"]
        })
    
    return {"tools": tools}

@router.get("/tools/{tool_name}")
async def get_tool_info(tool_name: str):
    """Get information about a specific tool"""
    
    if tool_name not in BUILTIN_TOOLS:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    config = BUILTIN_TOOLS[tool_name]
    return {
        "name": tool_name,
        "type": "function",
        "description": config["description"],
        "parameters": config["parameters"]
    }