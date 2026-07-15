from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    incident_id: str
    format: str = "PDF" # PDF, MARKDOWN, HTML

class ReportOut(BaseModel):
    id: str
    incident_id: str
    title: str
    format: str
    content: Optional[str] = None
    download_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
