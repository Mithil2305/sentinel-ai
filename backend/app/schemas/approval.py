from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApprovalActionRequest(BaseModel):
    approver_notes: Optional[str] = None

class ApprovalOut(BaseModel):
    id: str
    incident_id: str
    server_id: str
    severity: str
    proposed_action: str
    script_to_run: str
    risk_explanation: str
    status: str
    approver_notes: Optional[str] = None
    executed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
