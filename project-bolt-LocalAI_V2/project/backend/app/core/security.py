"""
Security utilities for LocalAI+
"""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handler
security = HTTPBearer()

class SecurityManager:
    """Security manager for authentication and authorization"""
    
    def __init__(self):
        self.api_keys: Dict[str, Dict[str, Any]] = {}
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
    
    def generate_api_key(self) -> str:
        """Generate a new API key"""
        return f"sk-{secrets.token_urlsafe(32)}"
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.PyJWTError as e:
            logger.warning(f"Invalid token: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def verify_api_key(self, api_key: str) -> Dict[str, Any]:
        """Verify an API key"""
        # In production, this would check against database
        # For now, we'll use a simple in-memory store
        if api_key in self.api_keys:
            return self.api_keys[api_key]
        
        # Default API key for development
        if api_key == "sk-dev-key" or api_key.startswith("sk-"):
            return {
                "user_id": "default",
                "name": "Development Key",
                "permissions": ["*"],
                "rate_limit": settings.RATE_LIMIT_REQUESTS
            }
        
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    def check_rate_limit(self, identifier: str, limit: int = None) -> bool:
        """Check if request is within rate limit"""
        if limit is None:
            limit = settings.RATE_LIMIT_REQUESTS
        
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=settings.RATE_LIMIT_WINDOW)
        
        if identifier not in self.rate_limits:
            self.rate_limits[identifier] = {"requests": [], "blocked_until": None}
        
        user_limits = self.rate_limits[identifier]
        
        # Check if user is currently blocked
        if user_limits["blocked_until"] and now < user_limits["blocked_until"]:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Clean old requests
        user_limits["requests"] = [
            req_time for req_time in user_limits["requests"] 
            if req_time > window_start
        ]
        
        # Check rate limit
        if len(user_limits["requests"]) >= limit:
            user_limits["blocked_until"] = now + timedelta(minutes=5)  # Block for 5 minutes
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
        # Add current request
        user_limits["requests"].append(now)
        return True

# Global security manager instance
security_manager = SecurityManager()

# Dependency for API key authentication
async def get_api_key_auth(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """Dependency to verify API key authentication"""
    try:
        api_key = credentials.credentials
        user_info = security_manager.verify_api_key(api_key)
        
        # Check rate limit
        security_manager.check_rate_limit(
            user_info["user_id"], 
            user_info.get("rate_limit", settings.RATE_LIMIT_REQUESTS)
        )
        
        return user_info
    except Exception as e:
        logger.warning(f"Authentication failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Optional authentication (for public endpoints)
async def get_optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[Dict[str, Any]]:
    """Optional authentication dependency"""
    if not credentials:
        return None
    
    try:
        return await get_api_key_auth(credentials)
    except HTTPException:
        return None