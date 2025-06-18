"""
Vector store service using Qdrant
"""

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
from typing import List, Dict, Any, Optional
import uuid
import structlog

from core.config import settings

logger = structlog.get_logger()

class VectorStoreService:
    """Service for vector storage and similarity search using Qdrant"""
    
    def __init__(self):
        self.client = AsyncQdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            api_key=settings.QDRANT_API_KEY,
            https=settings.QDRANT_USE_HTTPS
        )
        self.collection_name = settings.VECTOR_COLLECTION_NAME
    
    async def initialize(self):
        """Initialize vector store and create collections"""
        try:
            # Check if collection exists
            collections = await self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                # Create collection
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=384,  # Dimension for sentence-transformers/all-MiniLM-L6-v2
                        distance=models.Distance.COSINE
                    )
                )
                logger.info("Created vector collection", collection=self.collection_name)
            
        except Exception as e:
            logger.error("Failed to initialize vector store", error=str(e))
            raise
    
    async def health_check(self) -> bool:
        """Check if vector store is healthy"""
        try:
            collections = await self.client.get_collections()
            return True
        except Exception as e:
            logger.error("Vector store health check failed", error=str(e))
            return False
    
    async def store(
        self,
        embedding: List[float],
        metadata: Dict[str, Any],
        collection_name: Optional[str] = None
    ) -> str:
        """Store embedding with metadata"""
        try:
            collection = collection_name or self.collection_name
            doc_id = str(uuid.uuid4())
            
            # Upsert point
            await self.client.upsert(
                collection_name=collection,
                points=[
                    models.PointStruct(
                        id=doc_id,
                        vector=embedding,
                        payload=metadata
                    )
                ]
            )
            
            return doc_id
            
        except Exception as e:
            logger.error("Failed to store embedding", error=str(e))
            raise
    
    async def search(
        self,
        query_embedding: List[float],
        collection_name: Optional[str] = None,
        limit: int = 10,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors"""
        try:
            collection = collection_name or self.collection_name
            
            search_result = await self.client.search(
                collection_name=collection,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold
            )
            
            results = []
            for hit in search_result:
                results.append({
                    "id": hit.id,
                    "score": hit.score,
                    "metadata": hit.payload
                })
            
            return results
            
        except Exception as e:
            logger.error("Vector search failed", error=str(e))
            raise
    
    async def delete(self, doc_ids: List[str], collection_name: Optional[str] = None):
        """Delete documents by IDs"""
        try:
            collection = collection_name or self.collection_name
            
            await self.client.delete(
                collection_name=collection,
                points_selector=models.PointIdsList(
                    points=doc_ids
                )
            )
            
        except Exception as e:
            logger.error("Failed to delete embeddings", error=str(e))
            raise
    
    async def get_collection_info(self, collection_name: Optional[str] = None) -> Dict[str, Any]:
        """Get collection information"""
        try:
            collection = collection_name or self.collection_name
            info = await self.client.get_collection(collection_name=collection)
            
            return {
                "name": collection,
                "vectors_count": info.vectors_count,
                "indexed_vectors_count": info.indexed_vectors_count,
                "points_count": info.points_count,
                "config": {
                    "vector_size": info.config.params.vector_size,
                    "distance": info.config.params.distance.value
                }
            }
            
        except Exception as e:
            logger.error("Failed to get collection info", error=str(e))
            raise