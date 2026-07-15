from pydantic import BaseModel
from typing import Optional

class ProblemDetails(BaseModel):
    type: str = "https://api.sentinelai.local/errors/general"
    title: str
    status: int
    detail: str
    instance: Optional[str] = None
    error_code: str
    timestamp: str
