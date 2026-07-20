import time
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("sentinel.ai.memory")

class AgentMemoryStore:
    """
    In-memory context store holding short-term investigation state and past IoC findings for AI agents.
    """
    def __init__(self, ttl_seconds: int = 3600):
        self._store: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def store_context(self, key: str, value: Dict[str, Any]):
        self._store[key] = {
            "data": value,
            "timestamp": time.time()
        }

    def get_context(self, key: str) -> Optional[Dict[str, Any]]:
        record = self._store.get(key)
        if not record:
            return None

        if time.time() - record["timestamp"] > self.ttl_seconds:
            del self._store[key]
            return None

        return record["data"]

    def list_keys(self) -> List[str]:
        return list(self._store.keys())

memory_store = AgentMemoryStore()
