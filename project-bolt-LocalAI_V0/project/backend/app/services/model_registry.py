import asyncio
import logging
from typing import Dict, List, Optional, Any
from enum import Enum
import ollama
import httpx
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)

class ModelFormat(str, Enum):
    GGUF = "gguf"
    VLLM = "vllm"
    HUGGINGFACE = "huggingface"
    EMBEDDING = "embedding"

class ModelInfo:
    def __init__(self, name: str, format: ModelFormat, config: Dict[str, Any]):
        self.name = name
        self.format = format
        self.config = config
        self.loaded = False
        self.last_used = None
        self.client = None

class ModelRegistry:
    """Central registry for managing different model types"""
    
    def __init__(self):
        self.models: Dict[str, ModelInfo] = {}
        self.ollama_client = None
        self.embedding_models: Dict[str, SentenceTransformer] = {}
        self._lock = asyncio.Lock()
    
    async def initialize(self):
        """Initialize the model registry"""
        logger.info("Initializing model registry...")
        
        # Initialize Ollama client
        try:
            self.ollama_client = ollama.AsyncClient(host=settings.OLLAMA_BASE_URL)
            await self._discover_ollama_models()
        except Exception as e:
            logger.warning(f"Could not connect to Ollama: {e}")
        
        # Load default embedding model
        await self._load_embedding_model(settings.DEFAULT_EMBEDDING_MODEL)
        
        logger.info(f"Model registry initialized with {len(self.models)} models")
    
    async def _discover_ollama_models(self):
        """Discover available Ollama models"""
        try:
            models = await self.ollama_client.list()
            for model in models.get('models', []):
                name = model['name']
                self.models[name] = ModelInfo(
                    name=name,
                    format=ModelFormat.GGUF,
                    config={
                        'size': model.get('size', 0),
                        'digest': model.get('digest', ''),
                        'modified_at': model.get('modified_at', ''),
                        'details': model.get('details', {})
                    }
                )
            logger.info(f"Discovered {len(models.get('models', []))} Ollama models")
        except Exception as e:
            logger.error(f"Error discovering Ollama models: {e}")
    
    async def _load_embedding_model(self, model_name: str):
        """Load embedding model"""
        try:
            if model_name not in self.embedding_models:
                logger.info(f"Loading embedding model: {model_name}")
                model = SentenceTransformer(model_name)
                self.embedding_models[model_name] = model
                
                # Register in models dict
                self.models[f"embedding-{model_name}"] = ModelInfo(
                    name=f"embedding-{model_name}",
                    format=ModelFormat.EMBEDDING,
                    config={'base_model': model_name}
                )
                
            logger.info(f"Embedding model {model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading embedding model {model_name}: {e}")
    
    async def get_model(self, model_name: str) -> Optional[ModelInfo]:
        """Get model by name"""
        async with self._lock:
            if model_name in self.models:
                return self.models[model_name]
            
            # Try to load model if not found
            await self._try_load_model(model_name)
            return self.models.get(model_name)
    
    async def _try_load_model(self, model_name: str):
        """Try to load a model dynamically"""
        logger.info(f"Attempting to load model: {model_name}")
        
        # Try Ollama first
        if self.ollama_client:
            try:
                # Pull model if not available
                await self.ollama_client.pull(model_name)
                
                # Add to registry
                self.models[model_name] = ModelInfo(
                    name=model_name,
                    format=ModelFormat.GGUF,
                    config={'dynamically_loaded': True}
                )
                logger.info(f"Successfully loaded Ollama model: {model_name}")
                return
            except Exception as e:
                logger.warning(f"Could not load Ollama model {model_name}: {e}")
        
        # Try as embedding model
        if model_name.startswith('embedding-') or 'embed' in model_name.lower():
            base_name = model_name.replace('embedding-', '')
            await self._load_embedding_model(base_name)
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List all available models"""
        models = []
        for name, info in self.models.items():
            models.append({
                'id': name,
                'object': 'model',
                'created': 1677610602,  # Unix timestamp
                'owned_by': 'localai-plus',
                'permission': [],
                'root': name,
                'parent': None,
                'format': info.format.value,
                'loaded': info.loaded,
                'config': info.config
            })
        return models
    
    async def generate_chat(self, model_name: str, messages: List[Dict], **kwargs):
        """Generate chat completion"""
        model = await self.get_model(model_name)
        if not model:
            raise ValueError(f"Model {model_name} not found")
        
        if model.format == ModelFormat.GGUF and self.ollama_client:
            return await self.ollama_client.chat(
                model=model_name,
                messages=messages,
                stream=kwargs.get('stream', False),
                **{k: v for k, v in kwargs.items() if k != 'stream'}
            )
        else:
            raise ValueError(f"Unsupported model format: {model.format}")
    
    async def generate_embedding(self, model_name: str, texts: List[str]) -> List[List[float]]:
        """Generate embeddings"""
        # Handle embedding model prefix
        if model_name.startswith('embedding-'):
            base_name = model_name.replace('embedding-', '')
        else:
            base_name = model_name
        
        if base_name not in self.embedding_models:
            await self._load_embedding_model(base_name)
        
        if base_name in self.embedding_models:
            embeddings = self.embedding_models[base_name].encode(texts)
            return embeddings.tolist()
        else:
            raise ValueError(f"Embedding model {model_name} not available")
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up model registry...")
        # Close any open connections, cleanup models, etc.
        self.models.clear()
        self.embedding_models.clear()