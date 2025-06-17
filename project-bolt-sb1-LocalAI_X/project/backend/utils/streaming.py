"""
Streaming response utilities
"""

import json
import asyncio
from typing import AsyncGenerator, Dict, Any

class StreamingResponseGenerator:
    """Generator for streaming chat responses"""
    
    def __init__(self, completion_id: str, model: str):
        self.completion_id = completion_id
        self.model = model
        self.created = 1677610602  # Timestamp
    
    async def generate_stream(self, content_generator: AsyncGenerator[str, None]) -> AsyncGenerator[str, None]:
        """Generate OpenAI-compatible streaming response"""
        
        try:
            async for chunk in content_generator:
                stream_chunk = {
                    "id": self.completion_id,
                    "object": "chat.completion.chunk",
                    "created": self.created,
                    "model": self.model,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": chunk},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(stream_chunk)}\n\n"
            
            # Final chunk
            final_chunk = {
                "id": self.completion_id,
                "object": "chat.completion.chunk", 
                "created": self.created,
                "model": self.model,
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop"
                }]
            }
            yield f"data: {json.dumps(final_chunk)}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_chunk = {
                "error": {
                    "message": str(e),
                    "type": "server_error"
                }
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"