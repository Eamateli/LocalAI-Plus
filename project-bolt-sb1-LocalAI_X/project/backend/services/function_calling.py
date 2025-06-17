"""
Function calling service for tool execution
"""

import json
import re
import asyncio
from typing import Dict, List, Any, Optional
import importlib.util
import sys
from pathlib import Path
import structlog

from core.config import settings

logger = structlog.get_logger()

class FunctionCallingService:
    """Service for handling function calls and tool execution"""
    
    def __init__(self):
        self.tools = {}
        self.max_execution_time = settings.MAX_TOOL_EXECUTION_TIME
    
    def generate_tool_prompt(self, available_tools: Dict[str, Any]) -> str:
        """Generate system prompt for tool usage"""
        if not available_tools:
            return ""
        
        tool_descriptions = []
        for name, tool_info in available_tools.items():
            tool_descriptions.append(f"""
Tool: {name}
Description: {tool_info['description']}
Parameters: {json.dumps(tool_info['parameters'], indent=2)}
""")
        
        return f"""You have access to the following tools. When you need to use a tool, format your response as:

TOOL_CALL: {{
    "name": "tool_name",
    "arguments": {{"param1": "value1", "param2": "value2"}}
}}

Available tools:
{chr(10).join(tool_descriptions)}

Only use tools when necessary to answer the user's question. Always explain what you're doing before using a tool."""
    
    def extract_function_calls(self, text: str) -> List[Dict[str, Any]]:
        """Extract function calls from model response"""
        function_calls = []
        
        # Look for TOOL_CALL: patterns
        pattern = r'TOOL_CALL:\s*(\{[^}]+\})'
        matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            try:
                call_data = json.loads(match)
                if "name" in call_data and "arguments" in call_data:
                    function_calls.append(call_data)
            except json.JSONDecodeError:
                logger.warning("Failed to parse function call", match=match)
        
        return function_calls
    
    async def execute_function(
        self,
        function_name: str,
        arguments: Dict[str, Any],
        tool_definition: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a function call"""
        try:
            # Built-in tools
            if function_name == "calculator":
                return await self._execute_calculator(arguments)
            elif function_name == "weather":
                return await self._execute_weather(arguments)
            elif function_name == "search":
                return await self._execute_search(arguments)
            elif function_name == "code_interpreter":
                return await self._execute_code_interpreter(arguments)
            
            # Plugin tools (if any)
            elif function_name in self.tools:
                return await self._execute_plugin_tool(function_name, arguments)
            
            else:
                return {
                    "error": f"Unknown function: {function_name}",
                    "success": False
                }
                
        except Exception as e:
            logger.error("Function execution failed", function=function_name, error=str(e))
            return {
                "error": str(e),
                "success": False
            }
    
    async def _execute_calculator(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute calculator function"""
        try:
            expression = arguments.get("expression", "")
            if not expression:
                return {"error": "No expression provided", "success": False}
            
            # Basic security: only allow safe mathematical expressions
            allowed_chars = set('0123456789+-*/().% ')
            if not all(c in allowed_chars for c in expression):
                return {"error": "Invalid characters in expression", "success": False}
            
            result = eval(expression)
            return {
                "result": result,
                "expression": expression,
                "success": True
            }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    async def _execute_weather(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute weather function (mock implementation)"""
        location = arguments.get("location", "Unknown")
        
        # Mock weather data (in production, integrate with weather API)
        mock_weather = {
            "location": location,
            "temperature": "22°C",
            "condition": "Partly cloudy",
            "humidity": "65%",
            "wind": "10 km/h",
            "success": True
        }
        
        return mock_weather
    
    async def _execute_search(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute search function (mock implementation)"""
        query = arguments.get("query", "")
        
        # Mock search results (in production, integrate with search API)
        mock_results = {
            "query": query,
            "results": [
                {
                    "title": f"Search result for: {query}",
                    "url": "https://example.com/search",
                    "snippet": f"This is a mock search result for the query '{query}'. In a real implementation, this would connect to a search API."
                }
            ],
            "success": True
        }
        
        return mock_results
    
    async def _execute_code_interpreter(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute code interpreter function"""
        # This would integrate with the code interpreter service
        code = arguments.get("code", "")
        language = arguments.get("language", "python")
        
        if language != "python":
            return {"error": "Only Python code execution is supported", "success": False}
        
        # Mock code execution (integrate with actual code interpreter)
        return {
            "code": code,
            "output": f"# Mock execution of:\n{code}\n# Result: Code executed successfully",
            "success": True
        }
    
    async def _execute_plugin_tool(self, function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin tool"""
        if function_name in self.tools:
            tool_func = self.tools[function_name]
            return await tool_func(arguments)
        
        return {"error": f"Plugin tool {function_name} not found", "success": False}
    
    def register_tool(self, name: str, func: callable, description: str, parameters: Dict[str, Any]):
        """Register a new tool"""
        self.tools[name] = {
            "function": func,
            "description": description,
            "parameters": parameters
        }