import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings"""
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-this", env="SECRET_KEY")
    API_KEYS: List[str] = Field(default=["localai-plus-default-key"], env="API_KEYS")
    REQUIRE_AUTH: bool = Field(default=True, env="REQUIRE_AUTH")
    ALLOWED_ORIGINS: List[str] = Field(default=["*"], env="ALLOWED_ORIGINS")
    ALLOWED_HOSTS: List[str] = Field(default=["*"], env="ALLOWED_HOSTS")
    
    # Database
    DATABASE_URL: str = Field(default="postgresql://user:pass@localhost/localai", env="DATABASE_URL")
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Model services
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    VLLM_BASE_URL: Optional[str] = Field(default=None, env="VLLM_BASE_URL")
    
    # Vector database
    QDRANT_URL: str = Field(default="http://localhost:6333", env="QDRANT_URL")
    CHROMA_PERSIST_DIR: str = Field(default="./chroma_db", env="CHROMA_PERSIST_DIR")
    
    # Model settings
    DEFAULT_MODEL: str = Field(default="llama2:7b", env="DEFAULT_MODEL")
    DEFAULT_EMBEDDING_MODEL: str = Field(default="all-MiniLM-L6-v2", env="DEFAULT_EMBEDDING_MODEL")
    MAX_CONTEXT_LENGTH: int = Field(default=4096, env="MAX_CONTEXT_LENGTH")
    MAX_CONCURRENT_REQUESTS: int = Field(default=10, env="MAX_CONCURRENT_REQUESTS")
    
    # Code execution
    ENABLE_CODE_EXECUTION: bool = Field(default=True, env="ENABLE_CODE_EXECUTION")
    CODE_EXECUTION_TIMEOUT: int = Field(default=30, env="CODE_EXECUTION_TIMEOUT")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    # RAG settings
    RAG_CHUNK_SIZE: int = Field(default=1000, env="RAG_CHUNK_SIZE")
    RAG_CHUNK_OVERLAP: int = Field(default=200, env="RAG_CHUNK_OVERLAP")
    RAG_TOP_K: int = Field(default=5, env="RAG_TOP_K")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()