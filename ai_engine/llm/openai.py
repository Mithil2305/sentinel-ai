import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("sentinel.llm.openai")

class OpenAIClient:
    """OpenAI API client integration."""
    
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"

    async def generate(self, prompt: str, model: str = "gpt-4o-mini") -> Optional[str]:
        if not self.api_key:
            logger.warning("OpenAI API key not configured.")
            return None

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.base_url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
                else:
                    logger.error(f"OpenAI API error ({resp.status_code}): {resp.text}")
                    return None
        except Exception as e:
            logger.error(f"OpenAI client exception: {e}")
            return None

openai_client = OpenAIClient()
