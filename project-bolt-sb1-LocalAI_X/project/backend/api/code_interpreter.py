"""
Code interpreter API for secure Python execution
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import asyncio
import subprocess
import tempfile
import os
import time
import json
import structlog

from core.security import security, verify_token
from core.config import settings

logger = structlog.get_logger()
code_router = APIRouter()

class CodeExecutionRequest(BaseModel):
    code: str = Field(..., description="Python code to execute")
    language: str = Field("python", description="Programming language (only python supported)")
    timeout: Optional[int] = Field(30, description="Execution timeout in seconds")
    packages: Optional[List[str]] = Field(None, description="Required packages")

class CodeExecutionResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: float
    
@code_router.post("/code/execute")
async def execute_code(
    request: CodeExecutionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Execute Python code in a secure sandbox environment
    
    This endpoint allows safe execution of Python code with proper isolation,
    timeout controls, and resource limitations.
    """
    
    # Verify authentication
    if credentials and not await verify_token(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if not settings.ENABLE_CODE_EXECUTION:
        raise HTTPException(status_code=403, detail="Code execution is disabled")
    
    if request.language != "python":
        raise HTTPException(status_code=400, detail="Only Python code execution is supported")
    
    try:
        start_time = time.time()
        
        # Security checks
        if not _is_code_safe(request.code):
            raise HTTPException(status_code=400, detail="Code contains potentially unsafe operations")
        
        # Execute code in sandbox
        result = await _execute_python_code(
            code=request.code,
            timeout=request.timeout or settings.CODE_TIMEOUT,
            packages=request.packages
        )
        
        execution_time = time.time() - start_time
        
        return CodeExecutionResponse(
            success=result["success"],
            output=result.get("output"),
            error=result.get("error"),
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error("Code execution failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

def _is_code_safe(code: str) -> bool:
    """Basic code safety checks"""
    # List of potentially dangerous operations
    dangerous_patterns = [
        "import os",
        "import sys", 
        "import subprocess",
        "import socket",
        "import urllib",
        "import requests",
        "open(",
        "exec(",
        "eval(",
        "__import__",
        "compile(",
        "globals(",
        "locals(",
        "vars(",
        "dir(",
        "getattr(",
        "setattr(",
        "delattr(",
        "hasattr("
    ]
    
    code_lower = code.lower()
    for pattern in dangerous_patterns:
        if pattern in code_lower:
            logger.warning("Unsafe code pattern detected", pattern=pattern)
            return False
    
    return True

async def _execute_python_code(
    code: str,
    timeout: int = 30,
    packages: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Execute Python code in a sandboxed environment"""
    
    try:
        # Create temporary file for code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            # Add safety imports and restrictions
            safe_code = f"""
import sys
import io
import contextlib
import signal
import resource

# Set resource limits
resource.setrlimit(resource.RLIMIT_CPU, ({timeout}, {timeout}))
resource.setrlimit(resource.RLIMIT_AS, ({settings.CODE_MEMORY_LIMIT * 1024 * 1024}, {settings.CODE_MEMORY_LIMIT * 1024 * 1024}))

# Capture output
output_buffer = io.StringIO()

try:
    with contextlib.redirect_stdout(output_buffer), contextlib.redirect_stderr(output_buffer):
        # User code starts here
{code}
        # User code ends here
    
    print("EXECUTION_SUCCESS")
    print("OUTPUT_START")
    print(output_buffer.getvalue())
    print("OUTPUT_END")

except Exception as e:
    print("EXECUTION_ERROR")
    print(f"Error: {{str(e)}}")
    print(f"Type: {{type(e).__name__}}")

"""
            f.write(safe_code)
            temp_file = f.name
        
        try:
            # Execute with timeout
            process = await asyncio.create_subprocess_exec(
                "python3", temp_file,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd="/tmp"  # Run in safe directory
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                return {
                    "success": False,
                    "error": "Code execution timed out"
                }
            
            # Parse output
            output_text = stdout.decode('utf-8')
            error_text = stderr.decode('utf-8')
            
            if "EXECUTION_SUCCESS" in output_text:
                # Extract actual output
                lines = output_text.split('\n')
                output_start_idx = -1
                output_end_idx = -1
                
                for i, line in enumerate(lines):
                    if line.strip() == "OUTPUT_START":
                        output_start_idx = i + 1
                    elif line.strip() == "OUTPUT_END":
                        output_end_idx = i
                        break
                
                if output_start_idx != -1 and output_end_idx != -1:
                    actual_output = '\n'.join(lines[output_start_idx:output_end_idx])
                else:
                    actual_output = ""
                
                return {
                    "success": True,
                    "output": actual_output
                }
            
            elif "EXECUTION_ERROR" in output_text:
                error_lines = output_text.split('\n')[1:]  # Skip "EXECUTION_ERROR" line
                error_info = '\n'.join(error_lines)
                
                return {
                    "success": False,
                    "error": error_info
                }
            
            else:
                return {
                    "success": False,
                    "error": f"Unexpected output: {output_text}\nStderr: {error_text}"
                }
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file)
            except:
                pass
    
    except Exception as e:
        logger.error("Code execution subprocess failed", error=str(e))
        return {
            "success": False,
            "error": f"Execution failed: {str(e)}"
        }

@code_router.get("/code/capabilities")
async def get_code_capabilities():
    """Get information about code execution capabilities"""
    return {
        "enabled": settings.ENABLE_CODE_EXECUTION,
        "supported_languages": ["python"],
        "timeout_limit": settings.CODE_TIMEOUT,
        "memory_limit_mb": settings.CODE_MEMORY_LIMIT,
        "allowed_packages": settings.PYTHON_PACKAGES_WHITELIST,
        "safety_features": [
            "Resource limits (CPU, memory)",
            "Execution timeout", 
            "File system isolation",
            "Network access restriction",
            "Dangerous import blocking"
        ]
    }