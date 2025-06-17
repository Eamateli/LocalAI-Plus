"""
Plugin system API for extensible tools
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import json
import os
import importlib.util
import sys
from pathlib import Path
import structlog

from core.security import security, verify_token
from core.config import settings
from services.function_calling import FunctionCallingService

logger = structlog.get_logger()
plugins_router = APIRouter()

class PluginInfo(BaseModel):
    name: str
    version: str
    description: str
    author: str
    functions: List[Dict[str, Any]]

class PluginRegistration(BaseModel):
    name: str = Field(..., description="Plugin name")
    description: str = Field(..., description="Plugin description")
    version: str = Field("1.0.0", description="Plugin version")
    author: str = Field("Unknown", description="Plugin author")
    functions: List[Dict[str, Any]] = Field(..., description="Plugin functions")

@plugins_router.get("/plugins")
async def list_plugins(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    List all installed plugins
    
    Returns information about all currently installed and active plugins.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        plugins_dir = Path(settings.PLUGINS_DIRECTORY)
        plugins = []
        
        if plugins_dir.exists():
            for plugin_path in plugins_dir.glob("*.py"):
                try:
                    plugin_info = await _load_plugin_info(plugin_path)
                    if plugin_info:
                        plugins.append(plugin_info)
                except Exception as e:
                    logger.warning("Failed to load plugin", plugin=plugin_path.name, error=str(e))
        
        return {
            "plugins": plugins,
            "count": len(plugins),
            "plugins_directory": str(plugins_dir)
        }
        
    except Exception as e:
        logger.error("Failed to list plugins", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to list plugins: {str(e)}")

@plugins_router.post("/plugins/register")
async def register_plugin(
    plugin: PluginRegistration,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Register a new plugin
    
    Register a plugin by providing its metadata and function definitions.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        # Create plugin definition
        plugin_def = {
            "name": plugin.name,
            "version": plugin.version,
            "description": plugin.description,
            "author": plugin.author,
            "functions": plugin.functions
        }
        
        # Save plugin definition
        plugins_dir = Path(settings.PLUGINS_DIRECTORY)
        plugins_dir.mkdir(exist_ok=True)
        
        plugin_file = plugins_dir / f"{plugin.name}.json"
        with open(plugin_file, "w") as f:
            json.dump(plugin_def, f, indent=2)
        
        # Register functions with function calling service
        function_service = FunctionCallingService()
        
        for func_def in plugin.functions:
            function_service.register_tool(
                name=func_def["name"],
                func=_create_plugin_function(plugin.name, func_def["name"]),
                description=func_def["description"],
                parameters=func_def["parameters"]
            )
        
        logger.info("Plugin registered successfully", plugin=plugin.name)
        
        return {
            "message": f"Plugin '{plugin.name}' registered successfully",
            "plugin": plugin_def
        }
        
    except Exception as e:
        logger.error("Plugin registration failed", plugin=plugin.name, error=str(e))
        raise HTTPException(status_code=500, detail=f"Plugin registration failed: {str(e)}")

@plugins_router.post("/plugins/upload")
async def upload_plugin(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Upload a plugin file
    
    Upload a Python plugin file that will be loaded and registered.
    """
    
    # Verify authentication  
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not file.filename.endswith('.py'):
        raise HTTPException(status_code=400, detail="Only Python files (.py) are supported")
    
    try:
        # Create plugins directory
        plugins_dir = Path(settings.PLUGINS_DIRECTORY)
        plugins_dir.mkdir(exist_ok=True)
        
        # Save uploaded file
        plugin_path = plugins_dir / file.filename
        content = await file.read()
        
        with open(plugin_path, "wb") as f:
            f.write(content)
        
        # Try to load and validate plugin
        plugin_info = await _load_plugin_info(plugin_path)
        
        if not plugin_info:
            # Clean up invalid plugin
            plugin_path.unlink()
            raise HTTPException(status_code=400, detail="Invalid plugin file")
        
        logger.info("Plugin uploaded successfully", plugin=file.filename)
        
        return {
            "message": f"Plugin '{file.filename}' uploaded successfully",
            "plugin": plugin_info
        }
        
    except Exception as e:
        logger.error("Plugin upload failed", filename=file.filename, error=str(e))
        raise HTTPException(status_code=500, detail=f"Plugin upload failed: {str(e)}")

@plugins_router.delete("/plugins/{plugin_name}")
async def uninstall_plugin(
    plugin_name: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Uninstall a plugin
    
    Remove a plugin and unregister its functions.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    try:
        plugins_dir = Path(settings.PLUGINS_DIRECTORY)
        
        # Remove Python file
        plugin_py = plugins_dir / f"{plugin_name}.py"
        if plugin_py.exists():
            plugin_py.unlink()
        
        # Remove JSON definition
        plugin_json = plugins_dir / f"{plugin_name}.json"
        if plugin_json.exists():
            plugin_json.unlink()
        
        logger.info("Plugin uninstalled", plugin=plugin_name)
        
        return {
            "message": f"Plugin '{plugin_name}' uninstalled successfully"
        }
        
    except Exception as e:
        logger.error("Plugin uninstall failed", plugin=plugin_name, error=str(e))
        raise HTTPException(status_code=500, detail=f"Plugin uninstall failed: {str(e)}")

async def _load_plugin_info(plugin_path: Path) -> Optional[Dict[str, Any]]:
    """Load plugin information from file"""
    try:
        if plugin_path.suffix == ".json":
            # JSON plugin definition
            with open(plugin_path, "r") as f:
                return json.load(f)
        
        elif plugin_path.suffix == ".py":
            # Python plugin file
            spec = importlib.util.spec_from_file_location(
                plugin_path.stem, plugin_path
            )
            
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Look for plugin metadata
                if hasattr(module, "PLUGIN_INFO"):
                    return module.PLUGIN_INFO
                else:
                    # Generate basic info
                    return {
                        "name": plugin_path.stem,
                        "version": "1.0.0",
                        "description": getattr(module, "__doc__", "No description"),
                        "author": "Unknown",
                        "functions": []
                    }
        
        return None
        
    except Exception as e:
        logger.error("Failed to load plugin info", plugin=plugin_path.name, error=str(e))
        return None

def _create_plugin_function(plugin_name: str, function_name: str):
    """Create a plugin function wrapper"""
    
    async def plugin_function(arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin function"""
        try:
            # Load plugin module
            plugins_dir = Path(settings.PLUGINS_DIRECTORY)
            plugin_path = plugins_dir / f"{plugin_name}.py"
            
            if not plugin_path.exists():
                return {"error": f"Plugin {plugin_name} not found", "success": False}
            
            spec = importlib.util.spec_from_file_location(plugin_name, plugin_path)
            if spec and spec.loader:
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Get function
                if hasattr(module, function_name):
                    func = getattr(module, function_name)
                    
                    # Execute function
                    if asyncio.iscoroutinefunction(func):
                        result = await func(arguments)
                    else:
                        result = func(arguments)
                    
                    return {"result": result, "success": True}
                else:
                    return {"error": f"Function {function_name} not found in plugin", "success": False}
            
            return {"error": "Failed to load plugin module", "success": False}
            
        except Exception as e:
            logger.error("Plugin function execution failed", 
                        plugin=plugin_name, function=function_name, error=str(e))
            return {"error": str(e), "success": False}
    
    return plugin_function