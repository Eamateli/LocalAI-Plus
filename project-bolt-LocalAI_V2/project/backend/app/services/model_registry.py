"""
Model Registry for managing different LLM providers
"""
import asyncio
import logging
from typing import Dict, List, Optional, Any, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
import time
import httpx
import json

logger = logging.getLogger(__name__)

class ModelProvider(str, Enum):
    """Supported model providers"""
    OLLAMA = "ollama"
    VLLM = "vllm"
    HUGGINGFACE = "huggingface"
    OPENAI = "openai"

@dataclass
class ModelConfig:
    """Model configuration"""
    name: str
    provider: ModelProvider
    model_path: str
    context_length: int = 4096
    max_tokens: int = 2048
    temperature: float = 0.7
    supports_streaming: bool = True
    supports_functions: bool = False
    embedding_model: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ModelInstance:
    """Model instance with runtime information"""
    config: ModelConfig
    client: Any
    last_used: float
    memory_usage: int = 0
    request_count: int = 0

class ModelRegistry:
    """Registry for managing LLM models"""
    
    def __init__(self):
        self.models: Dict[str, ModelInstance] = {}
        self.available_models: Dict[str, ModelConfig] = {}
        self.ollama_client: Optional[httpx.AsyncClient] = None
        self.vllm_client: Optional[httpx.AsyncClient] = None
        
    async def initialize(self):
        """Initialize the model registry"""
        logger.info("Initializing Model Registry...")
        
        # Initialize clients
        self.ollama_client = httpx.AsyncClient(
            base_url="http://localhost:11434",
            timeout=300.0
        )
        
        self.vllm_client = httpx.AsyncClient(
            base_url="http://localhost:8001",
            timeout=300.0
        )
        
        # Discover available models
        await self._discover_models()
        
        logger.info(f"Model Registry initialized with {len(self.available_models)} available models")
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.ollama_client:
            await self.ollama_client.aclose()
        if self.vllm_client:
            await self.vllm_client.aclose()
        
        # Cleanup loaded models
        for model_name in list(self.models.keys()):
            await self._unload_model(model_name)
    
    async def _discover_models(self):
        """Discover available models from different providers"""
        # Discover Ollama models
        try:
            response = await self.ollama_client.get("/api/tags")
            if response.status_code == 200:
                data = response.json()
                for model in data.get("models", []):
                    name = model["name"]
                    self.available_models[name] = ModelConfig(
                        name=name,
                        provider=ModelProvider.OLLAMA,
                        model_path=name,
                        context_length=model.get("details", {}).get("parameter_size", 4096),
                        supports_streaming=True,
                        supports_functions=True,
                        metadata={
                            "size": model.get("size", 0),
                            "modified_at": model.get("modified_at"),
                            "digest": model.get("digest")
                        }
                    )
                logger.info(f"Discovered {len(data.get('models', []))} Ollama models")
        except Exception as e:
            logger.warning(f"Failed to discover Ollama models: {e}")
        
        # Discover vLLM models (if available)
        try:
            response = await self.vllm_client.get("/v1/models")
            if response.status_code == 200:
                data = response.json()
                for model in data.get("data", []):
                    name = model["id"]
                    self.available_models[f"vllm:{name}"] = ModelConfig(
                        name=f"vllm:{name}",
                        provider=ModelProvider.VLLM,
                        model_path=name,
                        supports_streaming=True,
                        supports_functions=False,
                        metadata=model
                    )
                logger.info(f"Discovered {len(data.get('data', []))} vLLM models")
        except Exception as e:
            logger.warning(f"Failed to discover vLLM models: {e}")
        
        # Add default embedding models
        self.available_models["text-embedding-ada-002"] = ModelConfig(
            name="text-embedding-ada-002",
            provider=ModelProvider.HUGGINGFACE,
            model_path="sentence-transformers/all-MiniLM-L6-v2",
            embedding_model=True,
            context_length=512,
            supports_streaming=False,
            supports_functions=False
        )
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models"""
        models = []
        for config in self.available_models.values():
            models.append({
                "id": config.name,
                "object": "model",
                "created": int(time.time()),
                "owned_by": config.provider.value,
                "provider": config.provider.value,
                "context_length": config.context_length,
                "max_tokens": config.max_tokens,
                "supports_streaming": config.supports_streaming,
                "supports_functions": config.supports_functions,
                "embedding_model": config.embedding_model,
                "metadata": config.metadata
            })
        return models
    
    async def load_model(self, model_name: str) -> ModelInstance:
        """Load a model into memory"""
        if model_name in self.models:
            # Update last used time
            self.models[model_name].last_used = time.time()
            return self.models[model_name]
        
        if model_name not in self.available_models:
            raise ValueError(f"Model {model_name} not available")
        
        config = self.available_models[model_name]
        
        # Check memory limits
        if len(self.models) >= 3:  # Max 3 models in memory
            await self._evict_least_used_model()
        
        logger.info(f"Loading model: {model_name}")
        
        # Create appropriate client based on provider
        if config.provider == ModelProvider.OLLAMA:
            client = self.ollama_client
        elif config.provider == ModelProvider.VLLM:
            client = self.vllm_client
        else:
            # For HuggingFace and others, we'll use a simple wrapper
            client = None
        
        instance = ModelInstance(
            config=config,
            client=client,
            last_used=time.time()
        )
        
        self.models[model_name] = instance
        logger.info(f"Model {model_name} loaded successfully")
        
        return instance
    
    async def _unload_model(self, model_name: str):
        """Unload a model from memory"""
        if model_name in self.models:
            logger.info(f"Unloading model: {model_name}")
            del self.models[model_name]
    
    async def _evict_least_used_model(self):
        """Evict the least recently used model"""
        if not self.models:
            return
        
        # Find least recently used model
        lru_model = min(self.models.items(), key=lambda x: x[1].last_used)
        await self._unload_model(lru_model[0])
    
    async def generate_completion(
        self, 
        model_name: str, 
        messages: List[Dict[str, str]], 
        stream: bool = False,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate completion using specified model"""
        instance = await self.load_model(model_name)
        instance.request_count += 1
        
        if instance.config.provider == ModelProvider.OLLAMA:
            async for chunk in self._ollama_completion(instance, messages, stream, **kwargs):
                yield chunk
        elif instance.config.provider == ModelProvider.VLLM:
            async for chunk in self._vllm_completion(instance, messages, stream, **kwargs):
                yield chunk
        else:
            raise ValueError(f"Provider {instance.config.provider} not supported for completion")
    
    async def _ollama_completion(
        self, 
        instance: ModelInstance, 
        messages: List[Dict[str, str]], 
        stream: bool = False,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate completion using Ollama"""
        payload = {
            "model": instance.config.model_path,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": kwargs.get("temperature", instance.config.temperature),
                "num_predict": kwargs.get("max_tokens", instance.config.max_tokens),
            }
        }
        
        try:
            async with instance.client.stream("POST", "/api/chat", json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise ValueError(f"Ollama API error: {error_text}")
                
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if stream:
                                yield {
                                    "id": f"chatcmpl-{int(time.time())}",
                                    "object": "chat.completion.chunk",
                                    "created": int(time.time()),
                                    "model": instance.config.name,
                                    "choices": [{
                                        "index": 0,
                                        "delta": {
                                            "content": data.get("message", {}).get("content", "")
                                        },
                                        "finish_reason": "stop" if data.get("done") else None
                                    }]
                                }
                            else:
                                if data.get("done"):
                                    yield {
                                        "id": f"chatcmpl-{int(time.time())}",
                                        "object": "chat.completion",
                                        "created": int(time.time()),
                                        "model": instance.config.name,
                                        "choices": [{
                                            "index": 0,
                                            "message": data.get("message", {}),
                                            "finish_reason": "stop"
                                        }],
                                        "usage": {
                                            "prompt_tokens": data.get("prompt_eval_count", 0),
                                            "completion_tokens": data.get("eval_count", 0),
                                            "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                                        }
                                    }
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            logger.error(f"Error in Ollama completion: {e}")
            raise
    
    async def _vllm_completion(
        self, 
        instance: ModelInstance, 
        messages: List[Dict[str, str]], 
        stream: bool = False,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Generate completion using vLLM"""
        payload = {
            "model": instance.config.model_path,
            "messages": messages,
            "stream": stream,
            "temperature": kwargs.get("temperature", instance.config.temperature),
            "max_tokens": kwargs.get("max_tokens", instance.config.max_tokens),
        }
        
        try:
            if stream:
                async with instance.client.stream("POST", "/v1/chat/completions", json=payload) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # Remove "data: " prefix
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                yield data
                            except json.JSONDecodeError:
                                continue
            else:
                response = await instance.client.post("/v1/chat/completions", json=payload)
                if response.status_code == 200:
                    yield response.json()
                else:
                    raise ValueError(f"vLLM API error: {response.text}")
                    
        except Exception as e:
            logger.error(f"Error in vLLM completion: {e}")
            raise
    
    async def generate_embeddings(self, model_name: str, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts"""
        instance = await self.load_model(model_name)
        
        if not instance.config.embedding_model:
            raise ValueError(f"Model {model_name} is not an embedding model")
        
        # For now, use a simple sentence transformer
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(instance.config.model_path)
            embeddings = model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except ImportError:
            raise ValueError("sentence-transformers not available for embeddings")