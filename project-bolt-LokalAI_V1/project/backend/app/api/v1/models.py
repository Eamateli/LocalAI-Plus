from typing import List, Dict, Any
from fastapi import APIRouter, Request
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int
    owned_by: str
    permission: List[Dict[str, Any]] = []
    root: str
    parent: str = None

class ModelsResponse(BaseModel):
    object: str = "list"
    data: List[ModelInfo]

@router.get("/models", response_model=ModelsResponse)
async def list_models(request: Request):
    """List available models"""
    
    try:
        model_registry = request.app.state.model_registry
        models = await model_registry.list_models()
        
        return ModelsResponse(data=models)
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        return ModelsResponse(data=[])

@router.get("/models/{model_id}")
async def get_model(model_id: str, request: Request):
    """Get specific model information"""
    
    try:
        model_registry = request.app.state.model_registry
        model = await model_registry.get_model(model_id)
        
        if not model:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Model not found")
        
        return {
            "id": model.name,
            "object": "model",
            "created": 1677610602,
            "owned_by": "localai-plus",
            "permission": [],
            "root": model.name,
            "parent": None,
            "format": model.format.value,
            "loaded": model.loaded,
            "config": model.config
        }
        
    except Exception as e:
        logger.error(f"Error getting model {model_id}: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))