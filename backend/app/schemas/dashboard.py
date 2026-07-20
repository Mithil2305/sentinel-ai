from pydantic import BaseModel
from typing import Dict, List, Optional

class SeverityBreakdown(BaseModel):
    CRITICAL: int = 0
    HIGH: int = 0
    MEDIUM: int = 0
    LOW: int = 0

class DashboardStatsResponse(BaseModel):
    total_incidents: int
    open_count: int
    remediating_count: int
    pending_approval_count: int
    resolved_count: int
    severity_breakdown: SeverityBreakdown
    total_servers: int
    online_servers: int

class MitreTechniqueEntry(BaseModel):
    technique_id: str
    name: str
    tactic: str
    description: str
    incident_count: int

class MitreMatrixResponse(BaseModel):
    matrix: List[MitreTechniqueEntry]
