import asyncio
import docker
import uuid
import tempfile
import os
import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CodeExecuteRequest(BaseModel):
    code: str = Field(..., description="Python code to execute")
    language: str = Field("python", description="Programming language")
    timeout: Optional[int] = Field(30, ge=1, le=300, description="Execution timeout in seconds")
    environment: Optional[Dict[str, str]] = Field(None, description="Environment variables")

class CodeExecuteResponse(BaseModel):
    id: str
    success: bool
    output: str
    error: Optional[str] = None
    execution_time: float
    exit_code: int

class CodeExecutor:
    """Secure code execution using Docker containers"""
    
    def __init__(self):
        try:
            self.docker_client = docker.from_env()
            # Test Docker connection
            self.docker_client.ping()
            logger.info("Docker client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.docker_client = None
    
    async def execute_python(self, code: str, timeout: int = 30, env: Dict[str, str] = None) -> Dict[str, Any]:
        """Execute Python code in a secure container"""
        
        if not self.docker_client:
            raise RuntimeError("Docker client not available")
        
        execution_id = str(uuid.uuid4())
        
        # Create temporary file for code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            code_file = f.name
        
        try:
            # Prepare environment variables
            environment = env or {}
            environment.update({
                'PYTHONUNBUFFERED': '1',
                'PYTHONPATH': '/tmp'
            })
            
            # Run code in container
            container = self.docker_client.containers.run(
                image='python:3.11-slim',
                command=['python', '/tmp/code.py'],
                volumes={
                    code_file: {'bind': '/tmp/code.py', 'mode': 'ro'}
                },
                environment=environment,
                detach=True,
                remove=True,
                mem_limit='128m',
                cpu_quota=50000,  # 50% CPU
                network_disabled=True,  # No network access
                read_only=True,
                tmpfs={'/tmp': 'noexec,nosuid,size=10m'},
                user='nobody'
            )
            
            # Wait for completion with timeout
            try:
                result = container.wait(timeout=timeout)
                exit_code = result['StatusCode']
                
                # Get output
                logs = container.logs(stdout=True, stderr=True).decode('utf-8')
                
                return {
                    'success': exit_code == 0,
                    'output': logs,
                    'error': logs if exit_code != 0 else None,
                    'exit_code': exit_code
                }
                
            except docker.errors.APIError as e:
                if 'timeout' in str(e).lower():
                    container.kill()
                    return {
                        'success': False,
                        'output': '',
                        'error': f'Execution timed out after {timeout} seconds',
                        'exit_code': -1
                    }
                else:
                    raise
        
        finally:
            # Cleanup
            if os.path.exists(code_file):
                os.unlink(code_file)

# Global code executor instance
code_executor = CodeExecutor()

@router.post("/code/execute", response_model=CodeExecuteResponse)
async def execute_code(request: CodeExecuteRequest, fastapi_request: Request):
    """Execute code in a secure sandbox"""
    
    from app.core.config import settings
    
    if not settings.ENABLE_CODE_EXECUTION:
        raise HTTPException(
            status_code=403,
            detail="Code execution is disabled"
        )
    
    if request.language.lower() != "python":
        raise HTTPException(
            status_code=400,
            detail="Only Python code execution is currently supported"
        )
    
    execution_id = str(uuid.uuid4())
    
    try:
        import time
        start_time = time.time()
        
        # Execute code
        result = await code_executor.execute_python(
            code=request.code,
            timeout=min(request.timeout, settings.CODE_EXECUTION_TIMEOUT),
            env=request.environment
        )
        
        execution_time = time.time() - start_time
        
        # Store result in Redis cache
        redis_service = fastapi_request.app.state.redis_service
        if redis_service:
            await redis_service.set(
                f"code_execution:{execution_id}",
                {
                    "code": request.code,
                    "result": result,
                    "timestamp": start_time
                },
                ttl=3600  # 1 hour
            )
        
        return CodeExecuteResponse(
            id=execution_id,
            success=result['success'],
            output=result['output'],
            error=result['error'],
            execution_time=execution_time,
            exit_code=result['exit_code']
        )
        
    except Exception as e:
        logger.error(f"Error executing code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/code/execution/{execution_id}")
async def get_execution_result(execution_id: str, request: Request):
    """Get cached execution result"""
    
    redis_service = request.app.state.redis_service
    if not redis_service:
        raise HTTPException(status_code=404, detail="Execution result not found")
    
    result = await redis_service.get(f"code_execution:{execution_id}")
    if not result:
        raise HTTPException(status_code=404, detail="Execution result not found")
    
    return result

@router.get("/code/languages")
async def list_supported_languages():
    """List supported programming languages"""
    
    return {
        "languages": [
            {
                "name": "python",
                "version": "3.11",
                "description": "Python programming language",
                "supported": True
            }
        ]
    }

@router.get("/code/limits")
async def get_execution_limits():
    """Get code execution limits and restrictions"""
    
    from app.core.config import settings
    
    return {
        "enabled": settings.ENABLE_CODE_EXECUTION,
        "max_timeout": settings.CODE_EXECUTION_TIMEOUT,
        "memory_limit": "128MB",
        "cpu_limit": "50%",
        "network_access": False,
        "file_system_access": "read-only",
        "supported_languages": ["python"]
    }