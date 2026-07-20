import logging
import time
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("sentinel.redis")

class RedisClient:
    """
    Redis client wrapper supporting token blacklisting and rate limiting
    with an automatic in-memory fallback for local/test environments.
    """
    def __init__(self):
        self._client = None
        self._in_memory_blacklist = {}
        self._in_memory_rate_limits = {}
        self._is_redis_available = False
        self._init_client()

    def _init_client(self):
        if settings.REDIS_URL:
            try:
                import redis
                self._client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                # Quick connection check
                self._client.ping()
                self._is_redis_available = True
                logger.info("Successfully connected to Redis server.")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}). Operating with in-memory fallback.")
                self._client = None
                self._is_redis_available = False

    def blacklist_token(self, token: str, expire_seconds: int = 3600) -> bool:
        """Add a token to the blacklist (e.g. on logout or revocation)."""
        if self._is_redis_available and self._client:
            try:
                self._client.setex(f"blacklist:{token}", expire_seconds, "revoked")
                return True
            except Exception as e:
                logger.error(f"Redis blacklist error: {e}")

        # In-memory fallback
        expiry_time = time.time() + expire_seconds
        self._in_memory_blacklist[token] = expiry_time
        return True

    def is_blacklisted(self, token: str) -> bool:
        """Check if a token has been blacklisted."""
        if self._is_redis_available and self._client:
            try:
                val = self._client.get(f"blacklist:{token}")
                return val is not None
            except Exception as e:
                logger.error(f"Redis read error: {e}")

        # In-memory fallback cleanup & check
        now = time.time()
        # Clean expired
        self._in_memory_blacklist = {
            t: exp for t, exp in self._in_memory_blacklist.items() if exp > now
        }
        return token in self._in_memory_blacklist

    def check_rate_limit(self, key: str, limit: int = 100, window_seconds: int = 60) -> bool:
        """
        Simple fixed-window rate limiter.
        Returns True if request is ALLOWED, False if limit EXCEEDED.
        """
        now = int(time.time())
        window_key = f"ratelimit:{key}:{now // window_seconds}"

        if self._is_redis_available and self._client:
            try:
                current = self._client.incr(window_key)
                if current == 1:
                    self._client.expire(window_key, window_seconds)
                return current <= limit
            except Exception as e:
                logger.error(f"Redis rate limit error: {e}")

        # In-memory fallback
        bucket = self._in_memory_rate_limits.get(window_key, 0) + 1
        self._in_memory_rate_limits[window_key] = bucket
        return bucket <= limit

redis_client = RedisClient()
