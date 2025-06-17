import redis.asyncio as redis
import json
import logging
from typing import Optional, Any, Dict
from datetime import timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisService:
    """Redis service for caching and session management"""
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.redis.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Could not connect to Redis: {e}")
            self.redis = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis:
            return None
        
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Error getting key {key}: {e}")
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        if not self.redis:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            if ttl:
                await self.redis.setex(key, ttl, serialized)
            else:
                await self.redis.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Error setting key {key}: {e}")
            return False
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.redis:
            return False
        
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting key {key}: {e}")
            return False
    
    async def increment_rate_limit(self, key: str, window: int = 3600) -> int:
        """Increment rate limit counter"""
        if not self.redis:
            return 0
        
        try:
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, window)
            results = await pipe.execute()
            return results[0]
        except Exception as e:
            logger.error(f"Error incrementing rate limit {key}: {e}")
            return 0
    
    async def get_chat_context(self, session_id: str) -> Optional[Dict]:
        """Get chat context from cache"""
        return await self.get(f"chat_context:{session_id}")
    
    async def set_chat_context(self, session_id: str, context: Dict, ttl: int = 3600):
        """Set chat context in cache"""
        await self.set(f"chat_context:{session_id}", context, ttl)
    
    async def store_function_result(self, call_id: str, result: Any, ttl: int = 300):
        """Store function call result"""
        await self.set(f"function_result:{call_id}", result, ttl)
    
    async def get_function_result(self, call_id: str) -> Optional[Any]:
        """Get function call result"""
        return await self.get(f"function_result:{call_id}")