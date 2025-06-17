"""
Configuration management for LocalAI+
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/v1"
    PROJECT_NAME: str = "LocalAI+"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    API_KEYS: List[str] = ["test-key-12345"]  # Add your API keys here
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "mistral:latest"
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7
    
    # Vector Store Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    VECTOR_COLLECTION_NAME: str = "localai_embeddings"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Code Interpreter Configuration
    CODE_TIMEOUT: int = 30  # seconds
    CODE_MEMORY_LIMIT: int = 128  # MB
    ENABLE_CODE_EXECUTION: bool = True
    PYTHON_PACKAGES_WHITELIST: List[str] = [
        "numpy", "pandas", "matplotlib", "scipy", "requests", 
        "json", "math", "random", "datetime", "os", "sys"
    ]
    
    # Plugin Configuration
    PLUGINS_DIRECTORY: str = "plugins"
    MAX_TOOL_EXECUTION_TIME: int = 30
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./localai.db"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()