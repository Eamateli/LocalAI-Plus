"""
Ollama client service for LLM interactions
"""

import httpx
import json
import asyncio
from typing import List, Dict, Any, AsyncGenerator, Optional
import structlog

from core.config import settings

logger = structlog.get_logger()

class OllamaService:
    """Service for interacting with Ollama API"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.default_model = settings.DEFAULT_MODEL
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def health_check(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception as e:
            logger.error("Ollama health check failed", error=str(e))
            return False
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models in Ollama"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])
        except Exception as e:
            logger.error("Failed to list models", error=str(e))
            return []
    
    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """Generate chat completion"""
        try:
            # Convert messages to Ollama format
            prompt = self._format_messages_for_ollama(messages)
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens or settings.MAX_TOKENS
                }
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get("response", "")
            
        except Exception as e:
            logger.error("Chat completion failed", error=str(e))
            raise
    
    async def stream_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion"""
        try:
            # Convert messages to Ollama format
            prompt = self._format_messages_for_ollama(messages)
            
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens or settings.MAX_TOKENS
                }
            }
            
            async with self.client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield data["response"]
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            logger.error("Streaming chat failed", error=str(e))
            raise
    
    async def generate_embedding(self, text: str, model: str = "nomic-embed-text") -> List[float]:
        """Generate embedding for text"""
        try:
            payload = {
                "model": model,
                "prompt": text
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/embeddings",
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            return data.get("embedding", [])
            
        except Exception as e:
            logger.error("Embedding generation failed", error=str(e))
            raise
    
    def _format_messages_for_ollama(self, messages: List[Dict[str, str]]) -> str:
        """Format chat messages for Ollama"""
        formatted_parts = []
        
        for message in messages:
            role = message["role"]
            content = message["content"]
            
            if role == "system":
                formatted_parts.append(f"System: {content}")
            elif role == "user":
                formatted_parts.append(f"User: {content}")
            elif role == "assistant":
                formatted_parts.append(f"Assistant: {content}")
            elif role == "function":
                formatted_parts.append(f"Function Result: {content}")
        
        formatted_parts.append("Assistant:")
        return "\n\n".join(formatted_parts)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()