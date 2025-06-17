"""
Models endpoint - compatible with OpenAI API
"""
import time
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
import logging

from app.core.security import get_optional_auth
from app.services.model_registry import ModelRegistry

logger = logging.getLogger(__name__)
router = APIRouter()

# Global model registry instance
model_registry = ModelRegistry()

@router.get("/models")
async def list_models(user_info: Dict[str, Any] = Depends(get_optional_auth)):
    """
    List available models.
    Compatible with OpenAI's /v1/models endpoint.
    """
    try:
        models = await model_registry.get_available_models()
        
        return {
            "object": "list",
            "data": models
        }
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve models")

@router.get("/models/{model_id}")
async def get_model(
    model_id: str,
    user_info: Dict[str, Any] = Depends(get_optional_auth)
):
    """
    Get details about a specific model.
    Compatible with OpenAI's /v1/models/{model} endpoint.
    """
    try:
        models = await model_registry.get_available_models()
        
        for model in models:
            if model["id"] == model_id:
                return model
        
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve model")