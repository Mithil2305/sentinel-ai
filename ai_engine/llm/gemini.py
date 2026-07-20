import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("sentinel.llm.gemini")

class GeminiClient:
    """Google Gemini API client integration."""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def generate(self, prompt: str) -> Optional[str]:
        if not self.api_key:
            logger.warning("Gemini API key not configured.")
            return None

        try:
            url = f"{self.base_url}?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    logger.error(f"Gemini API error ({resp.status_code}): {resp.text}")
                    return None
        except Exception as e:
            logger.error(f"Gemini client exception: {e}")
            return None

gemini_client = GeminiClient()
