from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ServerCreate(BaseModel):
    hostname: str
    ip_address: str
    os: str
    specs: Optional[Dict[str, Any]] = None

class ServerUpdate(BaseModel):
    hostname: Optional[str] = None
    status: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None

class ServerOut(BaseModel):
    id: str
    hostname: str
    ip_address: str
    os: str
    specs: Dict[str, Any]
    agent_version: str
    status: str
    last_ping: datetime
    agent_token: Optional[str] = None

    class Config:
        from_attributes = True
