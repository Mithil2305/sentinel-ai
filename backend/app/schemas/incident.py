from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class IncidentCreate(BaseModel):
    server_id: str
    title: str
    matched_rule: str
    raw_log: Dict[str, Any]

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None

class IncidentOut(BaseModel):
    id: str
    server_id: str
    title: str
    matched_rule: str
    mitre_technique: str
    status: str
    severity: str
    raw_log: Optional[Dict[str, Any]] = None
    details: Optional[Dict[str, Any]] = None
    remediation: Optional[Dict[str, Any]] = None
    timeline: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginationMeta(BaseModel):
    total_count: int
    page: int
    limit: int
    total_pages: int

class IncidentListResponse(BaseModel):
    incidents: List[IncidentOut]
    pagination: PaginationMeta
